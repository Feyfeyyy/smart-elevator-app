import asyncio
from queue import Queue
from typing import Any, Dict, List

from fastapi import APIRouter

from backend.helpers.classes import Elevator
from backend.models.elevators_models import (
    ElevatorConfig,
    ElevatorRequestResponse,
    FloorRequest,
    UserRequest,
)

router = APIRouter()

user_request_queue = Queue()
elevators = []


async def update_elevator_floor(floor) -> None:
    """
    Function to update the current floor of an elevator after a delay
    """
    # Simulate the delay
    await asyncio.sleep(5)
    global elevators
    for elevator in elevators:
        elevator.current_floor = floor


@router.post("/user_request", response_model=ElevatorRequestResponse)
async def handle_user_request(user_request: UserRequest) -> ElevatorRequestResponse:
    """
    Endpoint for handling user requests
    """
    user_request_queue.put(user_request)
    return ElevatorRequestResponse(
        message=f"User request received for Floor {user_request.floor_request.floor}"
    )


@router.post("/assigned_elevator", response_model=int)
async def assigned_elevator(floor_request: FloorRequest) -> int:
    """
    Endpoint to assign an elevator to a user request
    """
    # Calculate the distance between the current floor of each elevator and the requested floor
    distances = {
        elevator.panel_id: abs(elevator.current_floor - floor_request.floor)
        for elevator in elevators
    }

    # Select the elevator with the smallest distance
    nearest_elevator = min(distances, key=distances.get)
    return nearest_elevator


@router.post("/configure_elevators", response_model=ElevatorRequestResponse)
async def configure_elevators(
    elevator_configs: List[ElevatorConfig],
) -> ElevatorRequestResponse:
    """
    Endpoint for configuring the elevators
    """
    global elevators
    elevators = [
        Elevator(
            panel_id=config.id,
            current_floor=config.current_floor,
            floors_serviced=config.floors_serviced,
        )
        for config in elevator_configs
    ]
    floor_set = set()
    for config in elevator_configs:
        for floor in config.floors_serviced:
            floor_set.add(floor)
    unique_floor_list = list(floor_set)
    return ElevatorRequestResponse(
        message="Elevator configuration updated", floors_serviced=unique_floor_list
    )


@router.get("/elevator_locations", response_model=ElevatorRequestResponse | List[dict])
async def get_elevator_locations() -> ElevatorRequestResponse | list[dict[str, Any]]:
    """
    Endpoint for getting the current locations of all elevators
    """
    global elevators
    if not elevators:
        return ElevatorRequestResponse(message="No elevators configured")
    return [
        {
            "id": elevator.panel_id,
            "current_floor": elevator.current_floor,
            "direction": elevator.direction,
        }
        for elevator in elevators
    ]


@router.delete(
    "/delete_configure_elevators/{panel_id}", response_model=ElevatorRequestResponse
)
async def delete_configure_elevators(panel_id: int) -> ElevatorRequestResponse:
    """
    Endpoint for deleting the elevators
    """
    global elevators
    for elevator in elevators:
        if elevator.panel_id == panel_id:
            elevators.remove(elevator)
    return ElevatorRequestResponse(message=f"Elevator {panel_id} removed")


@router.get(
    "/elevator_locations/{panel_id}",
    response_model=ElevatorRequestResponse | Dict[str, Any],
)
async def get_single_elevator_locations(
    panel_id: int,
) -> ElevatorRequestResponse | Dict[str, Any]:
    """
    Endpoint for getting the current location of a specific elevator
    """
    if panel_id not in [elevator.panel_id for elevator in elevators]:
        return ElevatorRequestResponse(message=f"Elevator {panel_id} not found")
    for elevator in elevators:
        if elevator.panel_id == panel_id:
            return {
                "id": elevator.panel_id,
                "current_floor": elevator.current_floor,
                "direction": elevator.direction,
            }
    return ElevatorRequestResponse(message=f"Elevator {panel_id} not found")


@router.post("/request_elevator", response_model=ElevatorRequestResponse)
async def request_elevator(floor: FloorRequest) -> ElevatorRequestResponse:
    """
    Endpoint for handling floor requests and returning the elevator number to take
    """
    # Call the function to update the current floor after a delay
    asyncio.create_task(update_elevator_floor(floor.floor))
    return ElevatorRequestResponse(
        message=f"Elevator requested for Floor {floor.floor}"
    )
