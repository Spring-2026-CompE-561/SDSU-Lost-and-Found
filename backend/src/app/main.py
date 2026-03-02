# src/app/main.py
from fastapi import FastAPI
from app.core.db import engine, Base

app = FastAPI()

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)