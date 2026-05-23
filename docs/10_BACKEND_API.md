# 10. Backend API

## Принцип

Игрок не меняет состояние напрямую. Он отправляет намерение/command. Backend проверяет права, деньги, рейтинг, законы, лимиты и передаёт команду ядру.

## Реализованный Fastify API

Текущий `apps/api` использует Fastify. По умолчанию local dev работает с in-memory bootstrap store, а Prisma-режим включается через `API_STORE=prisma` после `pnpm db:generate`.

### Health

```http
GET /health
```

### World

```http
GET /world
GET /world/summary
```

### Countries and cities

```http
GET /countries
GET /countries/:id
GET /cities/:id
```

### Companies

```http
GET /companies
GET /companies/:id
POST /companies
```

`POST /companies` принимает намерение игрока, валидирует страну, имя и дубликаты, затем создаёт компанию через backend service. Игрок не может передать готовый объект мира.

### Markets

```http
GET /markets
GET /markets/:id
```

Обычные рынки не используют стакан: API отдаёт retail offers, доступность и среднюю цену.

### Simulation

```http
POST /simulation/tick
```

`POST /simulation/tick` валидирует команды до вызова `simulation-core`. Если команда ссылается на неизвестную страну/город/компанию/товар, тик не сохраняется.

### News and metrics

```http
GET /news
GET /metrics
```

## Запланированные endpoints

```http
POST /commands/create-contract
POST /commands/accept-contract
GET /player/contracts
GET /banks
POST /commands/open-bank-account
POST /commands/apply-loan
POST /commands/repay-loan
```

## Ошибки

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Not enough funds",
    "details": {}
  }
}
```

## Требования

- Все endpoints с validation.
- Все финансовые операции через ledger.
- Все важные действия в audit log.
- Rate limits.
- RBAC.
- Нельзя раскрывать приватные данные чужих частных компаний.
