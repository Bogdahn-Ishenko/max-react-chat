# MAX Chat

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=20232A)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=fff)](https://vite.dev/)
[![GREEN--API](https://img.shields.io/badge/GREEN--API-MAX-18A558)](https://green-api.com/max)

Минималистичный React-клиент для отправки и получения текстовых сообщений в MAX через GREEN-API.

## Возможности

- авторизация по `idInstance` и `apiTokenInstance`;
- создание чата по номеру телефона;
- отправка текстовых сообщений;
- получение входящих сообщений через HTTP API Long Polling;
- загрузка истории и локальное кэширование чатов;
- адаптивный интерфейс в стиле MAX.

## Требования

- Node.js 20 или новее;
- активный инстанс GREEN-API для MAX;
- `idInstance` и `apiTokenInstance` из личного кабинета GREEN-API.

## Локальный запуск

```bash
npm install
npm run dev
```

Для production-сборки и проверки проекта:

```bash
npm run build
npm run lint
```

После запуска откройте адрес, который выведет Vite в терминале. Введите credentials GREEN-API, затем номер получателя в формате `7 999 000 00 00`.

## Реализация API

Приложение использует `SendMessage` для отправки текста и связку `receiveNotification` → `deleteNotification` для получения и подтверждения входящих уведомлений. При входе HTTP API на инстансе настраивается автоматически.

Документация: [GREEN-API для MAX](https://green-api.com/max), [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/), [HTTP API](https://green-api.com/v3/docs/api/receiving/technology-http-api/).

## Технологии

React, TypeScript, Vite, React Router, TanStack Query, CSS Modules, Lucide React.
