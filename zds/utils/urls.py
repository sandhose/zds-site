# coding: utf-8

from django.conf.urls import patterns, url

from . import views


urlpatterns = patterns('',
                       url(r'^markdown/$', 'zds.utils.views.markdown'),
                       )
