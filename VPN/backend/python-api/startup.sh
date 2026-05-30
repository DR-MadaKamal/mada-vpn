#!/bin/bash
cd /home/site/wwwroot
echo "Starting MadaVPN Backend..." > /tmp/startup.log
python -c "from app.main import app; print('Import OK')" >> /tmp/startup.log 2>&1 || echo "Import failed" >> /tmp/startup.log
gunicorn --bind=0.0.0.0:8080 --timeout 600 --workers 4 --worker-class uvicorn.workers.UvicornWorker app.main:app 2>&1 | tee -a /tmp/startup.log
