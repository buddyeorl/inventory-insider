from django.db import models

class Found(models.Model):
    item = models.CharField(max_length=255)
    url = models.CharField(max_length=255)
    time_stamp = models.CharField(max_length=255)