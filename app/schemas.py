# app/schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


from enum import Enum
from datetime import datetime

from typing import Generic, TypeVar, List
from pydantic import BaseModel

T = TypeVar("T")

class NotificationOut(BaseModel):
    id: int
    title: str
    deadline: datetime

    class Config:
        from_attributes = True


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int

class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    status: str
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskStatus(str, Enum):
    not_started = "not started"
    in_progress = "in progress"
    done = "done"


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
    deadline: Optional[datetime] = None   # ← اضافه شد



class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "not started"
    deadline: Optional[datetime] = None   # 👈 اضافه شود



class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    deadline: Optional[datetime]          # 👈
    created_at: datetime

    class Config:
        from_attributes = True
