# TestMint.ai

**Autor**: Nestor Real

TestMint.ai es un microservicio diseñado para generar **casos de prueba estructurados** automáticamente a partir de **Historias de Usuario (User Stories)** utilizando Inteligencia Artificial (OpenAI o Gemini) integrada con `instructor` para forzar esquemas JSON precisos.

## Arquitectura del Proyecto

El proyecto está divivido en dos servicios principales:

1. **Backend** (Python / FastAPI)
2. **Frontend** (Next.js 14 / React)

### Decisiones Arquitectónicas

#### 1. Backend: FastAPI y Clean Architecture

Hemos elegido **FastAPI** por su alto rendimiento y, sobre todo, porque aprovecha **Pydantic v2** de manera nativa. Pydantic nos permite definir el esquema exacto de casos de prueba que esperamos recibir del modelo (LLM).

El código del backend sigue los principios de **Clean Architecture**, dividiendo responsabilidades en:

- `domain/`: Contiene los Pydantic schemas puramente definitivos de los datos.
- `services/`: Contiene la lógica profunda: llamadas al LLM vía la librería `instructor`, reintentos en caso de JSON fallido, e Ingeniería de Prompts (Prompt Engineering) de forma aislada.
- `evaluator/`: Algoritmos de puntaje local. Aquí aplicamos la _Scoring Heuristic_ (puntaje de calidad) para evitar que el LLM lo evalúe por nosotros a ojo; es más predecible si lo evaluamos por código basado en presencia de campos.

#### 2. Frontend: Next.js 14 con App Router

Usamos el **App Router de Next.js** con React y Tailwind CSS para implementar un diseño _Apple-style_.

- Utilizamos **Server Components** por defecto para minimizar el JavaScript enviado al cliente.
- Implementamos **Skeleton Loaders** avanzados durante los tiempos muertos mientras el LLM responde, garantizando una UX sin saltos bruscos en el navegador.

#### 3. LLM Integration: La librería `instructor`

El mayor problema al depender de IA generativa es que a veces rompe el formato de JSON.
`instructor` parchea el cliente de OpenAI (o equivalentes) y obliga al modelo a respetar un esquema Pydantic, lanzando validaciones en bucle y reescribiendo la respuesta si ésta no se amolda a lo que el Frontend necesita.

## Trade-offs (Compromisos)

- **Latencia vs Calidad:** Asegurar el formato (`instructor` retries) e inducir al modelo a ser un "QA Experto" exigiendo múltiples Casos Borde y Error paths (vía System Prompt) aumentará el tiempo de respuesta total comparado al de una API normal. Aceptamos una latencia de ~3 a ~8 segundos en aras de obtener JSONs perfectos y casos de prueba altamente calificados y exhaustivos.

## Consideraciones de Costo

- **Modelo Elegido (`gpt-4o-mini`):** Se ha evaluado que usar `gpt-4o-mini` reduce drásticamente los costos (~$0.15 / 1M input tokens, ~$0.60 / 1M output tokens) comparado con `gpt-4o`, manteniendo una capacidad excepcional para seguir instrucciones JSON estructuradas gracias a _instructor_.
- **Gestión de Retries:** El límite de reintentos (`max_retries=3`) asegura que un fallo recurrente de estructura no genere requests infinitos hacia la API del LLM, protegiendo el presupuesto.
- **Eficiencia de Contexto:** El _System Prompt_ ha sido condensado para evitar tokens superfluos, centrando el coste únicamente en el resultado.

## Escalabilidad Futura (Colas de Mensajes)

Actualmente, las llamadas del cliente esperan asíncronamente a que el LLM termine. Si la plataforma recibe miles de peticiones, saturaríamos los _workers_ de FastAPI.
Para **escalar horizontalmente**, el plan a futuro es introducir **RabbitMQ (o Redis/Celery)**:

1. El usuario envía una petición. FastAPI la encola en RabbitMQ inmediatamente y le responde con un `job_id`.
2. Varios _workers_ aislados recogen la historia, contactan al LLM en paralelo.
3. El frontend consulta periódicamente su `job_id` (o recibe el resultado por WebSockets) sin bloquear solicitudes entrantes.

## Instrucciones de Lanzamiento (Local)

Ejecuta el servicio de forma súper rápida usando Docker Compose (que expone los puertos necesarios y asegura un entorno limpio):

```bash
# Iniciar servicios con hot-reload habilitado (Recomendado para Dev)
docker-compose up --build
```

- Frontend en: `http://localhost:3000`
- Backend API en: `http://localhost:8000`
- Documentación Swagger (Auto-generada): `http://localhost:8000/docs`
