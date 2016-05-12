#!/bin/bash
set -e
set -u

start-notifyfs &
node src/eyeos-files-cdn-server.js
