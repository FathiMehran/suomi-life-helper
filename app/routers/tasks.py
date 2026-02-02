# app/routers/tasks.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db

from app.auth.deps import get_current_user
from app.models import User


router = APIRouter()

# ---------------------------
# Create a Task
# ---------------------------

@router.post("/", response_model=schemas.TaskOut)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)   # 
):
    db_task = models.Task(**task.dict(), owner_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# ---------------------------
# Read all Tasks
# ---------------------------

@router.get("/", response_model=List[schemas.TaskOut])
def read_tasks(
    skip: int = 0,
    limit: int = 100,
    status: str | None = None,
    sort_by: str = "created_at",
    order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(models.Task).filter(
        models.Task.owner_id == current_user.id
    )

    if status:
        query = query.filter(models.Task.status == status)

    sort_column = getattr(models.Task, sort_by, None)
    if not sort_column:
        raise HTTPException(status_code=400, detail="Invalid sort field")

    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    tasks = query.offset(skip).limit(limit).all()
    return tasks



# ---------------------------
# Read single Task by ID
# ---------------------------
@router.get("/{task_id}", response_model=schemas.TaskOut)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(models.Task)
        .filter(
            models.Task.id == task_id,
            models.Task.owner_id == current_user.id
        )
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


# ---------------------------
# Update Task
# ---------------------------
@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    updated_task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(models.Task)
        .filter(
            models.Task.id == task_id,
            models.Task.owner_id == current_user.id
        )
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.title = updated_task.title
    task.description = updated_task.description
    task.status = updated_task.status
    db.commit()
    db.refresh(task)
    return task


# ---------------------------
# Delete Task
# ---------------------------
@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(models.Task)
        .filter(
            models.Task.id == task_id,
            models.Task.owner_id == current_user.id
        )
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"detail": "Task deleted"}

