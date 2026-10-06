FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
COPY sql ./sql
EXPOSE 5000
CMD ["node", "src/index.js"]
