from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Tag(models.Model):
    """A simple label that can be attached to many prompts (M2M)."""
    name = models.CharField(max_length=64, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Prompt(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    complexity = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='prompts')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
