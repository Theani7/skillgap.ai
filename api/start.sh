#!/bin/bash
export PYTHONPATH=$(pwd):$PYTHONPATH
exec uvicorn api.main:app --host 0.0.0.0 --port $PORT