from fastapi import FastAPI
from app.routers import auth, tasks
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Suomi Life Helper")

origins = [
    "http://localhost:5173",  # آدرس فرانت‌اند Vite
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # یا ["*"] برای همه
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])

@app.get("/")
def root():
    return {"message": "Welcome to Suomi Life Helper API!"}

