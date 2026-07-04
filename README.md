# Instituto MCS Platform

Projeto completo para o Instituto Movimento de Cultura Social com frontend, backend e serviço de IA containerizados.

## Arquitetura

- frontend: React + Vite
- backend: Node.js + Express + GraphQL + REST
- ai: FastAPI + GPT4All open source
- docker-compose: containers para frontend, backend e ai

## Como iniciar

1. Copie o `.env.example` para `.env` e ajuste as variáveis.
2. Coloque seu modelo GPT4All em `ai/models/gpt4all.bin`.
3. Execute:

```bash
docker compose up --build
```

## Tecnologias

- React, Vite, TypeScript, CSS moderno
- Express, GraphQL, JWT, SQLite local
- FastAPI, Python, GPT4All

## Observações

O `nginx` externo pode ser configurado na VPS para gerenciar os contêineres em produção.
