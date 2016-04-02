NPM_BIN     := node_modules/.bin
FRONT_SRC   := assets
FRONT_OUT   := dist
JS_SRC      := $(FRONT_SRC)/js
JS_OUT      := $(FRONT_OUT)/js
SCSS_SRC    := $(FRONT_SRC)/scss
CSS_OUT     := $(FRONT_OUT)/css
IMG_SRC     := $(FRONT_SRC)/images
IMG_OUT     := $(FRONT_OUT)/images
SPRITE_SRC  := $(IMG_SRC)/sprite
SMILEYS_SRC := $(FRONT_SRC)/smileys
SMILEYS_OUT := $(FRONT_OUT)/smileys

WATCH := false

all: help

# install
## linux
install-debian:
	sudo apt-get install git python-dev python-setuptools libxml2-dev python-lxml libxslt-dev libz-dev python-sqlparse libjpeg8 libjpeg8-dev libfreetype6 libfreetype6-dev libffi-dev python-pip python-tox

install-ubuntu:
	sudo apt-get install git python-dev python-setuptools libxml2-dev python-lxml libxslt1-dev libz-dev python-sqlparse libjpeg8 libjpeg8-dev libfreetype6 libfreetype6-dev libffi-dev python-pip python-tox

install-fedora:
	sudo dnf install git python-devel python-setuptools libxml2-devel python-lxml libxslt-devel zlib-devel python-sqlparse libjpeg-turbo-devel libjpeg-turbo-devel freetype freetype-devel libffi-devel python-pip python-tox

install-osx:
	brew install virtualenv_select py27-virtualenv py27-virtualenvwrapper py27-tox node

# dev back
## django
generate-pdf:
	python manage.py generate_pdf

migrate:
	python manage.py migrate

reset:
	python manage.py reset

shell:
	python manage.py shell

## back-utils
clean-back:
	find . -name '*.pyc' -exec rm {} \;

install-back:
	pip install --upgrade -r requirements.txt -r requirements-dev.txt

lint-back:
	flake8 --exclude=migrations --max-line-length=120 zds

report-release-back:
	python scripts/release_generator.py

run-back:
	python manage.py runserver 0.0.0.0:8000

test-back:
	make clean-back && \
	python manage.py test

# front
## front-utils

build-front: stylesheet imagemin js

clean-front:
	$(RM) -r $(FRONT_OUT)/*
	$(RM) -r $(SCSS_SRC)/vendors
	$(RM) $(SCSS_SRC)/_sprite.scss

install-front:
	npm install

watch-front: build-front
	make -B -j2 WATCH=true dist/css/main.css dist/css/main.min.css

# Sprite generation using `sprity`
sprites := $(wildcard $(SPRITE_SRC)/*.png)
sprite_out := $(SCSS_SRC)/_sprite.scss $(IMG_OUT)/sprite.png $(IMG_OUT)/sprite@2x.png

sprite: $(sprite_out)
$(sprite_out): $(sprites)
	@echo "generating sprite"
	@$(NPM_BIN)/sprity create \
	  --css-path '../images/' \
	  --dimension 1:72 \
	  --dimension 2:192 \
	  --margin 0 \
	  --template $(SCSS_SRC)/sprite-template.hbs \
	  --style ../../$(SCSS_SRC)/_sprite.scss \
	  $(IMG_OUT) $^

# Image optimization using `imagemin`
images := $(patsubst $(IMG_SRC)/%.png,$(IMG_OUT)/%.png,$(wildcard $(IMG_SRC)/*.png))
smileys := $(patsubst $(SMILEYS_SRC)/%,$(SMILEYS_OUT)/%,$(wildcard $(SMILEYS_SRC)/*))

imagemin: imagemin-images imagemin-smileys
imagemin-images: $(images)
imagemin-smileys: $(smileys)

$(images) $(smileys): $(FRONT_OUT)/%: $(FRONT_SRC)/%
	@echo "optimizing $*"
	@$(NPM_BIN)/imagemin \
	  --interlaced \
	  --progressive \
	  --optimizationLevel 3 \
	  $^ $(@D)

# SCSS processing using `node-sass` and `postcss`
scss := $(wildcard $(SCSS_SRC)/**/*.scss)

minify_deps := $(CSS_OUT)/main.css
ifeq ($(WATCH),true)
  node_sass_args := --watch
  postcss_args := --watch
  echo_mode := (watching)
  minify_deps :=
endif

# main.scss > node-sass > postcss (autoprefixer + cssnano) > main.css + main.css.map
stylesheet: $(CSS_OUT)/main.min.css
$(CSS_OUT)/main.css $(CSS_OUT)/main.css.map: $(SCSS_SRC)/_sprite.scss $(SCSS_SRC)/vendors/_normalize.scss $(scss)
	@echo "processing main.scss $(echo_mode)"
	@$(NPM_BIN)/node-sass \
	  $(node_sass_args) \
	  --source-map $(CSS_OUT)/main.css.map \
	  --source-map-contents \
	  --source-map-root '../../' \
	  $(SCSS_SRC)/main.scss \
	  $(CSS_OUT)/main.css

$(CSS_OUT)/main.min.css $(CSS_OUT)/main.min.css.map: $(minify_deps)
	@echo "minifying main.css $(echo_mode)"
	@$(NPM_BIN)/postcss \
	  $(postcss_args) \
	  --use autoprefixer \
	  --autoprefixer.browsers 'last 2 version, > 1%' \
	  --use cssnano \
	  --map $(CSS_OUT)/main.min.css.map \
	  --output $(CSS_OUT)/main.min.css \
	  $(CSS_OUT)/main.css

# Copy CSS vendors
$(SCSS_SRC)/vendors/_normalize.scss: node_modules/normalize.css/normalize.css
	mkdir -p $(@D)
	cp $^ $@

js_vendors := node_modules/jquery/dist/jquery.js node_modules/cookies-eu-banner/dist/cookies-eu-banner.js
js := $(wildcard $(JS_SRC)/*.js)

js: $(JS_OUT)/script.js
$(JS_OUT)/script.js: $(js_vendors) $(js)
	@mkdir -p $(JS_OUT)
	@echo "minifying javascript files"
	@$(NPM_BIN)/uglifyjs \
	  $^ \
	  --mangle \
	  --compress \
	  --screw-ie8 \
	  --source-map $@.map \
	  --source-map-url $(@F).map \
	  --source-map-root / \
	  --output $@

lint-front:
	$(NPM_BIN)/jshint \
	  --exclude $(JS_SRC)/_custom.modernizr.js \
	  --reporter=node_modules/jshint-stylish/index.js \
	  $(JS_SRC)/*.js

# generic utils

clean: clean-back clean-front

doc:
	cd doc && \
	make html

fixtures:
	python manage.py loaddata fixtures/*.yaml.

help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "  build-front       to build frontend code"
	@echo "  doc               to generate the html documentation"
	@echo "  generate-pdf      to regenerate all PDFs"
	@echo "  help              to get this help"
	@echo "  install-back      to install backend dependencies"
	@echo "  install-front     to install frontend dependencies"
	@echo "  install-debian    to install debian dependencies"
	@echo "  install-ubuntu    to install ubuntu dependencies"
	@echo "  install-fedora    to install fedora dependencies"
	@echo "  install-osx       to install os x dependencies"
	@echo "  lint-back         to lint backend code (flake8)"
	@echo "  lint-front        to lint frontend code (jshint)"
	@echo "  clean-back        to clean *.pyc"
	@echo "  clean-front       to clean frontend builds"
	@echo "  clean             to clean everything"
	@echo "  watch-front       to watch frontend code"
	@echo "  migrate           to migrate the project"
	@echo "  report-release-back  to generate release report"
	@echo "  run               to run the project locally"
	@echo "  run-back          to only run the backend"
	@echo "  shell             to get django shell"
	@echo "  test              to run django tests"
	@echo "Open this Makefile to see what each target does."
	@echo "When a target uses an env variable (eg. $$(VAR)), you can do"
	@echo "  make VAR=my_var cible"

install: install-back install-front

lint: lint-back lint-front

run:
	make -j2 watch-front run-back

test: test-back

travis:
	tox $TEST_APP # set by travis, see .travis.yml
