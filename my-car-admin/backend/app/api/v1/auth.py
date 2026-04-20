from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_admin
from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.models.admin import Admin
from app.schemas.auth import AdminProfile, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> TokenResponse:
    admin = await Admin.find_one(Admin.username == payload.username)
    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )
    if admin.status != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账号已禁用",
        )

    now_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
    admin.last_login_at = now_ms
    admin.updated_at = now_ms
    await admin.save()

    token = create_access_token(admin.username)
    return TokenResponse(
        access_token=token,
        expires_in=settings.JWT_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=AdminProfile)
async def me(current_admin: Admin = Depends(get_current_admin)) -> AdminProfile:
    return AdminProfile(
        id=str(current_admin.id),
        username=current_admin.username,
        nickname=current_admin.nickname,
        avatar=current_admin.avatar,
        role=current_admin.role,
        status=current_admin.status,
    )
