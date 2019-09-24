FROM oaklabs/oak:5.0.9

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install --production && npm cache clean --force

COPY . /app

CMD ["/app"]

ENV API_KEY=K6z0KH8UeYgSgeRVuVWlnzFBfD32 \
    GALLERY_NAME=coffee_shop \
    TZ=America/Los_Angeles