import threading
from datetime import date
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, get_user_model
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.views import PasswordChangeView
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib import messages
from django.contrib.auth.models import User
from .models import Book, Review, LendedBook, Wishlist
from .forms import CustomPasswordChangeForm
from django.shortcuts import render, get_object_or_404
from django.db.models import Avg
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse, reverse_lazy
from dateutil.relativedelta import relativedelta

from django.contrib.auth.decorators import login_required

def home(request):
    books = Book.objects.prefetch_related('authors').all()
    members = User.objects.filter(is_active=True)
    for book in books:    
        book.remaining_copies = book.copies - book.lended
    return render(request, 'library/home.html', {'books': books, 'members': members})

def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            next_url = request.GET.get('next', '/')
            return redirect(next_url)
        else:
            inactive_user = User.objects.filter(username=username, is_active=False)
            if inactive_user:
                uid = urlsafe_base64_encode(force_bytes(inactive_user.pk))
                verification_url = reverse('resend_verification_email', args=[uid])
                messages.error(request, f'You have to verify your email. <a href="{verification_url}">Click here</a> to send a new verification email.')
            else:
                messages.error(request, 'Invalid username or password.')

    return render(request, 'account/login.html')

def resend_verification_email(request, uid):
    user = get_object_or_404(User, pk=urlsafe_base64_decode(uid).decode())
    if not user.is_active:
        verification_url = request.build_absolute_uri(reverse('verify_email', args=[uid, default_token_generator.make_token(user)]))
        async_send_verification_email(user, verification_url)

        messages.success(request, 'A new verification email has been sent to your email address.')
    return redirect('login')


def send_verification_email(user, verification_url):
    send_mail(
    'Welcome to Library ITUe!',
    f'Click here to verify your email: {verification_url}',
    'libraryitue@gmail.com',
    [user.email],
    fail_silently=False,
    )

def async_send_verification_email(user, verification_url):
    thread = threading.Thread(target=send_verification_email, args=(user, verification_url))
    thread.start()
    
def register_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        firstName = request.POST['first_name']
        lastName = request.POST['last_name']
        email = request.POST['email']
        username = request.POST['username']
        password = request.POST['password']
        
        try:
            validate_password(password)
        except ValidationError as e:
            for error in e.messages:
                messages.error(request, error)
            return render(request, 'account/register.html')
        
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists.')
            return render(request, 'account/register.html')

        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists.')
            return render(request, 'account/register.html')

    try:
        user = User.objects.create_user(
            first_name=firstName, last_name=lastName,
            username=username, email=email, password=password,
            is_active=False 
        )

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        verification_url = f"{request.build_absolute_uri(reverse('verify_email', args=[uid, token]))}"

        async_send_verification_email(user, verification_url)
        messages.success(request, 'Registration successful. Check your email to verify your account.')
        return redirect('login')
    except ValidationError as e:
        print(f"Validation error occurred: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
    return render(request, 'account/register.html')

def verify_email(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode('utf-8')
        
        user = get_user_model().objects.get(pk=uid)
        
        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            messages.success(request, "Your email has been successfully verified!")
            return redirect('login')
        
        else:
            messages.error(request, "The verification link is invalid or expired.")
            return redirect('register')

    except (TypeError, ValueError, OverflowError, user.DoesNotExist):
        messages.error(request, "Invalid verification link.")
        return redirect('register')


def book_detail(request, book_title):
    book = get_object_or_404(Book.objects.prefetch_related('authors'), title=book_title)
    authors = book.authors.all()
    reviews = Review.objects.filter(book=book)
    average_rating = reviews.aggregate(Avg("rating"))['rating__avg']

    reviewed = False
    if request.user.is_authenticated:
        reviewed = Review.objects.filter(book=book, user=request.user).exists()

    if request.method == 'POST':
        # Check which form was submitted
        if 'rating' in request.POST:  # Review form
            rating = request.POST['rating']
            review_text = request.POST['review_text']
            Review.objects.create(book=book, user=request.user, rating=rating, content=review_text)
            return redirect('book_detail', book_title=book_title)

    remaining_copies = book.copies - book.lended
    in_wishlist = False
    if request.user.is_authenticated:
        in_wishlist = Wishlist.objects.filter(book=book, user=request.user).exists()

    return render(request, 'library/default_book_page.html', {
        'book': book, 
        'reviews': reviews, 
        'average_rating': average_rating, 
        'reviewed': reviewed, 
        'remaining_copies': remaining_copies, 
        'author': authors,
        'in_wishlist': in_wishlist
    })
    
def borrow_book(request):
    search_query = request.GET.get('query')
    book = None
    if search_query:
        book = Book.objects.filter(title__icontains=search_query).first()
        if not book:
            book = Book.objects.filter(isbn__iexact=search_query).first()
            if not book:
                book = Book.objects.filter(authors__name__icontains=search_query).first()
    if request.method == 'POST' and 'book_id' in request.POST:
        book_id = request.POST['book_id']
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

            messages.success(request, f"You have successfully borrowed '{book.title}'.")
            return redirect('borrow')
        else:
            messages.error(request, "Sorry, this book is currently unavailable for borrowing.")
            return redirect('borrow')

    return render(request, 'library/borrow.html', {'book': book, 'search_query': search_query})


def account_view(request):
    if not request.user.is_authenticated:
        return redirect('home')
    lendedBooks = LendedBook.objects.filter(user=request.user.id).select_related('book').prefetch_related('book__authors')
    wishlist = Wishlist.objects.filter(user=request.user).select_related('book').prefetch_related('book__authors')
    return render(request, 'account/account.html', {
        'lended_books': lendedBooks,
        'wishlist': wishlist
    })


def send_notification_email(user):
    borrowed_books = LendedBook.objects.filter(username=user.username)
    
    book_titles = ', '.join(book.title for book in borrowed_books if LendedBook.return_on - relativedelta(day=7) < date.today())
    email_body = f'Remember to return the book back: {book_titles}\nContact: libraryitue@gmail.com'
    
    send_mail(
        'Library Notification',
        email_body,
        'libraryitue@gmail.com',
        [user.email],
        fail_silently=False,
    )

def async_send_notification_email(user):
    thread = threading.Thread(target=send_notification_email, args=(user,))
    thread.start()
    
class CustomPasswordChangeView(PasswordChangeView):
    form_class = CustomPasswordChangeForm
    template_name = 'account/change_password.html'
    success_url = reverse_lazy('account')

@login_required
def toggle_wishlist(request, book_title):
    if request.method == 'POST':
        book = get_object_or_404(Book, title=book_title)
        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user,
            book=book
        )
        if not created:
            wishlist_item.delete()
            messages.add_message(request, messages.SUCCESS, 
                f"'{book.title}' removed from wishlist.", 
                extra_tags='wishlist')
        else:
            messages.add_message(request, messages.SUCCESS, 
                f"'{book.title}' added to wishlist.", 
                extra_tags='wishlist')
        
        return redirect('book_detail', book_title=book_title)