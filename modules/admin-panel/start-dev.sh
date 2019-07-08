#!/bin/sh

ln -s ../../config/admin.config.js ./src/systemConfig.js
npm start
rm ./src/systemConfig.js