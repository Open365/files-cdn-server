#!/bin/bash

set -x 
set -e
set -u
set -o pipefail

sudo docker stop devel_files-cdn-server_instance
sudo docker rm devel_files-cdn-server_instance
