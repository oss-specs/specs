FROM node:0.12.4

ADD . /app

WORKDIR /app

RUN npm install

EXPOSE 3000
VOLUME /app/project-data

ENV SPECS_ALLOW_INSECURE_SSL false
ENV SPECS_EXCLUDED_PATHS false

CMD npm start
