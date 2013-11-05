from django.test import TestCase
from django.test.client import Client

import json

class FixtureMixin(object):
    def create_data(self):
        pass

class APITestCase(TestCase):
    '''
    Base class for basic API tests. Allows definition of the following
    attributes:

    Required:
    - method (e.g. "get")
    - url (can be a property if something dynamic is needed)

    Optional:
    - data (Python dict, needed for POST, PUT, PATCH)
    - expected_status_code (default 200)
    '''
    method = None
    url = None
    data = {}
    expected_status_code = 200

    def setUp(self):
        if hasattr(super(APITestCase, self), 'create_data'):
            super(APITestCase, self).create_data()

        self.client = Client()
        self.response = getattr(self.client, self.method.lower())(
            path=self.url, data=self.data)
        self.json_response = json.loads(self.response.content)

    def test_status_code(self):
        self.assertEqual(self.response.status_code, self.expected_status_code)
