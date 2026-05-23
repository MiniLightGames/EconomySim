# Government, Politics, And Laws Phase

This document captures the first government vertical slice for EconomySim. The
slice adds country governments, political parties, elections, law templates,
taxes, budgets, debt, subsidies, licenses, sanctions, corruption, protests, and
player influence.

## Scope

The government slice adds:

- government, party, election, law, tax, budget, public-debt, subsidy, license,
  sanction, corruption, protest, lobbying, and media-influence domain entities;
- Prisma models for the government and politics data needed by production
  persistence;
- a `simulation-core` government step that collects taxes, spends budgets,
  updates stability, creates protests, enacts or rejects draft laws, applies
  media and lobbying influence, enforces licenses, and performs nationalization;
- backend endpoints for governments, country laws, country budgets, lobbying,
  media campaigns, and voting;
- web UI for government status, laws, taxes, budget, parties, elections,
  protests, player lobbying, media campaigns, voting, and politics news;
- constructor law-template editing with type, parameters, restrictions, and
  economic impact.

## Rules

Every country has a political regime and a government. Players do not become
politicians. A player can vote only if they have assets, investments, or an
active company. NPC population votes dominate player votes by design.

Players can spend money on lobbying and media campaigns. These actions are
validated by the backend and recorded as simulation-core financial
transactions. They influence parties and draft law support but do not directly
rewrite the world.

Laws are developer-authored templates. The simulation updates draft law support
from party popularity, media reach, lobbying, and corruption, then enacts or
rejects laws based on metrics. Active laws feed tax policy, license enforcement,
deposit insurance, nationalization, import/export controls, and future bailout
rules.

## Implemented Laws

The seed world includes templates for:

- corporate profit tax;
- retail sales tax;
- import tariff;
- food export restriction;
- industry license;
- environmental compliance fine;
- martial law;
- strategic nationalization;
- deposit insurance.

## API

The backend exposes:

- `GET /governments`
- `GET /countries/:id/government`
- `GET /countries/:id/laws`
- `GET /countries/:id/budget`
- `POST /lobbying`
- `POST /media-campaigns`
- `POST /vote`

Political write endpoints validate player identity, country, party, command
shape, available player balance, and voting eligibility. There is no endpoint
for direct law activation or direct money creation.

## Tests

The government slice covers:

- tax collection;
- budget updates;
- laws affecting companies;
- rejection of votes by players without assets;
- NPC vote weight exceeding player vote weight;
- nationalization changing company ownership;
- license enforcement suspending an unlicensed business;
- API coverage for government reads, lobbying, media campaigns, and voting.

## Follow-Up

Future iterations should add:

- explicit audit-log records for lobbying, media, tax, subsidy, and
  nationalization commands;
- richer law templates and balance checks in Constructor;
- import/export route mutation from sanctions and export controls;
- government bond issuance through the exchange order book;
- campaign finance limits and anti-corruption investigations;
- dedicated political event timelines and polling charts;
- normalized repositories for government entities instead of snapshot-only
  persistence.
