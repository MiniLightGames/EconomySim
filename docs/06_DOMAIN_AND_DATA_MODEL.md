# 06. Domain and Data Model

## Главные сущности

- User
- PlayerAccount
- Country
- Region
- City
- LandPlot
- Building
- Resource
- ResourceDeposit
- Product
- Brand
- Company
- Department
- ManagerNPC
- Facility
- Warehouse
- InventoryLot
- PopulationCohort
- Bank
- BankAccount
- Loan
- Contract
- Market
- ExchangeOrder
- CargoBatch
- Government
- LawTemplate
- WarCell
- Technology
- PollutionZone
- Event
- Metric
- Snapshot

## Минимальные таблицы первого прототипа

### countries

- id
- name
- currency_id
- political_system
- geometry
- stability

### cities

- id
- country_id
- name
- location
- population_total
- infrastructure_score

### products

- id
- name
- category
- weight
- volume
- shelf_life_days
- base_quality
- exchange_tradeable

### companies

- id
- owner_type
- owner_id
- country_id
- name
- legal_status
- cash_balance
- reputation
- bankruptcy_status

### population_cohorts

- id
- city_id
- size
- income_level
- age_group
- profession_group
- education_level
- savings
- debt
- satisfaction

### warehouses / inventory_lots

Товар всегда находится в конкретном складе или в cargo batch.

### events / metrics / ticks

Каждый тик должен создавать события и метрики для отладки, объяснений, отката и replay.

## Правила данных

- Деньги не изменяются напрямую: только ledger transaction.
- Товары не телепортируются: склад → cargo batch → склад.
- Игрок не меняет состояние напрямую: только commands.
- Финансы чужих частных компаний скрыты.
- Public companies раскрывают отчётность.
