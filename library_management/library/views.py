from django.shortcuts import render
from rest_framework.views import APIView 
from .models import *
from rest_framework.response import Response
from .serializers import * 
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.decorators import api_view
from django.contrib.auth.models import User

class ReactView(APIView):
    def get(self, request):
        output = [{"title": output.title, "authors": output.authors.all().values_list('name', flat=True)} for output in Book.objects.all()]
        return Response(output)

@api_view(['POST'])
def get_user_info(request):
    username = request.data.get('username')
    try:
        user = User.objects.get(username=username)
        user_data = {
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        }
        return Response(user_data, status=200)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['GET'])
def get_lended_books(request):
    user = request.user
    lended_books = LendedBook.objects.filter(user=user)
    output = [
        {
            "title": lended_book.book.title,
            "isbn": lended_book.book.isbn,
            "authors": lended_book.book.authors.all().values_list('name', flat=True),
            "number": lended_book.number,
            "borrowed_on": lended_book.borrowed_on,
            "return_on": lended_book.return_on
        }
        for lended_book in lended_books
    ]
    return Response(output)

@api_view(['GET'])
def get_wishlist(request):
    user = request.user
    wishlist_items = Wishlist.objects.filter(user=user)
    output = [
        {
            "title": wishlist_item.book.title,
            "isbn": wishlist_item.book.isbn,
            "authors": wishlist_item.book.authors.all().values_list('name', flat=True)
        }
        for wishlist_item in wishlist_items
    ]
    return Response(output)



