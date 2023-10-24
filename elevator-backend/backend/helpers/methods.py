import asyncio
import logging

from fastapi import HTTPException

from backend.helpers.classes import Elevator
from backend.routes.elevator_routes import request_elevator, user_request_queue

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def process_user_requests() -> None:
    """
    Function to process the user requests sequentially

    :return: None
    """
    while True:
        while not user_request_queue.empty():
            user_request = user_request_queue.get()
            try:
                elevator_number = await request_elevator(user_request.floor_request)
                logger.info(
                    f"User {user_request.user_id} assigned Elevator {elevator_number}"
                )
            except HTTPException as e:
                logger.error(f"Error processing user request: {e}")
            user_request_queue.task_done()
        await asyncio.sleep(1)


async def simulate_elevators() -> None:
    """
    Simulating the movement of elevators

    :return: None
    """
    elevators = []

    for i in range(3):
        elevators.append(
            Elevator(panel_id=i, current_floor=0, floors_serviced=[0, 1, 2])
        )

    while True:
        for elevator in elevators:
            logger.info(
                f"Elevator {elevator.panel_id} is at floor {elevator.current_floor} and moving {elevator.direction}"
            )
            await elevator.move()
