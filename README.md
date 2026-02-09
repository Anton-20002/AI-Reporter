# Kubernetes Istio Route Detector

Приложение для обнаружения маршрутов сервисов, запущенных в Kubernetes + Istio:
- **Frontend:** React + Vite (`/`)
- **Backend:** Java Spring Boot (`/backend`)

## Что реализовано

### UI (React)
- форма запуска сканирования роутов;
- фильтр по namespace;
- таблица с найденными маршрутами (service, host, gateway, path, protocol);
- сводка по внешним и внутренним роутам.

### Backend (Spring)
- REST endpoint `GET /api/istio/routes?namespace=<name>`;
- сбор данных из `kubectl get virtualservice` и `kubectl get svc`;
- определение:
  - внешних роутов (через Istio Gateway);
  - внутренних mesh-роутов;
  - fallback-роутов на уровне Kubernetes Service.

## Запуск

### 1) Frontend
```bash
npm install
npm run dev
```
UI: `http://localhost:5173`

### 2) Backend
```bash
cd backend
mvn spring-boot:run
```
Backend: `http://localhost:8080`

> Важно: backend использует `kubectl`, поэтому должны быть настроены `kubectl` и доступ к кластеру Kubernetes.
