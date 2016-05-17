FROM docker-registry.eyeosbcn.com/eyeos-fedora21-node-base

ENV InstallationDir /var/service/
ENV WHATAMI cdn

WORKDIR ${InstallationDir}

CMD sh -c 'eyeos-run-server --serf /var/service/src/eyeos-files-cdn-server.js'

RUN mkdir -p ${InstallationDir}/src/ && touch ${InstallationDir}/src/files-cdn-server-installed.js

COPY . ${InstallationDir}

RUN npm install --verbose && \
    npm cache clean
