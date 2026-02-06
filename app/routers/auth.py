# app/routers/auth.py

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app import models, schemas
from app.database import get_db
from app.models import User
from app.auth.security import verify_password, get_password_hash, create_access_token

router = APIRouter()

# ---------------------------
# Signup
# ---------------------------
@router.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        (models.User.username == user.username) | (models.User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ---------------------------
# Login (Swagger UI + Frontend)
# ---------------------------
@router.post("/login")
async def login(request: Request, db: Session = Depends(get_db)):
    """
    Login endpoint that works both for:
    - Swagger UI Authorize (form data)
    - Frontend (JSON)
    """
    username = None
    password = None

    # تلاش برای دریافت فرم (Swagger UI)
    try:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
    except:
        pass

    # اگر فرم نبود، فرض JSON (Frontend)
    if not username or not password:
        try:
            data = await request.json()
            username = data.get("username")
            password = data.get("password")
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid request format"
            )

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password required"
        )

    # بررسی یوزر
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user or not verify_password(password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    # ایجاد توکن
    access_token = create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}
