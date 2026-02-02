# app/schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# User
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True

# Task
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "not started"

class TaskCreate(TaskBase):
    pass

class TaskOut(TaskBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

