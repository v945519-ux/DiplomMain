FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt requirements-docker.txt ./
RUN pip install --no-cache-dir -r requirements-docker.txt
COPY config/ ./
COPY deploy/start.sh /start.sh
RUN mkdir -p /data /app/media /app/staticfiles
EXPOSE 8000
CMD ["sh", "/start.sh"]
