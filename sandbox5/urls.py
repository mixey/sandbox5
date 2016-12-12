from django.conf.urls import patterns, include, url
from django.conf.urls.static import static

from django.contrib import admin
from sandbox5 import settings

admin.autodiscover()

urlpatterns = patterns(
    '',
    url(r'^$', 'app1.views.home', name='home'),
    url(r'^get_values$', 'app1.views.get_values', name='get_values'),
    url(r'^reset$', 'app1.views.reset', name='reset'),
    url(r'^submit$', 'app1.views.submit', name='submit'),
) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
