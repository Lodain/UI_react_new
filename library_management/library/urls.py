from django.urls import path, reverse_lazy
from .views import home, login_view, register_view, book_detail, account_view, borrow_book, resend_verification_email, verify_email, CustomPasswordChangeView, toggle_wishlist
from .librarian_views import librarian_page, search_user_books, return_book, add_book, edit_book, search_books_for_edit, delete_book
from django.contrib.auth import views as auth_views
from django.contrib.auth.forms import SetPasswordForm
from rest_framework.routers import DefaultRouter
from .api_views import HomeViewSet, api_login, api_logout, user_info, api_account_view
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'home', HomeViewSet, basename='home')

urlpatterns = [
    path('api/', include(router.urls)),
    path('', home, name='home'),
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('book/<str:book_title>/', book_detail, name='book_detail'),
    path('book/<str:book_title>/wishlist/', toggle_wishlist, name='toggle_wishlist'),
    path('account/', account_view, name='account'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('borrow/', borrow_book, name='borrow'),
    path('borrow/query=', borrow_book, name='borrowSearch'),
    path('librarian/', librarian_page, name='librarian'),
    path('librarian/search_user/', search_user_books, name='search_user_books'),#
    path('librarian/return_book/<str:book_id>/<str:username>/', return_book, name='return_book'),
    path('librarian/search_books/', search_books_for_edit, name='search_books_for_edit'),
    path('librarian/edit_book/<str:book_id>/', edit_book, name='edit_book'),
    path('librarian/add_book', add_book, name='add_book'),
    path('librarian/delete_book/<str:book_id>/', delete_book, name='delete_book'),
    path('verify-email/<str:uidb64>/<str:token>/', verify_email, name='verify_email'),
    path('resend-verification-email/<uid>/', resend_verification_email, name='resend_verification_email'),
    path('account/change_password/', CustomPasswordChangeView.as_view(), name='change_password'),
    path('password_rset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('password_reset_done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path(
        'reset/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(form_class=SetPasswordForm),
        name='password_reset_confirm'
    ),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/login/', api_login, name='api_login'),
    path('api/logout/', api_logout, name='api_logout'),
    path('api/user-info/', user_info, name='user_info'),
    path('api/account/', api_account_view, name='api_account_view'),
]