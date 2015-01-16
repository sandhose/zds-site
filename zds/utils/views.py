#!/usr/bin/python
# -*- coding: utf-8 -*-

from django.http import Http404, StreamingHttpResponse
from django.views.decorators.http import require_POST

from .templatetags.emarkdown import emarkdown

@require_POST
def markdown(request):
    try:
        html = emarkdown(request.POST['markdown'])
    except:
        raise Http404

    return StreamingHttpResponse(html)
