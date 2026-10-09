from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from animals.models.animal import Animal
from animals.models.animal_access import AnimalAccess
from media_library.models import AnimalMedia
from marketplace.models import SaleListing


class ListingDashboardTests(TestCase):
    def setUp(self):
        users = get_user_model().objects
        self.owner = users.create_user(username='listing-owner', is_staff=True)
        self.unrelated = users.create_user(username='listing-other', is_staff=True)
        self.viewer = users.create_user(username='listing-viewer', is_staff=True)
        self.nonstaff = users.create_user(username='listing-nonstaff')
        self.animal = Animal.objects.create(name='Dashboard horse', species='horse', public=True, created_by=self.owner, description='PRIVATE HISTORY')
        self.foreign = Animal.objects.create(name='Other horse', species='horse', public=True, created_by=self.unrelated)
        AnimalAccess.objects.create(animal=self.animal, user=self.viewer, role='viewer')
        self.public_media = AnimalMedia.objects.create(animal=self.animal, uploaded_by=self.owner, public=True, media_type='image', file='gallery.jpg', caption='Public photo', description='PRIVATE MEDIA DESCRIPTION')
        self.client = APIClient()
        self.animals_url = reverse('listing-animal-options-list')
        self.media_url = reverse('listing-media-options-list')
        self.listings_url = reverse('manage-sale-listing-list')

    def test_selectors_require_staff_and_animal_permission(self):
        for url in [self.animals_url, self.media_url]:
            self.assertIn(self.client.get(url, {'animal': self.animal.pk}).status_code, [401, 403])
            self.client.force_authenticate(self.nonstaff)
            self.assertEqual(self.client.get(url, {'animal': self.animal.pk}).status_code, 403)
            self.client.force_authenticate(None)
        self.client.force_authenticate(self.unrelated)
        self.assertEqual([item['id'] for item in self.client.get(self.animals_url).data['results']], [self.foreign.pk])
        self.assertEqual(self.client.get(self.media_url, {'animal': self.animal.pk}).status_code, 404)
        self.client.force_authenticate(self.viewer)
        self.assertEqual(self.client.get(self.animals_url).data['count'], 0)
        self.assertEqual(self.client.get(self.media_url, {'animal': self.animal.pk}).status_code, 404)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.get(self.media_url, {'animal': self.animal.pk}).data['count'], 1)
        AnimalAccess.objects.filter(user=self.viewer).update(role='manager', can_edit_profile=True)
        self.client.force_authenticate(self.viewer)
        self.assertEqual(self.client.get(self.animals_url).data['count'], 1)
        self.assertEqual(self.client.get(self.media_url, {'animal': self.animal.pk}).data['count'], 1)

    def test_selector_allowlists_filters_and_public_media_only(self):
        self.client.force_authenticate(self.owner)
        AnimalMedia.objects.create(animal=self.animal, uploaded_by=self.owner, public=False, media_type='image', file='private.jpg')
        AnimalMedia.objects.create(animal=self.animal, uploaded_by=self.owner, public=True, media_type='document', file='document.pdf')
        AnimalMedia.objects.create(animal=self.animal, uploaded_by=self.owner, public=True, media_type='image', file='attachment.jpg', object_id=42)
        animal_data = self.client.get(self.animals_url, {'unlisted': 'true', 'search': 'Dashboard'}).data
        self.assertEqual(animal_data['count'], 1)
        self.assertNotIn('PRIVATE', str(animal_data))
        self.assertIsNone(animal_data['results'][0]['listing_id'])
        media_data = self.client.get(self.media_url, {'animal': self.animal.pk}).data
        self.assertEqual(media_data['count'], 1)
        self.assertEqual(set(media_data['results'][0]), {'id', 'media_type', 'url', 'caption', 'sort_order'})
        self.assertNotIn('PRIVATE', str(media_data))
        listing = SaleListing.objects.create(animal=self.animal, title='Listing', description='Public', contact_user=self.owner)
        self.assertEqual(self.client.get(self.animals_url, {'unlisted': 'true'}).data['count'], 0)
        self.assertEqual(self.client.get(self.animals_url, {'unlisted': 'false'}).data['results'][0]['listing_id'], listing.pk)
        for params in [{'unlisted': 'yes'}, {'search': 'x' * 101}]:
            self.assertEqual(self.client.get(self.animals_url, params).status_code, 400)
        for params in [{}, {'animal': 'wrong'}, {'animal': '-1'}, {'animal': '9' * 30}]:
            self.assertEqual(self.client.get(self.media_url, params).status_code, 400)

    def test_draft_publish_feature_private_records_and_unpublish(self):
        self.client.force_authenticate(self.owner)
        payload = {'animal': self.animal.pk, 'title': 'Dashboard sale', 'description': 'Public sales story',
                   'gallery': [self.public_media.pk], 'price': '9000.00', 'show_price': False,
                   'buyer_name': 'PRIVATE BUYER', 'internal_notes': 'PRIVATE NOTES', 'actual_sale_price': '8000.00'}
        response = self.client.post(self.listings_url, payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertFalse(response.data['published'])
        preview = response.data['public_preview']
        self.assertNotIn('price', preview)
        self.assertNotIn('PRIVATE', str(preview))
        self.assertEqual(preview['gallery'][0]['id'], self.public_media.pk)
        detail = reverse('manage-sale-listing-detail', args=[response.data['id']])
        public_detail = reverse('sale-listing-detail', args=[response.data['id']])
        self.assertEqual(self.client.get(public_detail).status_code, 404)
        self.assertEqual(self.client.patch(detail, {'published': True, 'featured': True}, format='json').status_code, 200)
        featured = self.client.get(reverse('sale-listing-list'), {'featured': 'true'}).data
        self.assertEqual(featured['count'], 1)
        self.assertNotIn('PRIVATE', str(featured))
        self.assertNotIn('price', featured['results'][0])
        self.assertEqual(self.client.patch(detail, {'status': 'pending'}, format='json').status_code, 200)
        self.assertEqual(self.client.patch(detail, {'status': 'sold'}, format='json').status_code, 200)
        self.assertEqual(self.client.get(reverse('sale-listing-list'), {'featured': 'true'}).data['count'], 0)
        AnimalMedia.objects.filter(pk=self.public_media.pk).update(public=False)
        self.assertEqual(self.client.get(detail).data['public_preview']['gallery'], [])
        self.assertEqual(self.client.patch(detail, {'published': False}, format='json').status_code, 200)
        self.assertEqual(self.client.get(public_detail).status_code, 404)
        self.assertTrue(SaleListing.objects.filter(pk=response.data['id']).exists())
        self.client.force_authenticate(self.unrelated)
        self.assertEqual(self.client.get(detail).status_code, 404)

    def test_private_animal_draft_cannot_publish_or_leak_preview(self):
        Animal.objects.filter(pk=self.animal.pk).update(public=False)
        self.client.force_authenticate(self.owner)
        response = self.client.post(self.listings_url, {'animal': self.animal.pk, 'title': 'Private animal draft', 'description': 'Public story'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.data['animal_summary']['public'])
        detail = reverse('manage-sale-listing-detail', args=[response.data['id']])
        self.assertEqual(self.client.patch(detail, {'published': True}, format='json').status_code, 400)
        self.client.force_authenticate(None)
        self.assertIn(self.client.get(detail).status_code, [401, 403])
        self.assertEqual(self.client.get(reverse('sale-listing-detail', args=[response.data['id']])).status_code, 404)

    def test_selectors_paginate_without_per_animal_queries(self):
        self.client.force_authenticate(self.owner)
        for index in range(23):
            Animal.objects.create(name=f'Option {index}', species='horse', created_by=self.owner)
        with self.assertNumQueries(2):
            response = self.client.get(self.animals_url)
        self.assertEqual(response.data['count'], 24)
        self.assertEqual(len(response.data['results']), 20)
        self.assertEqual(len(self.client.get(self.animals_url, {'page': 2}).data['results']), 4)
