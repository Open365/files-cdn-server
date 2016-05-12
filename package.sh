#!/bin/bash
set -e
set -u
set -x

cd "$(dirname "$0")"
umask 022
npm install

####UNIFY####
UNIFIED=./src/unified.js
SOURCE=./src/eyeos-files-cdn-server.js
OUTPUT=./src/eyeos-files-cdn-server.js
FILENAME=eyeos-files-cdn-server.js
EXCLUDEDIR=./src/test
CLEANDIR=src/lib
PRESERVE_LIB_SETTINGS=true

sudo npm install node-unify uglify-js -g --registry=http://artifacts.eyeosbcn.com/nexus/content/groups/npm/ || true

node-unify --dp `pwd` --ep $SOURCE --inDir ./src --exDir $EXCLUDEDIR -v > $UNIFIED
echo -e "#!/usr/bin/env node" > $OUTPUT
uglifyjs -c -m --keep-fnames -- $UNIFIED >> $OUTPUT
chmod +x $OUTPUT


if [ ! -d "./tmp" ]; then
  mkdir ./tmp
fi
if [ "$PRESERVE_LIB_SETTINGS" = true ]; then
  cp ./src/lib/settings.js ./tmp
fi
cp $OUTPUT ./tmp

rm -rf ./$CLEANDIR
mkdir ./$CLEANDIR
if [ "$PRESERVE_LIB_SETTINGS" = true ]; then
  cp ./tmp/settings.js ./src/lib/
fi
cp ./tmp/$FILENAME ./src/
rm $UNIFIED
rm -rf ./tmp
####END OF UNIFY####

cd builder
./build.sh