import os
import instructor
from openai import AsyncOpenAI
from app.domain.schemas import TestCaseResponse
from app.services.prompt_engineering import EXPERT_QA_SYSTEM_PROMPT
from app.evaluator.scoring import evaluate_quality
from dotenv import load_dotenv

load_dotenv()

# Usamos instructor para parchear el cliente Async de OpenAI
# Esto permite pasar variables Pydantic y asegurar que el modelo retorna un JSON estricto
client = instructor.patch(AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY")))

async def generate_test_cases(user_story: str) -> TestCaseResponse:
    """
    Llama a la API de OpenAI forzando la respuesta del modelo TestCaseResponse.
    Configuramos retries automáticos si la respuesta falla estructuralmente.
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini", # Opciones: gpt-3.5-turbo, gpt-4, etc.
            response_model=TestCaseResponse,
            max_retries=3, # Instructor volverá a intentar si el JSON es inválido
            messages=[
                {"role": "system", "content": EXPERT_QA_SYSTEM_PROMPT},
                {"role": "user", "content": f"Historia de Usuario a evaluar:\n{user_story}"}
            ],
            temperature=0.3,   # Baja latencia y alta consistencia de formato
            max_tokens=1000    # Suficiente para generar casos exhaustivos
        )
        # Evaluamos heurísticamente el quality_score de cada caso antes de retornar
        response_with_scores = evaluate_quality(response)
        return response_with_scores

    except Exception as e:
        # Aquí enviaríamos el log de error a Sentry o DataDog en un entorno real
        raise RuntimeError(f"Error generando casos de prueba: {str(e)}")
