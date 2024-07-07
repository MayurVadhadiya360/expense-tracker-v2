from django.urls import path
from .views import *

urlpatterns = [
    path('',                    login.as_view()),
    # Authentication
    path('login/',              login.as_view(),    name='login'),
    path('signup/',             signup.as_view(),   name='signup'),
    path('get_user/',           get_user,           name='get_user'),

    # Forgot Password
    path('fp-get-email/',       fp_get_email,       name='fp-get-email'),
    path('fp-otp-submit/',      fp_otp_submit,      name='fp-otp-submit'),
    path('fp-password-submit/', fp_password_submit, name='fp-password-submit'),
    # Views
    path('home/',               home,               name='home'),
    path('expense/',            expense,            name='expense'),
    path('insights/',           insights,           name='insights'),
    # CRUD
    path('get_expense/',        get_expense,        name='get_expense'),
    path('get_category/',       get_category,       name='get_category'),
    path('add_expense/',        add_expense,        name='add_expense'),
    path('add_category/',       add_category,       name='add_category'),
    path('update_expense/',     update_expense,     name='update_expense'),
    path('delete_expense/',     delete_expense,     name='delete_expense'),
    path('delete_category/',    delete_category,    name='delete_category'),
    path('get_insights_data/',  get_insights_data,  name='get_insights_data'),
    # Logout
    path('logout/',             logout,             name='logout'),
]