#!/bin/bash

trap "sleep 10" EXIT

if [[ ! "$PROJECT_NAME" == "" ]]; then
  nodemon --config ./nodemon.json --watch . ./src/server.js 2>&1
else
  pm2-docker --raw ./process.json
fi
