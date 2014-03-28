# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'TreatmentPeriod'
        db.create_table(u'pace_treatmentperiod', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('student', self.gf('django.db.models.fields.related.ForeignKey')(related_name='treatment_periods', to=orm['pace.Student'])),
            ('date_start', self.gf('django.db.models.fields.DateField')()),
            ('date_end', self.gf('django.db.models.fields.DateField')()),
        ))
        db.send_create_signal(u'pace', ['TreatmentPeriod'])


    def backwards(self, orm):
        # Deleting model 'TreatmentPeriod'
        db.delete_table(u'pace_treatmentperiod')


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'pace.attendancespan': {
            'Meta': {'ordering': "('date', 'time_in', 'time_out')", 'object_name': 'AttendanceSpan'},
            'date': ('django.db.models.fields.DateField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'student': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'attendance_spans'", 'to': u"orm['pace.Student']"}),
            'time_in': ('django.db.models.fields.TimeField', [], {'null': 'True', 'blank': 'True'}),
            'time_out': ('django.db.models.fields.TimeField', [], {'null': 'True', 'blank': 'True'})
        },
        u'pace.behaviorincident': {
            'Meta': {'object_name': 'BehaviorIncident'},
            'comment': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'ended_at': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_modified_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'started_at': ('django.db.models.fields.DateTimeField', [], {}),
            'student': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'behavior_incidents'", 'to': u"orm['pace.Student']"}),
            'type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['pace.BehaviorIncidentType']"})
        },
        u'pace.behaviorincidenttype': {
            'Meta': {'object_name': 'BehaviorIncidentType'},
            'applicable_student': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'custom_behavior_types'", 'null': 'True', 'to': u"orm['pace.Student']"}),
            'code': ('django.db.models.fields.CharField', [], {'max_length': '6', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'supports_duration': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        u'pace.classroom': {
            'Meta': {'object_name': 'Classroom'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'}),
            'period_labels': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'permissions_group': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['auth.Group']", 'unique': 'True', 'null': 'True', 'blank': 'True'})
        },
        u'pace.dailyrecord': {
            'Meta': {'object_name': 'DailyRecord'},
            'classroom': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['pace.Classroom']"}),
            'current_period': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'date': ('django.db.models.fields.DateField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'pace.periodicrecord': {
            'Meta': {'object_name': 'PeriodicRecord'},
            'be_safe_points': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'complete_work_points': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'date': ('django.db.models.fields.DateField', [], {}),
            'follow_directions_points': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'kind_words_points': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'last_changed_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'period': ('django.db.models.fields.IntegerField', [], {}),
            'student': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'periodic_records'", 'to': u"orm['pace.Student']"})
        },
        u'pace.pointloss': {
            'Meta': {'object_name': 'PointLoss'},
            'comment': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'occurred_at': ('django.db.models.fields.DateTimeField', [], {}),
            'periodic_record': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'point_losses'", 'to': u"orm['pace.PeriodicRecord']"}),
            'point_type': ('django.db.models.fields.CharField', [], {'max_length': '4'})
        },
        u'pace.student': {
            'Meta': {'object_name': 'Student'},
            'classroom': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'students'", 'null': 'True', 'to': u"orm['pace.Classroom']"}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'})
        },
        u'pace.treatmentperiod': {
            'Meta': {'object_name': 'TreatmentPeriod'},
            'date_end': ('django.db.models.fields.DateField', [], {}),
            'date_start': ('django.db.models.fields.DateField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'student': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'treatment_periods'", 'to': u"orm['pace.Student']"})
        }
    }

    complete_apps = ['pace']