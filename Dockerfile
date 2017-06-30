FROM node:6-alpine

ENV alpine 1
WORKDIR /src

RUN apk --no-cache add openssl
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64
RUN chmod +x /usr/local/bin/dumb-init
ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]

# These make it easier to work within a container.
RUN npm install -g pm2 pino nodemon

# 1. Install the packages needed to compile native modules.
# 2. Install our native NodeJS modules into /src/node_modules.
# 3. Copy our native NodeJS modules into /node_modules.
# 4. Delete all remaining modules in /src/node_modules,
#    they're the JS dependencies of the native modules.
# 5. Move the native NodeJS modules back into /src/node_modules.
# 6. Uninstall the packages needed to compile native modules.
RUN apk add --no-cache make gcc g++ python libc6-compat bash && \
    echo '{ }' > package.json && \
    npm install farmhash grpc memwatch-next msgpack && \
    mkdir -p /node_modules && cd /src/node_modules && \
    cp -r `ls | egrep '^(farmhash|grpc|memwatch-next|msgpack)$'` /node_modules/ && \
    rm -rf /src/node_modules/* && \
    apk del make gcc g++ python

ADD . .

# Copy the new node_modules over those in /src/node_modules being
# careful not to override any modules we're already installed!!
RUN cd /node_modules && cp -r ./* /src/node_modules/
