FROM node
WORKDIR /app
COPY . /app
RUN  npm i
CMD node index.js