#!/bin/bash
cd demo
for D in `find . -maxdepth 1 -not -path "." -not -path "./.*" -type d`
do
    cd $D
    npm run build:docs
    cd ..
done
