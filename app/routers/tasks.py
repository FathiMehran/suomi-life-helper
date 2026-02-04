# app/routers/tasks.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db

from app.auth.deps import get_current_user
from app.models import User
from sqlalchemy import  desc, asc, or_

from fastapi import Query
from datetime import datetime, timedelta

router = APIRouter()

# ---------------------------
# Create a Task
# ---------------------------

@router.post("/", response_model=schemas.TaskOut)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_task = models.Task(
        title=task.title,
        description=task.description,
        status=task.status,
        deadline=task.deadline,   # 👈 این خط حیاتی است
        owner_id=current_user.id,
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


# ---------------------------
# Notification Task
# ---------------------------

@router.get("/notifications")
def task_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    hours: int = Query(24, ge=1, le=168),
):
    now = datetime.utcnow()
    upcoming = now + timedelta(hours=hours)

    tasks = (
        db.query(models.Task)
        .filter(
            models.Task.owner_id == current_user.id,
            models.Task.deadline != None,
            models.Task.deadline <= upcoming,
            models.Task.status != "done",
        )
        .order_by(models.Task.deadline.asc())
        .all()
    )

    return tasks


# ---------------------------
# Read all Tasks
# ---------------------------


@router.get("/", response_model=schemas.PaginatedResponse[schemas.TaskOut])
def read_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),

    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at"),   # یا title
    order: str = Query("desc"),            # asc / desc
    status: str | None = Query(None),
    search: str | None = Query(None),
):
    query = db.query(models.Task).filter(models.Task.owner_id == current_user.id)

    # فیلتر status
    if status:
        query = query.filter(models.Task.status == status)

    # فیلتر search روی title و description
    if search:
        query = query.filter(
            or_(
                models.Task.title.ilike(f"%{search}%"),
                models.Task.description.ilike(f"%{search}%")
            )
        )

    total = query.count()

    # sort ساده
    if hasattr(models.Task, sort_by):
        column = getattr(models.Task, sort_by)
        query = query.order_by(desc(column) if order == "desc" else asc(column))

    tasks = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": tasks,
        "total": total,
        "page": page,
        "page_size": page_size
    }





# ---------------------------
# Read single Task by ID
# ---------------------------
@router.get("/{task_id}", response_model=schemas.TaskOut)
#@router.get("/", response_model=schemas.TaskOut)

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


