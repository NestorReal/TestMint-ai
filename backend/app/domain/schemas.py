from pydantic import BaseModel, Field
from typing import List

class TestCase(BaseModel):
    title: str = Field(..., description="Un título breve y descriptivo del caso de prueba.")
    preconditions: str = Field(..., description="Condiciones previas o estado del sistema antes de ejecutar los pasos.")
    steps: List[str] = Field(..., description="Lista ordenada de pasos precisos para reproducir el caso.")
    expected_result: str = Field(..., description="El resultado esperado después de ejecutar el último paso.")

class TestCaseResponse(BaseModel):
    test_cases: List[TestCase] = Field(..., description="Lista de casos de prueba estructurados generados a partir de la historia de usuario.")
    quality_score: float = Field(default=0.0, description="Puntuación de calidad heurística de la respuesta.")
