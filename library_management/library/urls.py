from django.contrib import admin
from django.urls import path, include, re_path
from django.contrib.auth.views import LoginView
from django.contrib.auth.views import LogoutView
from .views import *
from rest_framework_simplejwt import views as jwt_views
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', ReactView.as_view(), name='book-list'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),
    path('token/', 
          jwt_views.TokenObtainPairView.as_view(), 
          name ='token_obtain_pair'),
     path('token/refresh/', 
          jwt_views.TokenRefreshView.as_view(), 
          name ='token_refresh'),
     path('get-user-info/', get_user_info, name='get_user_info'),
    path('lended-books/', get_lended_books, name='lended_books'),
    path('wishlist/', get_wishlist, name='wishlist'),
    path('register/', register_user, name='register_user'),
    path('verify-email/<uidb64>/<token>/', verify_email, name='verify_email'),
    path('borrow_book_api', borrow_book_api, name='borrow_book_api'),
    path('get_borrowed_books/', get_borrowed_books, name='get_borrowed_books'),
    path('search_borrowed_books/', search_borrowed_books, name='search_borrowed_books'),
    path('return_book_api/', return_book_api, name='return_book_api'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
