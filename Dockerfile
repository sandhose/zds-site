FROM node:0.12

# Adding contrib repo (for mscorefonts)
RUN sed -i "s/ main$/ main contrib/" /etc/apt/sources.list

RUN echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections

RUN apt-get update && apt-get install -y \
	python2.7-dev \
	libmysqlclient-dev \
	ttf-mscorefonts-installer \
	python-mysqldb \
	unzip

# Install pip
RUN curl -SL 'https://bootstrap.pypa.io/get-pip.py' | python2

# Installing production dependencies
RUN pip install raven MySQL-python

# App will be installed in /app
RUN mkdir /app
WORKDIR /app

# Installing pip dependencies
ADD requirements.txt /app/requirements.txt
ADD requirements-dev.txt /app/requirements-dev.txt

RUN pip install -r /app/requirements.txt -r /app/requirements-dev.txt

# Installing npm dependencies
ADD package.json /app/package.json

RUN npm install

ADD . /app

# Building front files
RUN npm run build

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
