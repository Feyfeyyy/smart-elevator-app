import uuid
from typing import List

from pydantic import BaseModel


class FloorRequest(BaseModel):
    floor: int


class ElevatorRequestResponse(BaseModel):
    message: str
    floors_serviced: List[int] = None


class ElevatorConfig(BaseModel):
    id: str
    current_floor: int
    floors_serviced: List[int]


class UserRequest(BaseModel):
    user_id: uuid.UUID
    floor_request: FloorRequest
