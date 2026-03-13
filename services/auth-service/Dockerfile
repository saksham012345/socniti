FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/auth-service/package.json services/auth-service/package.json
RUN npm install
COPY . .
EXPOSE 4001
CMD ["npm", "run", "start", "--workspace", "@socniti/auth-service"]
