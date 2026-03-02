from app.domain.schemas import TestCaseResponse

def evaluate_quality(response: TestCaseResponse) -> TestCaseResponse:
    """
    Función de 'Scoring Heurístico' que asigna el quality_score basado en:
    - Presencia de precondiciones válidas (+0.2).
    - Mínimo de 3 pasos en el procedimiento (+0.4).
    - Coherencia básica de campos no vacíos (+0.4).
    """
    if not response.test_cases:
        response.quality_score = 0.0
        return response

    total_score = 0.0
    for tc in response.test_cases:
        score = 0.0
        
        # +0.2: Presencia de precondiciones
        if tc.preconditions and tc.preconditions.strip().lower() not in ["none", "n/a", "no aplica", "", "ninguna"]:
            score += 0.2
            
        # +0.4: Mínimo 3 pasos
        if len(tc.steps) >= 3:
            score += 0.4
            
        # +0.4: Coherencia de campos requeridos (no vacíos)
        if tc.title.strip() and tc.expected_result.strip():
            score += 0.4
            
        total_score += min(score, 1.0)
        
    response.quality_score = round(total_score / len(response.test_cases), 2)
    return response
