FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias primero para cache de Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente (se sobreescribirá por el volumen en desarrollo pero es útil para prod)
COPY ./ /app/

# Exponer el puerto de FastAPI
EXPOSE 8000

# Añadir el flag --reload para facilitar el desarrollo
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
