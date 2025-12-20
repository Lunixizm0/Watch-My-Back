# Resmi Puppeteer imajını kullan (Chrome ve gerekli kütüphanelerle gelir)
FROM ghcr.io/puppeteer/puppeteer:21.5.2

# Ortam değişkenleri
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Çalışma dizini
WORKDIR /app

# Dosyaları kopyala (pptruser yetkisiyle)
# Bu imaj root olmayan 'pptruser' kullanır, bu yüzden sahiplik önemlidir
COPY --chown=pptruser:pptruser package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Kaynak kodları kopyala
COPY --chown=pptruser:pptruser . .

# Port
EXPOSE 3001

# Başlat
CMD [ "npm", "start" ]
