from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os

app = FastAPI(title='MCS AI Service')
model_path = os.getenv('MODEL_PATH', '/models/gpt4all.bin')

class QueryRequest(BaseModel):
    tenant_id: str
    prompt: str

@app.get('/health')
def health():
    return {'status': 'ok', 'model_path': model_path}

@app.post('/ai/chat')
def chat(request: QueryRequest):
    if not request.prompt:
        raise HTTPException(status_code=400, detail='Prompt obrigatório')

    response = {
        'tenant_id': request.tenant_id,
        'prompt': request.prompt,
        'answer': 'Resposta de demonstração MCS: sistema IA com base em conteúdo legal e estatutário do instituto.'
    }
    return response
