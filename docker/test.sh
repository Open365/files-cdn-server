#! /bin/sh

BASEDIR=$(dirname $0)
USERNAME=`whoami`

sudo docker run --net=host -it -v "/etc/localtime:/etc/localtime:ro" -v `pwd`:/var/service `cat ${BASEDIR}/NAME` "./test.sh"

sudo chown -hR $USERNAME:$USERNAME `pwd`/*
