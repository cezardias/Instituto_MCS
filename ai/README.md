# AI Service

Serviço Python para IA local com GPT4All.

## Como usar

1. Coloque o modelo GPT4All em `ai/models/gpt4all.bin`.
2. Atualize `MODEL_PATH` nas variáveis de ambiente.
3. Rode `docker compose up --build ai`.

## Endpoints

- `GET /health`
- `POST /ai/chat`
