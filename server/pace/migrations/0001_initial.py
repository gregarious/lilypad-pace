# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Classroom'
        db.create_table(u'pace_classroom', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal(u'pace', ['Classroom'])

        # Adding M2M table for field staff on 'Classroom'
        m2m_table_name = db.shorten_name(u'pace_classroom_staff')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('classroom', models.ForeignKey(orm[u'pace.classroom'], null=False)),
            ('user', models.ForeignKey(orm[u'auth.user'], null=False))
        ))
        db.create_unique(m2m_table_name, ['classroom_id', 'user_id'])

        # Adding model 'Student'
        db.create_table(u'pace_student', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('first_name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('last_name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('classroom', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['pace.Classroom'])),
        ))
        db.send_create_signal(u'pace', ['Student'])

        # Adding model 'PeriodicPointRecord'
        db.create_table(u'pace_periodicpointrecord', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('period', self.gf('django.db.models.fields.IntegerField')()),
            ('date', self.gf('django.db.models.fields.DateField')()),
            ('student', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['pace.Student'])),
            ('is_eligible', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('kind_words_points', self.gf('django.db.models.fields.IntegerField')()),
            ('complete_work_points', self.gf('django.db.models.fields.IntegerField')()),
            ('follow_directions_points', self.gf('django.db.models.fields.IntegerField')()),
            ('be_safe_points', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal(u'pace', ['PeriodicPointRecord'])

        # Adding model 'BehaviorIncidentType'
        db.create_table(u'pace_behaviorincidenttype', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('code', self.gf('django.db.models.fields.CharField')(max_length=6, blank=True)),
            ('label', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('supports_duration', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('applicable_student', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='custom_behavior_types', null=True, to=orm['pace.Student'])),
        ))
        db.send_create_signal(u'pace', ['BehaviorIncidentType'])

        # Adding model 'BehaviorIncident'
        db.create_table(u'pace_behaviorincident', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('type', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['pace.BehaviorIncidentType'])),
            ('started_at', self.gf('django.db.models.fields.DateTimeField')()),
            ('ended_at', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('comment', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('student', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['pace.Student'])),
        ))
        db.send_create_signal(u'pace', ['BehaviorIncident'])


    def backwards(self, orm):
        # Deleting model 'Classroom'
        db.delete_table(u'pace_classroom')

        # Removing M2M table for field staff on 'Classroom'
        db.delete_table(db.shorten_name(u'pace_classroom_staff'))

        # Deleting model 'Student'
        db.delete_table(u'pace_student')

        # Deleting model 'PeriodicPointRecord'
        db.delete_table(u'pace_periodicpointrecord')

        # Deleting model 'BehaviorIncidentType'
        db.delete_table(u'pace_behaviorincidenttype')

        # Deleting model 'BehaviorIncident'
        db.delete_table(u'pace_behaviorincident')


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
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'pace.behaviorincident': {
            'Meta': {'object_name': 'BehaviorIncident'},
            'comment': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'ended_at': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'started_at': ('django.db.models.fields.DateTimeField', [], {}),
            'student': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['pace.Student']"}),
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
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'staff': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.User']", 'symmetrical': 'False'})
        },
        u'pace.periodicpointrecord': {
            'Meta': {'object_name': 'PeriodicPointRecord'},
            'be_safe_points': ('django.db.models.fields.IntegerField', [], {}),
            'complete_work_points': ('django.db.models.fields.IntegerField', [], {}),
            'date': ('django.db.models.fields.DateField', [], {}),
            'follow_directions_points': ('django.db.models.fields.IntegerField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_eligible': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'kind_words_points': ('django.db.models.fields.IntegerField', [], {}),
            'period': ('django.db.models.fields.IntegerField', [], {}),
            'student': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['pace.Student']"})
        },
        u'pace.student': {
            'Meta': {'object_name': 'Student'},
            'classroom': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['pace.Classroom']"}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['pace']