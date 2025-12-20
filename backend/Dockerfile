# Node.js 18 tabanlı imaj kullan
FROM node:18-slim

# Gerekli sistem kütüphanelerini yükle (Puppeteer için)
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Uygulama dizinini oluştur
WORKDIR /app

# Bağımlılıkları kopyala
COPY package*.json ./

# Bağımlılıkları yükle (Puppeteer Chrome indirmesini atla, sistem Chrome'unu kullanacağız)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

RUN npm install

# Kaynak kodları kopyala
COPY . .

# Portu dışa aç
EXPOSE 3001

# Uygulamayı başlat
CMD [ "npm", "start" ]
