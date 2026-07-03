# BússolaFin

Sistema de controle financeiro mensal (receitas, despesas por categoria e simulação de "gasto ajustado"), substituindo uma planilha Excel.

🔗 **Aplicação publicada**: [bussolafin.vercel.app](https://bussolafin.vercel.app/login)

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

## Deploy gratuito (Neon + Render + Vercel)

Banco no [Neon](https://neon.tech), backend no [Render](https://render.com) (via `render.yaml`
neste repositório) e frontend no [Vercel](https://vercel.com).

### 1. Banco de dados (Neon)

1. Crie um projeto no Neon e copie a *connection string* (formato
   `postgresql://usuario:senha@host/dbname?sslmode=require`).
2. Não é preciso criar tabelas manualmente — o Flyway roda as migrations automaticamente
   quando o backend sobe.

### 2. Backend (Render)

1. No Render, "New" → "Blueprint", aponte para este repositório (ele detecta o `render.yaml`
   na raiz).
2. Preencha as variáveis marcadas como secretas no painel do serviço `bussolafin-api`:
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<host-do-neon>/<dbname>?sslmode=require`
     (mesma connection string do Neon, mas no formato JDBC — prefixo `jdbc:` antes de
     `postgresql://`, sem usuário/senha na URL).
   - `SPRING_DATASOURCE_USERNAME` e `SPRING_DATASOURCE_PASSWORD`: do Neon.
   - `JWT_SECRET` é gerado automaticamente pelo Render (`generateValue: true`).
3. Guarde a URL pública gerada (ex: `https://bussolafin-api.onrender.com`) — vai precisar dela
   no passo do Vercel.
4. O plano gratuito "dorme" após um tempo sem requisições; a primeira chamada depois disso
   demora um pouco para acordar o serviço.

### 3. Frontend (Vercel)

1. Importe este repositório no Vercel e defina **Root Directory: `frontend`**.
2. Configure as variáveis de ambiente do projeto:
   - `BACKEND_INTERNAL_URL`: a URL pública do backend no Render (passo anterior).
   - `COOKIE_SECURE`: `true` (o Vercel já serve tudo em HTTPS).
   - `JWT_COOKIE_NAME`: `bf_session` (opcional, já é o padrão).
3. Deploy. A cada push no branch principal, o Vercel republica automaticamente.
