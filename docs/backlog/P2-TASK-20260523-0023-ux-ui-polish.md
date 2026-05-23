# P2-TASK-20260523-0023 — UX/UI Polish

## Status

Done.

## Goal

Сделать первый игровой экран EconomySim понятным, игровым и пригодным для первого пользователя.

## Delivered

- Чистая ресурсная панель под HUD.
- Карточки стран с выбором, стабильностью и режимом.
- Более информативные карточки компаний игрока.
- Переключатели слоев карты: экономика, логистика, ресурсы, война, загрязнение, инфраструктура.
- Onboarding-панель первых шагов.
- Feedback-панель с ценой, прибылью/убытком, дефицитом, логистическим риском и предупреждениями.
- Loading, error, empty states сохранены и усилены accessibility-атрибутами.
- Skip-link, focus-visible, aria-label/aria-pressed для keyboard navigation.
- Unit-проверки view-model для onboarding и map layer labels.

## Verification

- `pnpm --filter @economysim/web lint`
- `pnpm --filter @economysim/web typecheck`
- `pnpm --filter @economysim/web test`

## Follow-up

- Подключить полноценный E2E gate в CI.
- Сделать onboarding интерактивным после появления отдельных команд покупки ресурса и ручного производства.
- Добавить пользовательские настройки сохранения включенных слоев карты.
