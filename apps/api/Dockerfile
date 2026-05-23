FROM node:24-alpine AS builder

WORKDIR /repo
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/simulation-core/package.json packages/simulation-core/package.json
RUN pnpm install --frozen-lockfile
RUN pnpm install -w --frozen-lockfile

COPY . .
RUN pnpm --dir packages/db exec prisma generate --schema prisma/schema.prisma
RUN pnpm exec turbo run build --filter=@economysim/api...

CMD ["pnpm", "--filter", "@economysim/api", "start"]
