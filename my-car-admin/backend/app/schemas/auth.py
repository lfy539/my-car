from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    password: str = Field(min_length=6, max_length=64)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class AdminProfile(BaseModel):
    id: str
    username: str
    nickname: str
    avatar: str
    role: str
    status: int
