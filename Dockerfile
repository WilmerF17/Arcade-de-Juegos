FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production

# Dependencias primero (mejor caché de capas)
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm run install-all && npm cache clean --force

# Código y compilación del frontend
COPY . .
RUN npm run build && rm -rf client/node_modules server/node_modules/.cache /root/.npm

# Usuario no-root + puerto unificado (HF 7860 / Render usa $PORT)
ENV PORT=7860
EXPOSE 7860
RUN chown -R node:node /app
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||7860)+'/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["npm", "start"]
