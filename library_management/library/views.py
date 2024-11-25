from django.shortcuts import render, redirect, get_object_or_404
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
from rest_framework.decorators import api_view, permission_classes
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
from django.db.models import Q
from datetime import date
from dateutil.relativedelta import relativedelta
from django.contrib.auth.decorators import login_required
from django.contrib import messages
import json
from django.db.models import Avg

class ReactView(APIView):
    def get(self, request):
        output = [
            {
                "isbn": output.isbn,
                "title": output.title,
                "authors": output.authors.all().values_list('name', flat=True),
                "cover": output.cover.url
            }
            for output in Book.objects.all()
        ]
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

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def borrow_book_api(request):
    if request.method == 'GET':
        search_query = request.GET.get('query')
        books = Book.objects.filter(
            Q(title__icontains=search_query) |
            Q(isbn__iexact=search_query) |
            Q(authors__name__icontains=search_query)
        ).distinct()
        book_data = [
            {
                'title': book.title,
                'isbn': book.isbn,
                'authors': [author.name for author in book.authors.all()],
                'copies': book.copies,
                'lended': book.lended
            }
            for book in books
        ]
        return Response(book_data)

    elif request.method == 'POST':
        book_id = request.data.get('book_id')
        book = get_object_or_404(Book, isbn=book_id)

        if book.copies > book.lended:
            book.lended += 1
            book.save()
            borrowed_book, created = LendedBook.objects.get_or_create(
                user=request.user,
                book=book,
                defaults={
                    'number': 1,
                    'borrowed_on': date.today(),
                    'return_on': date.today() + relativedelta(months=1),
                }
            )
            if not created:
                borrowed_book.number += 1
            borrowed_book.save()

            Wishlist.objects.filter(user=request.user, book=book).delete()

            return Response({'message': f"You have successfully borrowed '{book.title}'."}, status=200)
        else:
            return Response({'error': "Sorry, this book is currently unavailable for borrowing."}, status=400)

@api_view(['GET'])
def get_borrowed_books(request):
    borrowed_books = LendedBook.objects.select_related('book', 'user').all()
    output = [
        {
            "title": book.book.title,
            "isbn": book.book.isbn,
            "authors": book.book.authors.all().values_list('name', flat=True),
            "borrowed_by": book.user.username,
            "number": book.number,
            "borrowed_on": book.borrowed_on,
            "return_on": book.return_on
        }
        for book in borrowed_books
    ]
    return Response(output)

@api_view(['GET'])
def search_borrowed_books(request):
    query = request.GET.get('query', '').strip()
    searched_books = LendedBook.objects.none()

    if query:
        user_matches = User.objects.filter(username__icontains=query)
        searched_books = LendedBook.objects.filter(
            Q(user__in=user_matches) |
            Q(book__title__icontains=query) |
            Q(book__isbn__icontains=query) |
            Q(book__authors__name__icontains=query)
        ).distinct()

    output = [
        {
            "title": book.book.title,
            "isbn": book.book.isbn,
            "authors": book.book.authors.all().values_list('name', flat=True),
            "borrowed_by": book.user.username,
            "number": book.number,
            "borrowed_on": book.borrowed_on
        }
        for book in searched_books
    ]
    return Response(output)

@api_view(['POST'])
def return_book_api(request):
    book_id = request.data.get('book_id')
    username = request.data.get('username')
    quantity = int(request.data.get('quantity', 1))
    
    try:
        returned_book = get_object_or_404(LendedBook, book_id=book_id, user__username=username)
        
        if returned_book.number >= quantity:
            if returned_book.number == quantity:
                returned_book.delete()
            else:
                returned_book.number -= quantity
                returned_book.save()
                
            Book.objects.filter(isbn=book_id).update(lended=models.F('lended') - quantity)
            return Response({'message': f"{quantity} book(s) returned successfully."})
        else:
            return Response({'error': "Cannot return more books than borrowed."}, status=400)
            
    except LendedBook.DoesNotExist:
        return Response({'error': "Book not found."}, status=404)

@api_view(['POST'])
def add_book_api(request):
    try:
        data = request.data
        
        # Parse JSON strings back to lists
        authors = json.loads(data['authors'])
        genres = json.loads(data['genres'])
        
        # Verify all authors exist before creating the book
        for author_name in authors:
            try:
                Author.objects.get(name=author_name)
            except Author.DoesNotExist:
                return Response({'error': f'Author "{author_name}" does not exist'}, status=400)
        
        # Verify all genres exist before creating the book
        for genre_name in genres:
            try:
                Genre.objects.get(name=genre_name)
            except Genre.DoesNotExist:
                return Response({'error': f'Genre "{genre_name}" does not exist'}, status=400)
        
        # Create the book
        book = Book.objects.create(
            isbn=data['isbn'],
            title=data['title'],
            copies=data['copies'],
            year=data['year']
        )
        
        # Add existing authors
        for author_name in authors:
            author = Author.objects.get(name=author_name)
            book.authors.add(author)
            
        # Add existing genres
        for genre_name in genres:
            genre = Genre.objects.get(name=genre_name)
            book.genres.add(genre)
            
        # Handle cover image if provided
        if 'cover' in request.FILES:
            book.cover = request.FILES['cover']
            book.save()
            
        return Response({'message': 'Book added successfully'}, status=201)
    except json.JSONDecodeError:
        return Response({'error': 'Invalid JSON format for authors or genres'}, status=400)
    except Exception as e:
        if 'book' in locals():  # Clean up if book was created
            book.delete()
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
def get_authors_api(request):
    authors = Author.objects.all().values_list('name', flat=True)
    return Response(list(authors))

@api_view(['GET'])
def get_genres_api(request):
    genres = Genre.objects.all().values_list('name', flat=True)
    return Response(list(genres))

@api_view(['GET'])
def get_book_details(request, isbn):
    try:
        book = Book.objects.prefetch_related('authors', 'reviews').get(isbn=isbn)
        reviews = Review.objects.filter(book=book)
        average_rating = reviews.aggregate(Avg('rating'))['rating__avg']
        
        # Check if book is in user's wishlist
        in_wishlist = False
        if request.user.is_authenticated:
            in_wishlist = Wishlist.objects.filter(book=book, user=request.user).exists()
        
        output = {
            "title": book.title,
            "isbn": book.isbn,
            "authors": book.authors.all().values_list('name', flat=True),
            "cover": book.cover.url if book.cover else None,
            "copies": book.copies,
            "lended": book.lended,
            "year": book.year,
            "average_rating": float(average_rating) if average_rating else 0,
            "reviews": [
                {
                    "id": review.id,
                    "user": review.user.username,
                    "rating": review.rating,
                    "content": review.content
                } for review in reviews
            ],
            "in_wishlist": in_wishlist
        }
        return Response(output)
    except Book.DoesNotExist:
        return Response({'error': 'Book not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request, isbn):
    try:
        book = get_object_or_404(Book, isbn=isbn)
        wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, book=book)

        if not created:
            wishlist_item.delete()
            in_wishlist = False
        else:
            in_wishlist = True

        return Response({'in_wishlist': in_wishlist}, status=200)
    except Book.DoesNotExist:
        return Response({'error': 'Book not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_review(request, isbn):
    try:
        book = get_object_or_404(Book, isbn=isbn)
        user = request.user
        if Review.objects.filter(book=book, user=user).exists():
            return Response({'error': 'You have already reviewed this book.'}, status=400)

        rating = request.data.get('rating')
        content = request.data.get('content')

        review = Review.objects.create(
            book=book,
            user=user,
            rating=rating,
            content=content
        )

        # Calculate new average rating
        new_average = Review.objects.filter(book=book).aggregate(Avg('rating'))['rating__avg']

        return Response({
            "id": review.id,
            "user": review.user.username,
            "rating": review.rating,
            "content": review.content,
            "average_rating": float(new_average) if new_average else 0
        }, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_review(request, isbn, review_id):
    try:
        review = get_object_or_404(Review, id=review_id, book__isbn=isbn, user=request.user)
        book = review.book
        review.delete()
        
        # Calculate new average rating
        new_average = Review.objects.filter(book=book).aggregate(Avg('rating'))['rating__avg']
        
        return Response({
            'message': 'Review deleted successfully',
            'average_rating': float(new_average) if new_average else 0
        }, status=200)
    except Review.DoesNotExist:
        return Response({'error': 'Review not found or you are not authorized to delete it'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_api(request):
    user = request.user
    old_password = request.data.get('oldPassword')
    new_password = request.data.get('newPassword')

    if not user.check_password(old_password):
        return Response({'error': 'Current password is incorrect'}, status=400)

    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Password changed successfully'}, status=200)



