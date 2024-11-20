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



