FROM docker-registry.eyeosbcn.com/alpine6-node-base

ENV WHATAMI cdn

ENV InstallationDir /var/service/

WORKDIR ${InstallationDir}

CMD sh -c 'eyeos-run-server --serf /var/service/src/eyeos-files-cdn-server.js'

COPY . ${InstallationDir}

# krb5-dev is for mongoose
RUN /scripts-base/buildDependencies.sh --production --install && \
    npm install --verbose --production && \
    npm cache clean && \
    /scripts-base/buildDependencies.sh --production --purgue && \
    rm -fr /etc/ssl /var/cache/apk/* /tmp/*
