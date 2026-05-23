FROM node:24-alpine AS builder

WORKDIR /repo
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/constructor/package.json apps/constructor/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile
RUN pnpm install -w --frozen-lockfile

COPY . .
RUN pnpm exec turbo run build --filter=@economysim/constructor...

CMD ["pnpm", "--filter", "@economysim/constructor", "start"]
