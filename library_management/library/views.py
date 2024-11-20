from django.shortcuts import render, redirect
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
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model

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
            'staff': user.is_staff,
            'superuser': user.is_superuser,
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

@api_view(['POST'])
def register_user(request):
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    user.is_active = False
    user.save()

    # Send verification email
    subject = 'Verify your email'
    message = render_to_string('registration/verification_email.html', {
        'user': user,
        'domain': request.get_host(),
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': default_token_generator.make_token(user),
    })
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])

    return Response({'message': 'User registered successfully. Please check your email to verify your account.'}, status=201)

@api_view(['GET'])
def verify_email(request, uidb64, token):
    User = get_user_model()
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return redirect('http://localhost:3000/verify-email?status=success')
    else:
        return redirect('http://localhost:3000/verify-email?status=failed')



