# 11. Constructor

## Назначение

Отдельное приложение для разработчиков, позволяющее без программирования добавлять данные мира.

## Объекты

- товары;
- ресурсы;
- цепочки производства;
- здания;
- типы бизнесов;
- профессии;
- законы-шаблоны;
- события;
- технологии;
- страны/шаблоны стран.

## Конструктор создаёт только данные

Он не создаёт новые формулы спроса или новые механизмы рынка. Поведение задаётся Simulation Core.

## Product editor

Поля:

- name;
- category;
- weight;
- volume;
- shelf_life;
- base_quality;
- exchange_tradeable;
- need_category.

## Production chain editor

Визуальный граф:

```text
Resource -> Facility -> IntermediateProduct -> Facility -> Product
```

## Validation

Проверять:

- все входы существуют;
- есть потребители;
- есть работники/энергия;
- есть логистическая возможность;
- нет бесконечной прибыли;
- нет неограниченного цикла ресурсов.

## Mini-simulation

Перед публикацией объект прогоняется в тестовой мини-симуляции и показывает:

- себестоимость;
- спрос;
- влияние на цены;
- влияние на логистику;
- прибыльность;
- риски инфляции/дефицита.

## Publication workflow

Draft -> Validation -> Mini Simulation -> Review -> Publish -> Monitor -> Disable if broken.

## Phase 6 Implementation

`apps/constructor` is implemented as a separate Next.js web app for editing constructor data.

- Sections: Products, Resources, Production Chains, Buildings, Company Types, Laws, Technologies.
- Product editor supports name, category, weight, volume, shelf life, quality, and brand/manufacturer.
- Production chain editor supports inputs, output, labor, energy, time, equipment, waste, and target price.
- JSON import/export is available in the UI.
- Validation checks missing references, duplicate ids, numeric ranges, product cycles, and potential infinite profit.
- Test mini-simulation calculates cost, revenue, profit, break-even price, margin, demand risk, and warnings.

Known follow-up:

- Persist constructor projects through the backend.
- Add a visual production-chain graph.
- Add publish/review workflow with RBAC.
