#!/bin/sh
set -e
set -u

BASEDIR=$(dirname $0)

sudo docker build -t `cat ${BASEDIR}/NAME` .
sudo docker push `cat ${BASEDIR}/NAME`
