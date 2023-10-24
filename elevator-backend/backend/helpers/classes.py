import asyncio
from typing import List


class Elevator:
    def __init__(self, panel_id, current_floor=0, floors_serviced=None):
        if floors_serviced is None:
            floors_serviced = []
        self.panel_id: int = panel_id
        self.current_floor: int = current_floor
        self.floors_serviced: List = floors_serviced
        self.target_floor = None
        self.direction = None

    async def move(self):
        while self.target_floor is not None and self.current_floor != self.target_floor:
            if self.current_floor < self.target_floor:
                self.direction = "up"
                self.current_floor += 1
            else:
                self.direction = "down"
                self.current_floor -= 1
            await asyncio.sleep(1)
