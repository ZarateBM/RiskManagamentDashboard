FROM node:22.9.0


WORKDIR /app


COPY package*.json ./


RUN npm install --force


COPY . .


# Copia el archivo .env para cargar las variables de entorno
COPY .env .env


# Genera el cliente de Prisma
RUN npx prisma generate


ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL



RUN npm run build


EXPOSE 3005


CMD ["npm", "start"]
