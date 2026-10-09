from datetime import date
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from animals.models.animal import Animal
from animals.models.animal_access import AnimalAccess
from animals.models.horse import Horse
from media_library.models import AnimalMedia
from marketplace.models import SaleListing


class MarketplaceTests(TestCase):
    def setUp(self):
        users = get_user_model().objects
        self.staff = users.create_user(username='staff', is_staff=True)
        self.other = users.create_user(username='other', is_staff=True)
        self.viewer = users.create_user(username='viewer', is_staff=True)
        self.manager = users.create_user(username='manager', is_staff=True)
        self.nonstaff = users.create_user(username='nonstaff')
        self.root = users.create_user(username='root', is_staff=True, is_superuser=True)
        self.animal = Horse.objects.create(name='Horse', public=True, created_by=self.staff, notes='PRIVATE HORSE NOTES')
        self.foreign = Animal.objects.create(name='Other', species='cattle', public=True, created_by=self.other)
        AnimalAccess.objects.create(animal=self.animal, user=self.viewer, role='viewer', can_edit_profile=True)
        AnimalAccess.objects.create(animal=self.animal, user=self.manager, role='manager', can_edit_profile=True)
        AnimalAccess.objects.create(animal=self.animal, user=self.nonstaff, role='owner', can_edit_profile=True)
        self.listing = SaleListing.objects.create(animal=self.animal, title='Horse for sale', description='Public story',
            price=Decimal('12000'), contact_user=self.staff, published=True,
            actual_sale_price=Decimal('10000'), buyer_name='PRIVATE BUYER', buyer_email='buyer@example.com',
            buyer_phone='PRIVATE PHONE', sale_date=date(2026, 1, 1), internal_notes='PRIVATE NOTES')
        self.media = AnimalMedia.objects.create(animal=self.animal, public=True, media_type='image', file='horse.jpg', uploaded_by=self.staff)
        self.listing.gallery.add(self.media)
        self.client = APIClient()
        self.public = reverse('sale-listing-list')
        self.detail = reverse('sale-listing-detail', args=[self.listing.pk])
        self.manage = reverse('manage-sale-listing-list')
        self.edit = reverse('manage-sale-listing-detail', args=[self.listing.pk])

    def test_public_allowlist_and_gallery(self):
        data = self.client.get(self.detail).data
        self.assertEqual(set(data), {'id', 'title', 'description', 'animal', 'status', 'featured', 'show_price', 'price', 'gallery'})
        self.assertEqual(set(data['animal']), {'id', 'slug', 'name', 'species', 'sex', 'birth_date', 'color'})
        self.assertEqual(set(data['gallery'][0]), {'id', 'media_type', 'url', 'caption', 'sort_order'})
        self.assertNotIn('PRIVATE', str(data))
        self.assertEqual(data['price'], '12000.00')
        self.assertEqual(data['animal']['species'], 'horse')
        self.assertEqual(self.client.get(self.public).data['count'], 1)

    def test_hidden_and_unspecified_price(self):
        self.listing.show_price = False
        self.listing.save()
        self.assertNotIn('price', self.client.get(self.detail).data)
        self.assertNotIn('12000', str(self.client.get(self.public).data))
        self.listing.show_price = True
        self.listing.price = None
        self.listing.save()
        self.assertIsNone(self.client.get(self.detail).data['price'])

    def test_visibility_at_list_and_detail_even_for_staff(self):
        for field, value in [('published', False), ('active', False)]:
            SaleListing.objects.filter(pk=self.listing.pk).update(**{field: value})
            for user in [None, self.staff, self.root]:
                self.client.force_authenticate(user)
                self.assertEqual(self.client.get(self.detail).status_code, 404)
                self.assertEqual(self.client.get(self.public).data['count'], 0)
            SaleListing.objects.filter(pk=self.listing.pk).update(**{field: True})
        Animal.objects.filter(pk=self.animal.pk).update(public=False)
        self.assertEqual(self.client.get(self.detail).status_code, 404)
        self.assertEqual(self.client.get(self.public).data['count'], 0)

    def test_status_browse_and_sold_detail(self):
        for status, count in [('available', 1), ('pending', 1), ('sold', 0)]:
            self.listing.status = status
            self.listing.save()
            self.assertEqual(self.client.get(self.public).data['count'], count)
            self.assertEqual(self.client.get(self.detail).data['status'], status)
            self.assertEqual(self.client.get(self.public, {'status': status}).data['count'], 1)
            self.assertEqual(self.client.get(self.public, {'status': 'all'}).data['count'], 1)
        self.assertEqual(self.client.get(self.public, {'status': 'draft'}).status_code, 400)
        self.animal.refresh_from_db()
        self.assertEqual(self.animal.status, 'active')

    def test_public_write_methods_denied(self):
        for user in [None, self.staff]:
            self.client.force_authenticate(user)
            for method, url in [('post', self.public), ('patch', self.detail), ('put', self.detail), ('delete', self.detail)]:
                self.assertEqual(getattr(self.client, method)(url, {}, format='json').status_code, 405)

    def test_staff_and_animal_access_boundaries(self):
        self.assertIn(self.client.get(self.manage).status_code, [401, 403])
        self.assertIn(self.client.patch(self.edit, {'title': 'Denied'}).status_code, [401, 403])
        self.client.force_authenticate(self.nonstaff)
        self.assertEqual(self.client.get(self.manage).status_code, 403)
        self.assertEqual(self.client.patch(self.edit, {'title': 'Denied'}).status_code, 403)
        for user in [self.other, self.viewer]:
            self.client.force_authenticate(user)
            self.assertEqual(self.client.get(self.manage).data['count'], 0)
            self.assertEqual(self.client.get(self.edit).status_code, 404)
            self.assertEqual(self.client.patch(self.edit, {'title': 'Denied'}).status_code, 404)
        for user in [self.staff, self.manager, self.root]:
            self.client.force_authenticate(user)
            self.assertEqual(self.client.get(self.edit).data['buyer_name'], 'PRIVATE BUYER')
            self.assertEqual(self.client.patch(self.edit, {'title': 'Allowed'}, format='json').status_code, 200)
        AnimalAccess.objects.filter(user=self.manager).update(active=False)
        self.client.force_authenticate(self.manager)
        self.assertEqual(self.client.get(self.edit).status_code, 404)

    def test_create_and_unpublished_management(self):
        self.client.force_authenticate(self.other)
        data = {'animal': self.foreign.pk, 'title': 'Cattle', 'description': 'Story', 'contact_user': self.staff.pk}
        response = self.client.post(self.manage, data, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertFalse(response.data['published'])
        self.assertEqual(response.data['contact_user'], self.other.pk)
        self.assertEqual(response.data['status'], 'available')
        listing = SaleListing.objects.get(pk=response.data['id'])
        self.assertEqual(self.client.get(reverse('sale-listing-detail', args=[listing.pk])).status_code, 404)
        self.assertEqual(self.client.post(self.manage, data, format='json').status_code, 400)
        self.client.force_authenticate(self.staff)
        self.assertEqual(self.client.post(self.manage, {'animal': self.foreign.pk, 'title': 'X', 'description': 'X'}, format='json').status_code, 400)

    def test_model_and_api_validation(self):
        self.client.force_authenticate(self.staff)
        for field, value in [('price', '-1'), ('actual_sale_price', '-1'), ('status', 'invalid')]:
            self.assertEqual(self.client.patch(self.edit, {field: value}, format='json').status_code, 400)
            setattr(self.listing, field, value)
            with self.assertRaises(ValidationError):
                self.listing.save()
            self.listing.refresh_from_db()
        Animal.objects.filter(pk=self.animal.pk).update(public=False)
        self.listing.animal.refresh_from_db()
        with self.assertRaises(ValidationError):
            self.listing.save()
        self.assertEqual(self.client.patch(self.edit, {'published': True}, format='json').status_code, 400)
        self.assertEqual(self.client.patch(self.edit, {'published': False}, format='json').status_code, 200)

    def test_database_constraints(self):
        for values in [{'price': -1}, {'actual_sale_price': -1}, {'status': 'invalid'}]:
            with self.assertRaises(IntegrityError), transaction.atomic():
                SaleListing.objects.filter(pk=self.listing.pk).update(**values)

    def test_reassignment_and_deletion_denied(self):
        self.client.force_authenticate(self.root)
        self.assertEqual(self.client.patch(self.edit, {'animal': self.foreign.pk}, format='json').status_code, 400)
        self.assertEqual(self.client.delete(self.edit).status_code, 405)
        self.assertTrue(SaleListing.objects.filter(pk=self.listing.pk).exists())

    def test_gallery_validation_and_revocation(self):
        self.client.force_authenticate(self.staff)
        for attrs in [dict(public=False), dict(media_type='document'), dict(object_id=42)]:
            media = AnimalMedia.objects.create(animal=self.animal, public=True, media_type='image', file='x.jpg', uploaded_by=self.staff)
            AnimalMedia.objects.filter(pk=media.pk).update(**attrs)
            self.assertEqual(self.client.patch(self.edit, {'gallery': [media.pk]}, format='json').status_code, 400)
        foreign = AnimalMedia.objects.create(animal=self.foreign, public=True, media_type='image', file='foreign.jpg', uploaded_by=self.other)
        self.client.force_authenticate(self.root)
        self.assertEqual(self.client.patch(self.edit, {'gallery': [foreign.pk]}, format='json').status_code, 400)
        self.assertEqual(self.client.patch(self.edit, {'gallery': [self.media.pk]}, format='json').status_code, 200)
        for attrs in [dict(public=False), dict(animal=self.foreign), dict(media_type='document'), dict(object_id=42)]:
            AnimalMedia.objects.filter(pk=self.media.pk).update(**attrs)
            self.assertEqual(self.client.get(self.detail).data['gallery'], [])
            AnimalMedia.objects.filter(pk=self.media.pk).update(public=True, animal=self.animal, media_type='image', object_id=None)
        AnimalMedia.objects.filter(pk=self.media.pk).update(public=False)
        self.assertEqual(self.client.patch(self.edit, {'published': False}, format='json').status_code, 200)
        self.assertEqual(self.client.patch(self.edit, {'published': True}, format='json').status_code, 400)
        self.assertEqual(self.client.patch(self.edit, {'gallery': [], 'published': True}, format='json').status_code, 200)
        self.assertEqual(self.client.get(self.detail).data['gallery'], [])

    def test_pagination_and_gallery_query_count(self):
        for index in range(22):
            animal = Animal.objects.create(name=f'Animal {index}', species='horse', public=True, created_by=self.staff)
            SaleListing.objects.create(animal=animal, title=f'Listing {index}', description='Public', contact_user=self.staff, published=True)
        with self.assertNumQueries(3):
            response = self.client.get(self.public)
        self.assertEqual(response.data['count'], 23)
        self.assertEqual(len(response.data['results']), 20)
        self.assertEqual(len(self.client.get(self.public, {'page': 2}).data['results']), 3)

    def test_admin_scope_and_private_fields(self):
        permissions = Permission.objects.filter(content_type__app_label='marketplace', content_type__model='salelisting')
        for user in [self.staff, self.other, self.manager]:
            user.user_permissions.set(permissions)
        url = reverse('admin:marketplace_salelisting_change', args=[self.listing.pk])
        self.client.force_login(self.other)
        response = self.client.get(url)
        self.assertNotContains(response, 'PRIVATE BUYER', status_code=response.status_code)
        self.client.force_login(self.manager)
        self.assertContains(self.client.get(url), 'PRIVATE BUYER')
        self.assertEqual(self.client.get(reverse('admin:marketplace_salelisting_delete', args=[self.listing.pk])).status_code, 403)


from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase


class ListingMigrationTests(TransactionTestCase):
    def test_additive_upgrade_and_reverse_preserves_legacy_identity(self):
        original_targets = MigrationExecutor(connection).loader.graph.leaf_nodes()
        legacy_targets = [(app, name if app != "marketplace" else "0001_initial") for app, name in original_targets]
        try:
            executor = MigrationExecutor(connection)
            executor.migrate(legacy_targets)
            apps = executor.loader.project_state(legacy_targets).apps
            User = apps.get_model("accounts", "User")
            AnimalModel = apps.get_model("animals", "Animal")
            Listing = apps.get_model("marketplace", "SaleListing")
            user = User.objects.create(username="legacy")
            ids = []
            for active in [True, False]:
                animal = AnimalModel.objects.create(name=f"Legacy {active}", slug=f"legacy-{active}", species="horse", created_by=user, public=True)
                listing = Listing.objects.create(animal=animal, title="Legacy", description="Legacy", contact_user=user, active=active)
                ids.append(listing.pk)
            # Preflight refuses invalid legacy prices without modifying them.
            Listing.objects.filter(pk=ids[0]).update(price=-1)
            with self.assertRaisesMessage(RuntimeError, "Negative legacy listing prices"):
                MigrationExecutor(connection).migrate(original_targets)
            self.assertEqual(Listing.objects.get(pk=ids[0]).price, Decimal("-1"))
            Listing.objects.filter(pk=ids[0]).update(price=None)
            executor = MigrationExecutor(connection)
            executor.migrate(original_targets)
            self.assertEqual(list(SaleListing.objects.filter(pk__in=ids).order_by("pk").values_list("active", flat=True)), [True, False])
            self.assertEqual(SaleListing.objects.filter(pk__in=ids, published=False, status="available").count(), 2)
            self.assertEqual(APIClient().get(reverse("sale-listing-list")).data["count"], 0)
            executor = MigrationExecutor(connection)
            executor.migrate(legacy_targets)
            apps = executor.loader.project_state(legacy_targets).apps
            self.assertEqual(list(apps.get_model("marketplace", "SaleListing").objects.order_by("pk").values_list("pk", flat=True)), ids)
        finally:
            MigrationExecutor(connection).migrate(original_targets)
