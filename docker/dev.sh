#! /bin/sh

BASEDIR=$(dirname $0)
USERNAME=`whoami`

ACTION=$1
if [ "$ACTION" = "" ]; then
    ACTION="start-service"
fi

sudo docker run --net=host -it -v "/etc/localtime:/etc/localtime:ro" -v `pwd`:/var/service `cat ${BASEDIR}/NAME` $ACTION

sudo chown -hR $USERNAME:$USERNAME `pwd`/*
