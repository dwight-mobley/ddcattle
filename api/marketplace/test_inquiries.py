from uuid import uuid4
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core import mail
from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from animals.models.animal import Animal
from animals.models.animal_access import AnimalAccess
from marketplace.models import SaleInquiry, SaleListing
from marketplace.inquiries import notify_inquiry


@override_settings(INQUIRY_ADMIN_EMAIL='ranch@example.com', PUBLIC_SITE_URL='https://ddcattle.company')
class ListingInquiryTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = get_user_model().objects.create_user(username='owner', is_staff=True)
        self.other = get_user_model().objects.create_user(username='other', is_staff=True)
        self.manager = get_user_model().objects.create_user(username='manager', is_staff=True)
        self.animal = Animal.objects.create(name='Willow', species='horse', public=True, created_by=self.user)
        AnimalAccess.objects.create(animal=self.animal, user=self.manager, role='manager', can_edit_profile=True)
        self.listing = SaleListing.objects.create(animal=self.animal, title='Willow <script>alert(1)</script>', description='Public story', published=True, contact_user=self.user,
            buyer_name='PRIVATE BUYER', internal_notes='PRIVATE NOTE', actual_sale_price=9999)
        self.url = reverse('sale-listing-inquire', args=[self.listing.pk])
        self.client = APIClient()
        self.payload = {'sender_name': 'A <script>visitor</script>', 'sender_email': 'visitor@example.com',
                        'message': '<script>alert(1)</script>', 'phone': '555-0100', 'submission_key': str(uuid4()), 'honeypot': ''}

    def post(self, payload=None, **kwargs):
        return self.client.post(self.url, self.payload if payload is None else payload, format='json', **kwargs)

    def test_valid_submission_persists_server_context_and_reuses_email_templates(self):
        payload = {**self.payload, 'listing': 9999, 'animal': 9999, 'recipient': 'attacker@example.com', 'contact_user': self.other.pk}
        response = self.post(payload)
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(set(response.data), {'detail'})
        self.assertIn('recorded', response.data['detail'])
        inquiry = SaleInquiry.objects.get()
        self.assertEqual(inquiry.listing, self.listing)
        self.assertEqual(inquiry.phone, '555-0100')
        self.assertEqual(inquiry.delivery_state, 'sent')
        self.assertIsNotNone(inquiry.admin_sent_at)
        self.assertIsNotNone(inquiry.confirmation_sent_at)
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(mail.outbox[0].to, ['ranch@example.com'])
        self.assertEqual(mail.outbox[0].reply_to, ['visitor@example.com'])
        self.assertEqual(mail.outbox[1].to, ['visitor@example.com'])
        for message in mail.outbox:
            self.assertIn(f'/marketplace/{self.listing.pk}', message.body)
            self.assertIn('Available', message.body)
            self.assertNotIn('PRIVATE', message.body)
            html = message.alternatives[0].content
            self.assertIn('&lt;script&gt;', html)
            self.assertNotIn('<script>', html)
            self.assertNotIn('PRIVATE', html)
            self.assertNotIn('9999', html)

    def test_duplicate_and_changed_payload_submission_keys(self):
        self.assertEqual(self.post().status_code, 201)
        self.assertEqual(self.post().status_code, 200)
        self.assertEqual(SaleInquiry.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(self.post({**self.payload, 'message': 'Different'}).status_code, 409)
        self.assertEqual(self.post({**self.payload, 'submission_key': str(uuid4())}).status_code, 201)
        self.assertEqual(SaleInquiry.objects.count(), 2)

    def test_database_dedup_constraint_and_legacy_null_keys(self):
        self.post()
        with self.assertRaises(IntegrityError), transaction.atomic():
            SaleInquiry.objects.create(listing=self.listing, name='Duplicate', email='x@example.com', message='x', submission_key=self.payload['submission_key'])
        for _ in range(2):
            row = SaleInquiry.objects.create(listing=self.listing, name='Legacy', email='x@example.com', message='x')
            self.assertEqual(row.delivery_state, 'legacy')

    def test_visibility_and_sold_status_rejected_server_side(self):
        for field in ['published', 'active']:
            SaleListing.objects.filter(pk=self.listing.pk).update(**{field: False})
            self.assertEqual(self.post().status_code, 404)
            SaleListing.objects.filter(pk=self.listing.pk).update(**{field: True})
        Animal.objects.filter(pk=self.animal.pk).update(public=False)
        self.assertEqual(self.post().status_code, 404)
        Animal.objects.filter(pk=self.animal.pk).update(public=True)
        SaleListing.objects.filter(pk=self.listing.pk).update(status='sold')
        self.assertEqual(self.post().status_code, 400)
        self.assertEqual(SaleInquiry.objects.count(), 0)
        self.assertEqual(len(mail.outbox), 0)
        cache.clear()
        malformed = self.client.post(reverse('sale-listing-inquire', args=['invalid']), self.payload, format='json')
        self.assertEqual(malformed.status_code, 404)
        SaleListing.objects.filter(pk=self.listing.pk).update(status='pending')
        cache.clear()
        self.assertEqual(self.post().status_code, 201)
        self.assertIn('Pending', mail.outbox[0].body)

    def test_invalid_payloads_do_not_persist_or_email(self):
        for field, value in [('sender_name', ''), ('sender_name', 'x' * 101), ('sender_email', 'bad'), ('sender_email', 'x' * 250 + '@example.com'),
                             ('message', 'x' * 1001), ('phone', 'x' * 51), ('submission_key', 'bad')]:
            cache.clear()
            self.assertEqual(self.post({**self.payload, field: value}).status_code, 400)
        missing = self.payload.copy()
        del missing['submission_key']
        cache.clear()
        self.assertEqual(self.post(missing).status_code, 400)
        self.assertEqual(SaleInquiry.objects.count(), 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_honeypot_generic_success_without_record_or_email(self):
        response = self.post({'honeypot': 'bot'})
        self.assertEqual(response.status_code, 201)
        self.assertIn('recorded', response.data['detail'])
        self.assertEqual(SaleInquiry.objects.count(), 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_anonymous_and_authenticated_throttling(self):
        for user in [None, self.user]:
            cache.clear()
            self.client.force_authenticate(user)
            for _ in range(5):
                self.assertEqual(self.post({'honeypot': 'bot'}).status_code, 201)
            self.assertEqual(self.post({'honeypot': 'bot'}).status_code, 429)
        cache.clear()
        self.client.force_authenticate(self.user)
        for index in range(5):
            self.assertEqual(self.post({'honeypot': 'bot'}, HTTP_X_FORWARDED_FOR=f'192.0.2.{index}').status_code, 201)
        self.assertEqual(self.post({'honeypot': 'bot'}, HTTP_X_FORWARDED_FOR='192.0.2.99').status_code, 429)

    def test_transport_failure_keeps_inquiry_and_does_not_retry_attempted_email(self):
        with patch('django.core.mail.EmailMultiAlternatives.send', side_effect=RuntimeError('transport')) as send:
            self.assertEqual(self.post().status_code, 201)
            self.assertEqual(self.post().status_code, 200)
            self.assertEqual(send.call_count, 1)
        inquiry = SaleInquiry.objects.get()
        self.assertEqual(inquiry.delivery_state, 'needs_review')
        self.assertIsNotNone(inquiry.notification_started_at)
        self.assertIsNone(inquiry.admin_sent_at)
        self.assertIsNone(inquiry.confirmation_sent_at)

    def test_partial_send_does_not_duplicate_admin_email(self):
        with patch('django.core.mail.EmailMultiAlternatives.send', side_effect=[1, RuntimeError('confirmation')]) as send:
            self.assertEqual(self.post().status_code, 201)
            self.assertEqual(self.post().status_code, 200)
            self.assertEqual(send.call_count, 2)
        inquiry = SaleInquiry.objects.get()
        self.assertEqual(inquiry.delivery_state, 'needs_review')
        self.assertIsNotNone(inquiry.admin_sent_at)
        self.assertIsNone(inquiry.confirmation_sent_at)

    @override_settings(INQUIRY_ADMIN_EMAIL='not-an-email')
    def test_missing_or_invalid_recipient_is_recorded_for_review(self):
        self.assertEqual(self.post().status_code, 201)
        self.assertEqual(SaleInquiry.objects.get().delivery_state, 'needs_review')
        self.assertEqual(len(mail.outbox), 0)

    def test_duplicate_recovers_only_an_unstarted_notification(self):
        row = SaleInquiry.objects.create(listing=self.listing, submission_key=self.payload['submission_key'], name=self.payload['sender_name'],
            email=self.payload['sender_email'], phone=self.payload['phone'], message=self.payload['message'], delivery_state='pending')
        self.assertEqual(self.post().status_code, 200)
        self.assertEqual(len(mail.outbox), 2)
        row.refresh_from_db()
        self.assertEqual(row.delivery_state, 'sent')
        notify_inquiry(row, self.listing, self.payload)
        self.assertEqual(len(mail.outbox), 2)

    def test_inquiry_pii_not_in_public_or_manage_listing_payloads(self):
        self.post()
        for user in [None, self.user]:
            self.client.force_authenticate(user)
            response = self.client.get(reverse('sale-listing-detail', args=[self.listing.pk]))
            self.assertNotIn('visitor@example.com', str(response.data))
            self.assertNotIn('inquiries', response.data)
        response = self.client.get(reverse('manage-sale-listing-detail', args=[self.listing.pk]))
        self.assertNotIn('visitor@example.com', str(response.data))

    def test_admin_scope_and_handled_workflow(self):
        self.post()
        inquiry = SaleInquiry.objects.get()
        permissions = Permission.objects.filter(content_type__app_label='marketplace', content_type__model='saleinquiry')
        for user in [self.user, self.other, self.manager]:
            user.user_permissions.set(permissions)
        url = reverse('admin:marketplace_saleinquiry_change', args=[inquiry.pk])
        self.client.force_login(self.other)
        response = self.client.get(url)
        self.assertNotIn('visitor@example.com', response.content.decode())
        self.assertEqual(self.client.post(url, {'handled': 'on', '_save': 'Save'}).status_code, 302)
        inquiry.refresh_from_db()
        self.assertFalse(inquiry.handled)
        self.client.force_login(self.manager)
        self.assertContains(self.client.get(url), 'visitor@example.com')
        self.assertEqual(self.client.post(url, {'handled': 'on', '_save': 'Save'}).status_code, 302)
        inquiry.refresh_from_db()
        self.assertTrue(inquiry.handled)
        self.assertEqual(self.client.get(reverse('admin:marketplace_saleinquiry_delete', args=[inquiry.pk])).status_code, 403)
        self.assertEqual(self.client.get(reverse('admin:marketplace_saleinquiry_add')).status_code, 403)

    def test_existing_animal_inquiry_and_general_contact_regressions(self):
        animal_url = reverse('animal-inquire', args=[self.animal.slug])
        response = self.client.post(animal_url, self.payload, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(len(mail.outbox), 2)
        self.assertNotIn('/marketplace/', mail.outbox[0].body)
        self.assertEqual(SaleInquiry.objects.count(), 0)
        response = self.client.post(animal_url, {'honeypot': 'bot'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 2)
        with patch.dict('os.environ', {'ADMIN_EMAIL': 'ranch@example.com'}):
            response = self.client.post(reverse('contact-form'), {'name': 'Visitor', 'email': 'visitor@example.com', 'topic': 'ranch', 'message': 'Hello'}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(len(mail.outbox), 4)
