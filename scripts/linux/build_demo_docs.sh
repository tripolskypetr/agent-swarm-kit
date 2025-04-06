#!/bin/bash
cd demo
for D in `find . -maxdepth 1 -not -path "." -not -path "./.*" -type d`
do
    cd $D
    echo $D
    # bun install agent-swarm-kit
    bun install
    npm run build:docs
    cd ..
done
