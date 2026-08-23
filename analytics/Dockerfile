# Analytics Dockerfile for Python Data Science / ETL Engine
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi
COPY . .
EXPOSE 5000
CMD ["python", "src/main.py"]
