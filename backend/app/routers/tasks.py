from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("", response_model=schemas.TaskDetail, status_code=status.HTTP_201_CREATED)
def create_task(data: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db, data)


@router.get("", response_model=list[schemas.TaskListItem])
def list_tasks(db: Session = Depends(get_db)):
    return crud.list_tasks(db)


@router.get("/{task_id}", response_model=schemas.TaskDetail)
def get_task(task_id: str, db: Session = Depends(get_db)):
    return crud.get_task(db, task_id)


@router.put("/{task_id}", response_model=schemas.TaskDetail)
def update_task(task_id: str, data: schemas.TaskUpdate, db: Session = Depends(get_db)):
    return crud.update_task(db, task_id, data)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str, db: Session = Depends(get_db)):
    crud.delete_task(db, task_id)
