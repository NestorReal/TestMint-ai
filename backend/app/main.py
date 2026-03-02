from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.domain.schemas import TestCaseResponse
from app.services.llm_service import generate_test_cases
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("TestMintAPI")

load_dotenv()

app = FastAPI(
    title="TestMint.ai API",
    description="Microservicio inteligente para la generación de Casos de Prueba a partir de Historias de Usuario.",
    version="1.0.0"
)

# Configuración básica de CORS para que Next.js pueda consumir esta API sin problemas
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserStoryRequest(BaseModel):
    user_story: str

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "TestMint.ai API is running."}

@app.post("/generate-tests", response_model=TestCaseResponse)
async def generate_tests(request: UserStoryRequest):
    """
    Endpoint principal para generar casos de prueba.
    Recibe un UserStoryRequest con el texto de la historia de usuario y
    retorna un TestCaseResponse validado.
    """
    if not request.user_story or len(request.user_story.strip()) < 10:
        logger.warning("Solicitud rechazada: Historia de usuario demasiado corta o vacía.")
        raise HTTPException(status_code=400, detail="La historia de usuario es demasiado corta o está vacía.")
    
    try:
        logger.info(f"Procesando nueva historia de usuario (Longitud: {len(request.user_story)} caracteres)")
        # Llamamos al servicio de LLM para orquestar la generación estructurada
        result = await generate_test_cases(request.user_story)
        logger.info(f"Generación exitosa. {len(result.test_cases)} casos de prueba creados. Quality Score: {result.quality_score}")
        return result
    except Exception as e:
        logger.error(f"Error interno durante la generación: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
