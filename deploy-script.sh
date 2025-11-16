#!/bin/bash
set -x
set -e

npm install;

npm run migration:run && npm build
