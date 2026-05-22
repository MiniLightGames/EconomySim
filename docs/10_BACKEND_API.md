# 10. Backend API

## Принцип

Игрок не меняет состояние напрямую. Он отправляет намерение/command. Backend проверяет права, деньги, рейтинг, законы, лимиты и передаёт команду ядру.

## Базовые endpoints

### World

```http
GET /api/world/status
GET /api/world/map
GET /api/world/ticks/current
```

### Countries and cities

```http
GET /api/countries
GET /api/countries/:id
GET /api/countries/:id/stats
GET /api/cities/:id
GET /api/cities/:id/economy
```

### Companies

```http
POST /api/commands/create-company
POST /api/commands/buy-land
POST /api/commands/build-facility
POST /api/commands/hire-manager
GET /api/player/companies
GET /api/player/companies/:id
```

### Markets

```http
GET /api/markets/retail
GET /api/markets/exchange/:id/orderbook
POST /api/commands/set-retail-price
POST /api/commands/place-exchange-order
```

### Contracts

```http
POST /api/commands/create-contract
POST /api/commands/accept-contract
GET /api/player/contracts
```

### Banking

```http
GET /api/banks
POST /api/commands/open-bank-account
POST /api/commands/apply-loan
POST /api/commands/repay-loan
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
