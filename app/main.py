from fastapi import FastAPI
from app.routers import auth, tasks

app = FastAPI(title="Suomi Life Helper")

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])

@app.get("/")
def root():
    return {"message": "Welcome to Suomi Life Helper API!"}

