from django.contrib import admin
from django.urls import path, include, re_path
from django.contrib.auth.views import LoginView
from django.contrib.auth.views import LogoutView
from .views import *
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', ReactView.as_view(), name='book-list'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),
    path('token/', 
          jwt_views.TokenObtainPairView.as_view(), 
          name ='token_obtain_pair'),
     path('token/refresh/', 
          jwt_views.TokenRefreshView.as_view(), 
          name ='token_refresh')
]
