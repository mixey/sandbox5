import json
import os

from django.http import HttpResponse, Http404
from django.shortcuts import render

from app1.utils.data_helper import update

BASE_DIR = os.path.dirname(os.path.dirname(__file__))


def home(request):
    return render(request, 'index.html')


def get_values(request):
    if not request.is_ajax():
        return Http404("Incorrect request. Ajax supported only")

    data = {}

    with open(os.path.join(BASE_DIR, 'app1/data.json')) as data_file:
        data["data"] = json.load(data_file)

    return HttpResponse(json.dumps(data), content_type="application/json")


def reset(request):
    if not request.is_ajax():
        return Http404("Incorrect request. Ajax supported only")

    from shutil import copyfile

    copyfile(os.path.join(BASE_DIR, "app1/data_init.json"), os.path.join(BASE_DIR, "app1/data.json"))
    return HttpResponse()


def submit(request):
    if not request.is_ajax():
        return Http404("Incorrect request. Ajax supported only")

    new_data = json.loads(request.body)["data"]

    data = []
    with open(os.path.join(BASE_DIR, 'app1/data.json')) as data_file:
        data = json.load(data_file)

    update(data, new_data)

    with open(os.path.join(BASE_DIR, 'app1/data.json'), 'w') as data_file:
        json.dump(data, data_file)

    return HttpResponse(json.dumps(data), content_type="application/json")