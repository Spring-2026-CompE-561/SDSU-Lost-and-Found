from fastapi import FastAPI
from app.core.db import Base, engine

# IMPORTANT: import models so Base knows them
from app.models.user import User  # noqa: F401

app = FastAPI()

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

