#!/bin/bash

rm -rf out/src
mkdir -p out/src

./node_modules/.bin/6to5 --out-dir out/src src
./node_modules/.bin/browserify out/src/index-browser.js --outfile out/src/index-browser.x.js
mv out/src/index-browser.x.js out/src/index-browser.js

rm -rf out/example
mkdir -p out/example
./node_modules/.bin/6to5 --out-dir out/example example
