### All obselete code as of Dec 2013 refactor ###

# from rest_framework import serializers
# from rest_framework.compat import smart_text

# from django.core.exceptions import ObjectDoesNotExist, ValidationError

# class NamespacedHyperlinkedModelSerializer(serializers.HyperlinkedModelSerializer):
#     '''
#     Same as HyperlinkedModelSerializer, but includes app namespace in the
#     url resolving.
#     '''
#     _default_view_name = '%(app_label)s:%(model_name)s-detail'

# class NamespacedHyperlinkedModelSerializerWithPKWrite(NamespacedHyperlinkedModelSerializer):
#     '''
#     Hybrid of NamespacedHyperlinkedModelSerializer for serialization, and
#     PrimaryKeyRelatedField for deserialization. Used to create/update
#     resources with nested resources without requiring the full set of
#     nested attributes.
#     '''
#     def from_native(self, data, files):
#         '''
#         Almost direct copy of PrimaryKeyRelatedField's implementation of
#         this method, with some changes since this is a Serializer field.
#         '''
#         try:
#             return self.Meta.model.objects.get(pk=data)
#         except ObjectDoesNotExist:
#             msg = self.error_messages['does_not_exist'] % smart_text(data)
#             raise ValidationError(msg)
#         except (TypeError, ValueError):
#             received = type(data).__name__
#             msg = self.error_messages['incorrect_type'] % received
#             raise ValidationError(msg)


# def stub_serializer_factory(model_class, *args, **kwargs):
#     '''
#     Returns a NamespacedHyperlinkedModelSerializer for the given model
#     class that exposes the resource's `id` and `url` only.
#     '''
#     meta_class = type('Meta', (), {
#         'model': model_class,
#         'fields': ('id', 'url',)
#     })

#     stub_class = type("%sStubSerialier" % model_class.__name__,
#         (NamespacedHyperlinkedModelSerializer,),
#         {'Meta': meta_class}
#     )

#     return stub_class(*args, **kwargs)
