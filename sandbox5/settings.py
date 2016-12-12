import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
SECRET_KEY = 'nmzn!#e2c3xk#c=v*^wx(%you=ip127-q-mz8c9u6inigau388'
DEBUG = True
TEMPLATE_DEBUG = True
ALLOWED_HOSTS = []
ROOT_URLCONF = 'sandbox5.urls'
WSGI_APPLICATION = 'sandbox5.wsgi.application'
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True
STATIC_URL = '/static/'
STATIC_ROOT = ''

TEMPLATE_DIRS = (
    os.path.join(BASE_DIR, 'templates'),
)

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'app1',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

STATICFILES_DIRS = (
    os.path.join(BASE_DIR, "static"),
)
