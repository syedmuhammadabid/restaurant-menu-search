FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --timeout=120 -r requirements.txt

COPY app/ ./app/
COPY data/ ./data/
COPY scripts/ ./scripts/

RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host :: --port ${PORT:-8000}"]
