FROM python:2.7

RUN sed -i "s/ main$/ main contrib/" /etc/apt/sources.list

RUN echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections

RUN apt-get update && apt-get install -y \
	libmysqlclient-dev \
	ttf-mscorefonts-installer \
	python-mysqldb \
	unzip

RUN mkdir /app
ADD requirements.txt /app/requirements.txt
ADD requirements-dev.txt /app/requirements-dev.txt

RUN pip install -r /app/requirements.txt -r /app/requirements-dev.txt

RUN pip install raven MySQL-python

WORKDIR /app

ADD . /app

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
