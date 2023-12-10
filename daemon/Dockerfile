FROM node:current-alpine
WORKDIR /app/daemon/
COPY package*.json /app/daemon/
RUN npm install
COPY . /app/daemon/
CMD ["npm", "run", "dev"]
