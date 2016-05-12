#!/bin/bash

set -x 
set -e
set -u
set -o pipefail

wsDevenv start_service_devel /mnt/rawFS /mnt/rawFS
wsDevenv run_service_devel bash pre-requirements.sh
wsDevenv run_service_devel node /var/notifyfs/src/eyeos-notifyfs.js &
wsDevenv run_service_devel node /var/user-drive-mounter/src/eyeos-user-drive-mounter.js &
