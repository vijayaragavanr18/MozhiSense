# Use an official Python runtime as a parent image
FROM python:3.10-slim

# System dependencies for Stanza/NLP (if needed)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy requirements and install dependencies
# We copy from the root requirements.txt which has Stanza/inltk
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ ./backend/

# Expose the port Hugging Face Spaces expects
EXPOSE 7860

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=7860

# Command to run the FastAPI app
# We move into backend/ to match the original import structure
CMD ["python3", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
