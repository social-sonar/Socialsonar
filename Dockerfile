# Uses the official Node.js image as the base
FROM node:18-alpine

# Sets the working directory within the container
WORKDIR /app

# Copies package.json and package-lock.json files
COPY package*.json ./

# Copies .env.local file
COPY .env.local ./.env.local

# Installs dependencies
RUN npm install

# Copies the rest of the application files
COPY . .

# Generates the Prisma client
RUN npx prisma generate

# Exposes the port on which the application will run
EXPOSE 3000

# Defines the default command to run the application
CMD ["npm", "run", "dev"]