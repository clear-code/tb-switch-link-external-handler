PACKAGE_NAME = switch-link-external-handler

all: xpi

copy-extlib:
	cp extlib/**/*.jsm modules/lib/

xpi: buildscript/makexpi.sh copy-extlib
	cp buildscript/makexpi.sh ./
	./makexpi.sh -n $(PACKAGE_NAME) -o
	rm ./makexpi.sh

buildscript/makexpi.sh:
	git submodule update --init
