#! /bin/sh

BASEDIR=$(dirname $0)
USERNAME=`whoami`

npm install
/var/service/start-dev.sh
