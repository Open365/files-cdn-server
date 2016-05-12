#!/bin/bash

set -x 
set -e
set -u

pgrep -f eyeos-files-cdn-server | sudo xargs -r kill
wsDevenv run_service_devel node src/eyeos-files-cdn-server.js
