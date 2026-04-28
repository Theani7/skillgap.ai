#!/bin/bash
set -e
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la
echo "Python path: $PYTHONPATH"
export PYTHONPATH=$(pwd):$PYTHONPATH
echo "Updated Python path: $PYTHONPATH"
echo "Trying to import api.main..."
python -c "import api.main; print('Import successful')" 2>&1
echo "Starting uvicorn..."
exec uvicorn api.main:app --host 0.0.0.0 --port $PORT
