# 07. Simulation Core

## Назначение

Simulation Core — независимое ядро расчёта мира. Оно принимает состояние, команды и seed, возвращает новое состояние, события и метрики.

## Базовый тик

- базовый тик: 1 игровой час;
- игровой день: 24 тика;
- 1 игровой день = 10 минут реального времени в multiplayer;
- в одиночной версии ускорение доступно разработчикам.

## Tick pipeline

1. принять команды;
2. проверить государственные/законодательные решения;
3. начислить банковские проценты;
4. спланировать производство;
5. добыть ресурсы;
6. произвести товары;
7. продвинуть логистику;
8. обработать розницу/опт/биржи;
9. посчитать потребление населения;
10. обновить занятость и зарплаты;
11. обновить бухгалтерию компаний;
12. проверить кредиты/дефолты;
13. собрать налоги;
14. обновить цены менеджерами;
15. обработать миграцию/демографию;
16. обработать войны;
17. обновить экологию;
18. создать новости;
19. сохранить метрики/snapshot.

## Первый реализованный tick

Текущий bootstrap tick реализует минимальный рабочий цикл:

- production plans создают товары на складах;
- PopulationCohort считает спрос по food/housing/transport/medicine/entertainment;
- розничные покупатели выбирают предложения по цене, доступности и качеству;
- покупки списывают inventory, создают balanced financial transactions и увеличивают cash projection компаний;
- market metrics, shortage events и news создаются каждый tick;
- invalid economy values (`negative`, `NaN`, `Infinity`) блокируются runtime-проверкой.

## Команды

- CreateCompanyCommand
- BuyLandCommand
- BuildFacilityCommand
- HireManagerCommand
- CreateContractCommand
- ApplyLoanCommand
- SetRetailPriceCommand
- PlaceExchangeOrderCommand
- SendCargoCommand

## События

- CompanyRegisteredEvent
- ProductProducedEvent
- ProductSoldEvent
- CargoDelayedEvent
- LoanApprovedEvent
- CompanyBankruptEvent
- ShortageDetectedEvent
- PriceChangedEvent
- WarDamageEvent

## Тесты симуляции

Агент обязан создавать scenario tests:

- дефицит повышает цену;
- плохая логистика создаёт дефицит;
- банкротство уничтожает активы/вклады по правилам;
- война разрушает инфраструктуру;
- реклама увеличивает знание бренда и спрос.
