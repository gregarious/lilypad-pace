"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""
from datetime import date
from urlparse import urlparse
import json

from common.tests import FixtureMixin, APITestCase

from pace.models import Student, Discussion, Note
from pace.models import GlobalBehaviorPointRecord

# Sigh. Outdated already. xUnit is the worst.

# class ClassroomFixtureMixin(FixtureMixin):
#     def create_data(self):
#         self.discussion = Discussion.objects.create(
#             notes=[
#                 Note(content="Some stuff!"),
#                 Note(content="Some more stuff!")
#             ]
#         )

#         self.point_record = GlobalBehaviorPointRecord.objects.create(
#             behavior_type="DW",
#             value=1,
#             max_value=2,
#             date=date(2013, 7, 2),
#             period=2,
#         )

#         self.student = Student.objects.create(
#             first_name="John",
#             last_name="D",
#             behavior_point_records=[self.point_record],
#             discussions=[self.discussion]
#         )

#         super(ClassroomFixtureMixin, self).create_data()

# ### Student Resource Tests ###

# class StudentCollectionGET(APITestCase, ClassroomFixtureMixin):
#     method = 'get'
#     url = '/pace/students/'

#     def test_response_content(self):
#         self.assertTrue(isinstance(self.json_response, list))
#         self.assertEqual(len(self.json_response), 1)


# class StudentResourceGET(APITestCase, ClassroomFixtureMixin):
#     method = 'get'

#     @property
#     def url(self):
#         return '/pace/students/%s/' % self.student.id

#     def test_response_content(self):
#         '''
#         Test content of a StudentResource. Most notably, it is currently
#         ignoring the author of a note.
#         '''
#         attr_get = self.json_response.get
#         self.assertEqual(attr_get('first_name'), 'John')
#         self.assertEqual(attr_get('last_name'), 'D')

#         record_collection_path = urlparse(attr_get('behavior_point_record_collection')).path
#         self.assertEqual(
#             record_collection_path,
#             '/pace/students/%s/global_behavior_point_records/' % self.student.id)

#         # self.assertEqual(
#         #     attr_get('discussions'),
#         #     '/pace/students/%s/discussions/')

# ### BehaviorPointRecord Resource Tests ###

# class BehaviorPointRecordCollectionGET(APITestCase, ClassroomFixtureMixin):
#     method = 'get'

#     @property
#     def url(self):
#         return '/pace/students/%s/global_behavior_point_records/' % self.student.id

#     def test_response_content(self):
#         self.assertTrue(isinstance(self.json_response, list))
#         self.assertEqual(len(self.json_response), 1)

# class BehaviorPointRecordCollectionPOST(APITestCase, ClassroomFixtureMixin):
#     method = 'post'

#     @property
#     def url(self):
#         return '/pace/students/%s/global_behavior_point_records/' % self.student.id
#     data = {
#         'behavior_type': 'UKW',
#         'value': 2,
#         'max_value': 2,
#         'date': '2013-07-03',
#         'period': 3
#     }
#     expected_status_code = 201

#     def test_response_content(self):
#         '''
#         Ensure new point record object is returned with at least a `url`
#         attribute.
#         '''
#         url = self.json_response.get('url')
#         self.assertTrue(isinstance(url, basestring))
#         self.assertGreater(len(url), 0)

#     def test_resource_exists(self):
#         response = self.client.get(self.json_response.get('url'))
#         record = json.loads(response.content)
#         self.assertTrue(isinstance(record, dict))

#     def test_object_content(self):
#         record_id = self.json_response.get('id')
#         student = Student.objects.get(id=self.student.id)

#         self.assertEqual(len(student.behavior_point_records), 2)
#         record = [r for r in student.behavior_point_records if r.id == record_id][0]

#         self.assertEqual(record.behavior_type, 'UKW')
#         self.assertEqual(record.value, 2)
#         self.assertEqual(record.max_value, 2)
#         self.assertEqual(record.date, date(2013, 7, 3))
#         self.assertEqual(record.period, 3)

# class BehaviorPointRecordResourceGET(APITestCase, ClassroomFixtureMixin):
#     method = 'get'

#     @property
#     def url(self):
#         return '/pace/students/%s/global_behavior_point_records/%s/' % (self.student.id, self.point_record.id)

#     def test_response_content(self):
#         '''
#         Test content of a StudentResource. Most notably, it is currently
#         ignoring the author of a note.
#         '''
#         attr_get = self.json_response.get
#         self.assertEqual(attr_get('behavior_type'), 'DW')
#         self.assertEqual(attr_get('value'), 1)
#         self.assertEqual(attr_get('max_value'), 2)
#         self.assertEqual(attr_get('date'), "2013-07-02")
#         self.assertEqual(attr_get('period'), 2)

# class BehaviorPointRecordResourcePUT(APITestCase, ClassroomFixtureMixin):
#     method = 'put'

#     @property
#     def url(self):
#         return '/pace/students/%s/global_behavior_point_records/%s/' % (self.student.id, self.point_record.id)
#     data = {
#         'behavior_type': 'DW',
#         'value': 0,
#         'max_value': 2,
#         'date': '2013-07-02',
#         'period': 2
#     }

#     def test_object_content(self):
#         student = Student.objects.get(id=self.student.id)
#         self.assertEqual(len(student.behavior_point_records), 1)

#         record = student.behavior_point_records[0]

#         self.assertEqual(record.behavior_type, 'DW')
#         self.assertEqual(record.value, 0)
#         self.assertEqual(record.max_value, 2)
#         self.assertEqual(record.date, date(2013, 7, 2))
#         self.assertEqual(record.period, 2)
