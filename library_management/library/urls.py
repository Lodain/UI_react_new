from django.contrib import admin
from django.urls import path, include, re_path
from .views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', ReactView.as_view(), name='book-list'),
]
