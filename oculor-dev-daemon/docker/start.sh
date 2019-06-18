#!/bin/sh

./oculord -datadir=./oculor_data/ -conf=oculor.conf -printtoconsole
tail -F ./oculor_data/debug.log
