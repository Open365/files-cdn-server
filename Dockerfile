#############################################################
# DOCKERFILE FOR FILES CDN SERVER
#############################################################
# DEPENDENCIES
# * NodeJS (provided)
# * NotifyFS (inherited)
#############################################################
# BUILD FLOW
# 3. Copy the service to the docker at /var/service
# 4. Run the default installatoin
# 5. Add the docker-startup.sh file which knows how to start
#    the service
#############################################################

FROM docker-registry.eyeosbcn.com/eyeos-notifyfs

ENV InstallationDir /var/service/
ENV WHATAMI cdn

WORKDIR ${InstallationDir}

CMD sh -c 'eyeos-run-server --serf /var/service/src/eyeos-files-cdn-server.js'

RUN mkdir -p ${InstallationDir}/src/ && touch ${InstallationDir}/src/files-cdn-server-installed.js

COPY . ${InstallationDir}

RUN npm install --verbose && \
    npm cache clean
