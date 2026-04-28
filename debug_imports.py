#!/usr/bin/env python3
"""Debug script to test imports"""
import sys
import os

print("Python version:", sys.version)
print("Current directory:", os.getcwd())
print("Files in directory:", os.listdir("."))
print("Files in api:", os.listdir("api") if os.path.exists("api") else "api not found")

# Test imports
try:
    import fastapi
    print("✓ fastapi imported")
except Exception as e:
    print("✗ fastapi import failed:", e)

try:
    import uvicorn
    print("✓ uvicorn imported")
except Exception as e:
    print("✗ uvicorn import failed:", e)

try:
    import sqlalchemy
    print("✓ sqlalchemy imported")
except Exception as e:
    print("✗ sqlalchemy import failed:", e)

try:
    import google.generativeai
    print("✓ google.generativeai imported")
except Exception as e:
    print("✗ google.generativeai import failed:", e)

try:
    from api.main import app
    print("✓ api.main imported")
except Exception as e:
    print("✗ api.main import failed:", e)
    import traceback
    traceback.print_exc()

print("Done.")