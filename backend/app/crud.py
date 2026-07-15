from sqlalchemy.orm import Session

from app import models, schemas


class TaskNotFoundError(Exception):
    pass


def create_task(db: Session, data: schemas.TaskCreate) -> models.Task:
    task = models.Task(**data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def list_tasks(db: Session) -> list[models.Task]:
    return db.query(models.Task).order_by(models.Task.due_at.asc().nulls_last()).all()


def get_task(db: Session, task_id: str) -> models.Task:
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if task is None:
        raise TaskNotFoundError(task_id)
    return task


def update_task(db: Session, task_id: str, data: schemas.TaskUpdate) -> models.Task:
    task = get_task(db, task_id)
    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: str) -> None:
    task = get_task(db, task_id)
    db.delete(task)
    db.commit()
