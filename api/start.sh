#!/bin/bash
cd /opt/render/project/src
export PYTHONPATH=/opt/render/project/src:$PYTHONPATH
exec uvicorn api.main:app --host 0.0.0.0 --port $PORT