=================================
Django Endless Pagination Angular
=================================

**The version 1.0 is in development and testing**

Django Endless Pagination Angular is a fork of the excellent application django-endless-pagination created for Francesco Banconi.
This application get all code of version 2.0 and update for working in django >= 1.7 in addition to migrate code jquery to angular.js.

Django Endless Pagination Angular can be used to provide Twitter-style or Digg-style pagination, with optional Ajax support and other features
like multiple or lazy pagination.

Documentation:
--------------

**Documentation** is `avaliable online
<http://django-endless-pagination-angular.readthedocs.org/>`_, or in the docs
directory of the project.


Quick start:
-----------

1. Add application 'endless_pagination' to INSTALLED_APPS:
2. Add this lines in settings.py::

	from django.conf.global_settings import TEMPLATE_CONTEXT_PROCESSORS
    TEMPLATE_CONTEXT_PROCESSORS += (
        'django.core.context_processors.request',
    )


Getting started:
----------------

In this example it will be implemented twitter style pagination

Base.html::

	<!DOCTYPE html>
	<html>
	  <head>
	    <meta content='text/html; charset=utf-8' http-equiv='Content-Type' />
	    <title>{% block title %}Testing project{% endblock %} - Django Endless Pagination Angular</title>
	    <link href="http://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.1.1/css/bootstrap.min.css" rel="stylesheet">
	    <link href="{{ STATIC_URL }}pagination.css" rel="stylesheet">
	  </head>
	  <body ng-app="EndlessPagination">
	    <div class="container">
	      <div class="page-header">
	        <h1>Django Endless Pagination Angular <small>Twitter Style</small></h1>
	      </div>
	      </div>
	      <div class="row">
	        {% block content %}{% endblock %}
	      </div>
	    </div>
	    {% block js %}
	      <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.2/angular.min.js"></script>
	      <script src="{{ STATIC_URL }}endless_pagination/js/module.endless.js"></script>
	    {% endblock %}
	  </body>
	</html>

Index.html::

	{% extends "base.html" %}

	{% block content %}
	  <div class="endless_page_template span12" endless-pagination="{'paginateOnScroll': true}"">
	    {% include myapp/page_template.html %}
	  </div>
	{% endblock %}

Page_template.html::

	{% load endless %}

	{% paginate objects %}
	{% for object in objects %}
	  <div class="well object">
	    <h4>{{ object.title }}</h4>
	    {{ object.contents }}
	  </div>
	{% endfor %}
	{% show_more "More results" %}

In the views.py::

	class TwitterView(View):

	    def get(self, request, forum, *args, **kwargs):

	        template_name = "myapp/index.html"
	        page_template = "myapp/page_template.html"

	        search = request.GET.get('q')

	        forum = get_object_or_404(Forum, name=forum)
	        idforum = forum.idforum

	        objects = MyModel.objects.all()

	        data = {
	            'objects': objects,
	        }

	        if request.is_ajax():
	            template_name = page_template
	        return render(request, template_name, data)

In the urls.py::

	url(r'^twitter/$', TwitterView.as_view(), name='twitter'),


Run server::

	python manage.py runserver

Visit: 127.0.0.1:800/twitter/

If you have already declared an angular module all you have to do is inject the module EndlessPagination. As follow::

	'use strict';
	var App = angular.module('TestApp', ['EndlessPagination']);

This way you will be able to use the directive endless-pagination. For more examples check the official repository:

https://github.com/mapeveri/django-endless-pagination-angular/tree/master/tests