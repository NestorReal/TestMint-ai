FROM node:20-alpine

WORKDIR /app

# Copiar configuración de dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar el código
COPY . .

# Deshabilitar telemetría de Next.js (buena práctica en Docker)
ENV NEXT_TELEMETRY_DISABLED 1

# Exponer el puerto
EXPOSE 3000

# Por defecto arrancaremos la app en modo de desarrollo para aprovechar hot-reload
CMD ["npm", "run", "dev"]
