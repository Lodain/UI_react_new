from django.shortcuts import render
from rest_framework.views import APIView 
from .models import *
from rest_framework.response import Response
from .serializers import * 
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

class ReactView(APIView):
    def get(self, request):
        output = [{"title": output.title, "authors": output.authors.all().values_list('name', flat=True)} for output in Book.objects.all()]
        return Response(output)

