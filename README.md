# Controle Financeiro

Sistema de controle financeiro mensal (receitas, despesas por categoria e simulação de "gasto ajustado"), substituindo uma planilha Excel.

## Stack

- **Backend**: Java 21, Spring Boot 3.5, Spring Security (JWT), Spring Data JPA, PostgreSQL, Flyway, MapStruct, Lombok, springdoc-openapi, Testcontainers.
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod, Recharts.
- **Infra**: Docker Compose, PostgreSQL, Nginx (perfil prod), GitHub Actions.

## Estrutura

```
backend/    API REST (Spring Boot)
frontend/   Aplicação web (Next.js)
```

## Rodando localmente

```
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
