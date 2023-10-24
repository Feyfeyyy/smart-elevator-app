import asyncio
import logging

from main import Elevator, elevators

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    # Example setup for three elevators
    for i in range(3):
        elevators.append(Elevator(eid=i, current_floor=0, floors_serviced=[0, 1, 2]))

    # Simulating the movement of elevators
    async def simulate_elevators():
        while True:
            for elevator in elevators:
                logger.info(
                    f"Elevator {elevator.eid} is at floor {elevator.current_floor} and moving {elevator.direction}"
                )
                await elevator.move()

    asyncio.run(simulate_elevators())
