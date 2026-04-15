from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/login/',  views.login_view,  name='auth-login'),
    path('auth/logout/', views.logout_view, name='auth-logout'),

    # Prompts
    path('prompts/',          views.prompt_list,   name='prompt-list'),
    path('prompts/<int:pk>/', views.prompt_detail, name='prompt-detail'),

    # Tags
    path('tags/', views.tag_list, name='tag-list'),
]
