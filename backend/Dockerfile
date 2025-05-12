FROM python:3.11-slim

# ───── 1) system packages + Microsoft repo (key-ring, no apt-key) ─────
RUN apt-get update && \
    apt-get install -y --no-install-recommends gnupg curl unixodbc unixodbc-dev && \
    curl -sSL https://packages.microsoft.com/keys/microsoft.asc \
      | gpg --dearmor -o /usr/share/keyrings/microsoft.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] \
         https://packages.microsoft.com/debian/12/prod bookworm main" \
      > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql18 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ───── 2) python dependencies ─────
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ───── 3) source code & launch ─────
COPY . .
CMD ["sh", "-c", "gunicorn -b :$PORT core.wsgi:application"]
ENV PORT=8080