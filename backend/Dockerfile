FROM python:3.11-slim

WORKDIR /app

# Build context is backend/ (see docker-compose.yml context: ./backend).
# Copy source into /app/backend/ so "from backend.X import …" resolves
# with PYTHONPATH=/app.  Requirements are installed from the /app layer so
# the cache is invalidated only when requirements.txt changes, not on every
# source edit.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . ./backend/

# Make the workspace root the Python path so "from backend.X import …" resolves.
ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
