# Warehouse UI + Java Spring gRPC backend

Пример приложения для управления складом:
- **Frontend:** React + Vite (`/`)
- **Backend:** Java Spring Boot + gRPC (`/backend`)

## Что реализовано

### UI (React)
- таблица остатков с поиском;
- добавление новой номенклатуры;
- регистрация движения (`+/-`) по товару;
- индикаторы риска (низкий/нулевой остаток);
- fallback-режим: если backend недоступен, UI работает на локальных данных.

### Backend (Spring + gRPC)
- gRPC сервис `WarehouseService`:
  - `GetItems`
  - `CreateItem`
  - `RegisterMovement`
- REST-адаптер `/api/*` для веб-клиента:
  - `GET /api/items`
  - `POST /api/items`
  - `POST /api/movements`
- In-memory хранилище для демо.

## Запуск

### 1) Frontend
```bash
npm install
npm run dev
```
UI будет доступен на `http://localhost:5173`.

### 2) Backend
```bash
cd backend
mvn spring-boot:run
```
Backend поднимется на `http://localhost:8080`, gRPC на порту `9090`.

## gRPC контракт
См. файл: `backend/src/main/proto/warehouse.proto`.
