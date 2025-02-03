# Select base image
FROM node:18-alpine3.16
# Create app directory
WORKDIR /usr/src/app

# Use environment variables
ENV NODE_ENV=development

# Install python3
RUN apk --no-cache add --virtual python

RUN corepack enable && corepack prepare pnpm@8.6.9 --activate

# Enable `pnpm add --global` on Alpine Linux by setting
# home location environment variable to a location already in $PATH
# https://github.com/pnpm/pnpm/issues/784#issuecomment-1518582235
ENV PNPM_HOME=/usr/local/bin

# Add a global package
RUN pnpm add --global @upleveled/preflight@latest

# Install pnpm
# RUN pnpm setup
RUN pnpm add -g turbo
RUN pnpm add -g pm2

# Copy package files (root and app)
# COPY package*.json ./
COPY ./package*.json ./
COPY ./pnpm*.yaml ./
COPY ./turbo.json ./

COPY ./packages ./packages
COPY ./apps/ArenaArchitect ./apps/ArenaArchitect

# Avoid taking changes from other packages
RUN turbo prune --scope=@tgg/arena-architect --docker

# Install app dependencies
RUN pnpm install --frozen-lockfile

RUN turbo build --filter=@tgg/arena-architect

EXPOSE 3100

# Run the app
CMD if [ "$NODE_ENV" = "production" ]; then \
    pnpm run-migrations && \
    pnpm start; \
    else \
    turbo build --filter=@tgg/arena-architect && \
    turbo dev --filter=@tgg/arena-architect; \
    fi
