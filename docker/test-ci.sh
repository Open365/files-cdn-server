#! /bin/sh

BASEDIR=$(dirname $0)
USERNAME=`whoami`

sudo docker pull `cat ${BASEDIR}/NAME`
sudo docker run --net=host -v "/etc/localtime:/etc/localtime:ro" -v `pwd`:/var/service `cat ${BASEDIR}/NAME` "/var/service/test-ci.sh"

sudo chown -hR $USERNAME:$USERNAME `pwd`/*
