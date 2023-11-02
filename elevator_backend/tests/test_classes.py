from unittest import IsolatedAsyncioTestCase

from elevator_backend.backend.helpers.classes import Elevator


class TestElevator(IsolatedAsyncioTestCase):

    def test_elevator_initialization(self):
        elevator = Elevator(panel_id=1, current_floor=0, floors_serviced=[0, 1, 2])

        assert elevator.panel_id == 1
        assert elevator.current_floor == 0
        assert elevator.floors_serviced == [0, 1, 2]
        assert elevator.direction is None

        elevator_default = Elevator(panel_id=2)

        assert elevator_default.panel_id == 2
        assert elevator_default.current_floor == 0
        assert elevator_default.floors_serviced == []
        assert elevator_default.direction is None

    async def test_elevator_move(self):
        elevator = Elevator(panel_id=1, current_floor=0, floors_serviced=[0, 1, 2])
        elevator.target_floor = 3

        await elevator.move()

        assert elevator.current_floor == 3
        assert elevator.direction == "up"

        elevator.target_floor = 1

        await elevator.move()

        assert elevator.current_floor == 1
        assert elevator.direction == "down"
