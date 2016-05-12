#!/bin/sh
set -e
set -u

BASEDIR=$(dirname $0)

sudo docker push `cat ${BASEDIR}/NAME`
