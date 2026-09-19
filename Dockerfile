FROM node:20-slim
WORKDIR /app

# Dependencias primero (mejor caché de capas)
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm run install-all

# Código y compilación del frontend
COPY . .
RUN npm run build

# Hugging Face Spaces expone el puerto 7860
ENV PORT=7860
EXPOSE 7860

CMD ["npm", "start"]
