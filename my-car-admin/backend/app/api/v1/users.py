from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import get_current_admin
from app.core.utils import now_ts
from app.models.admin import Admin
from app.models.user import User
from app.models.user_event import UserEvent
from app.models.user_favorite import UserFavorite

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
async def list_users(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    keyword: str = "",
    status: int | None = None,
    _: Admin = Depends(get_current_admin),
):
    query = {}
    if keyword:
        query["$or"] = [
            {"nickname": {"$regex": keyword, "$options": "i"}},
            {"openId": {"$regex": keyword, "$options": "i"}},
        ]
    if status is not None:
        query["status"] = status

    total = await User.find(query).count()
    users = (
        await User.find(query)
        .sort([("createdAt", -1)])
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .to_list()
    )

    list_data = []
    for user in users:
        user_id = user.openId
        favorite_count = await UserFavorite.find({"userId": user_id}).count()
        event_count = await UserEvent.find({"userId": user_id}).count()
        user_dict = user.model_dump()
        user_dict["_id"] = str(user.id)
        user_dict["favoriteCount"] = favorite_count
        user_dict["eventCount"] = event_count
        list_data.append(user_dict)

    return {
        "list": list_data,
        "total": total,
        "page": page,
        "pageSize": pageSize,
    }


@router.patch("/{user_id}/status")
async def update_user_status(
    user_id: str,
    payload: dict,
    _: Admin = Depends(get_current_admin),
):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    status = int(payload.get("status", user.status))
    user.status = status
    user.updatedAt = now_ts()
    await user.save()

    return {"ok": True}
