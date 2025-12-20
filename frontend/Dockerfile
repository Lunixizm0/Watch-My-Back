# Node.js 18 imajı
FROM node:18-alpine

# Uygulama dizini
WORKDIR /app

# Bağımlılıklar
COPY package*.json ./
RUN npm install

# Kaynak kodlar
COPY . .

# Port
EXPOSE 5000

# Başlat
CMD [ "npm", "start" ]
