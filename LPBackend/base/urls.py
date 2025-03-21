
from django.urls import path
from django.contrib import admin
from .views import Solver

urlpatterns = [
    path('admin/',admin.site.urls),
    path('hello/',Solver.as_view())
]