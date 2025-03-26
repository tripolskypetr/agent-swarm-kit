#!/bin/bash
cd demo
for D in `find . -maxdepth 1 -not -path "." -not -path "./.*" -type d`
do
    cd $D
    bun install
    npm run build:docs
    cd ..
done
