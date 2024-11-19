from django.shortcuts import render
from rest_framework.views import APIView 
from .models import *
from rest_framework.response import Response
from .serializers import * 

class ReactView(APIView):
    def get(self, request):
        output = [{"title": output.title, "authors": output.authors.all().values_list('name', flat=True)} for output in Book.objects.all()]
        return Response(output)
    
    def post(self, request):
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)
