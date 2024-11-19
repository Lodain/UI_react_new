from django import forms
from .models import Write, Genre, Author, Book, Review, LendedBook, Wishlist, Belong
from django.shortcuts import redirect, render
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth.forms import PasswordChangeForm

class WriteForm(forms.ModelForm):
    class Meta:
        model = Write
        fields = ['book', 'author']
        
class BelongForm(forms.ModelForm):
    class Meta:
        model = Belong
        fields = ['book', 'genre']

class WishlistForm(forms.ModelForm):
    class Meta:
        model = Wishlist
        fields = ['user', 'book']
        
class GenreForm(forms.ModelForm):
    class Meta:
        model = Genre
        fields = ['name']

class AuthorForm(forms.ModelForm):
    class Meta:
        model = Author
        fields = ['name']

class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ['isbn', 'title', 'copies', 'cover', 'year', 'genres', 'authors']
    def __init__(self, *args, **kwargs):
        instance = kwargs.get('instance') # Book already exists
        super().__init__(*args, **kwargs)
        
        if instance and instance.pk: # ISBN is read-only
            self.fields['isbn'].disabled = True

    def save(self, commit=True):
        book = super().save(commit=False)
        
        if commit:
            book.save()
        return book

class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ['content', 'rating', 'book', 'user']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 4}),
            'rating': forms.NumberInput(attrs={'min': 1, 'max': 5}),
        }

class LendedBookForm(forms.ModelForm):
    class Meta:
        model = LendedBook
        fields = ['user', 'book', 'number', 'borrowed_on', 'return_on']
        widgets = {
            'borrowed_on': forms.DateInput(attrs={'type': 'date'}),
            'return_on': forms.DateInput(attrs={'type': 'date'}),
        }

class CustomSetPasswordForm(SetPasswordForm):
    new_password1 = forms.CharField(
        label="New password",
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        help_text="Your password must contain at least 8 characters, cannot be entirely numeric, and cannot be too similar to other personal information."
    )
    new_password2 = forms.CharField(
        label="New password confirmation",
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        help_text="Enter the same password as before, for verification."
    )

class CustomPasswordChangeForm(PasswordChangeForm):
    old_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Current Password', 'class': 'form-control'}),
        label="Old Password"
    )
    new_password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'New Password', 'class': 'form-control'}),
        label="New Password"
    )
    new_password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Confirm New Password', 'class': 'form-control'}),
        label="Confirm New Password"
    )