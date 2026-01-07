FROM node:18-bullseye

# Directory di lavoro
WORKDIR /app

# Copiamo package.json e lock
COPY package*.json ./

# Installiamo le dipendenze (QUI viene installato platform-express)
RUN npm install

# Copiamo il resto del codice
COPY . .

# Ricompiliamo argon2 per Linux
RUN npm rebuild argon2 --build-from-source

# Generiamo il client Prisma (necessario prima della build TypeScript)
RUN npx prisma generate

# Compiliamo TypeScript
RUN npm run build

# Espone la porta
EXPOSE 3000

# Avvio applicazione
CMD ["node", "dist/src/main.js"]