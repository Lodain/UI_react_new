from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.db.models import Avg, Q
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from datetime import date
from dateutil.relativedelta import relativedelta
import threading
from .serializers import *
from .models import *
from rest_framework_simplejwt.tokens import RefreshToken

# Existing ViewSets

class HomeViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        books = Book.objects.prefetch_related('authors').all()
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_logout(request):
    logout(request)
    return Response({'success': 'Logged out successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    return Response({
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_account_view(request):
    lended_books = LendedBook.objects.filter(user=request.user).select_related('book').prefetch_related('book__authors')
    wishlist = Wishlist.objects.filter(user=request.user).select_related('book').prefetch_related('book__authors')
    
    lended_books_serializer = LendedBookSerializer(lended_books, many=True)
    wishlist_serializer = WishlistSerializer(wishlist, many=True)
    
    return Response({
        'lended_books': lended_books_serializer.data,
        'wishlist': wishlist_serializer.data,
        'user': {
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
        }
    })
