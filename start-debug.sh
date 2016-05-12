#!/bin/bash
set -e
set -u

start-notifyfs &
node --debug-brk=5858 src/eyeos-files-cdn-server.js
