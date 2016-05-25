FROM docker-registry.eyeosbcn.com/alpine6-node-base

ENV WHATAMI cdn

ENV InstallationDir /var/service/

WORKDIR ${InstallationDir}

CMD sh -c 'eyeos-run-server --serf /var/service/src/eyeos-files-cdn-server.js'

COPY . ${InstallationDir}

RUN apk update && apk add --no-cache curl make gcc g++ git python krb5-dev && \
    npm install --verbose --production && \
    npm cache clean && \
    apk del curl make gcc g++ git python krb5-dev && \
    rm -fr /etc/ssl /var/cache/apk/* /tmp/*
