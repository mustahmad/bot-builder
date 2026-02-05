FROM node:22-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Устанавливаем зависимости
RUN npm ci

# Генерируем Prisma-клиент
RUN npx prisma generate

# Копируем исходники
COPY . .

# Собираем фронтенд
RUN npm run build

# Порт
EXPOSE 3001

# Запускаем сервер
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
