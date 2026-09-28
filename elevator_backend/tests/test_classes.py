from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, patch

from elevator_backend.backend.helpers.classes import Elevator


class TestElevator(IsolatedAsyncioTestCase):
    def test_elevator_initialization(self) -> None:
        panel_id = 1
        default_panel_id = 2
        floors_serviced = [0, 1, 2]
        elevator = Elevator(
            panel_id=panel_id,
            current_floor=0,
            floors_serviced=floors_serviced,
        )

        assert elevator.panel_id == panel_id
        assert elevator.current_floor == 0
        assert elevator.floors_serviced == floors_serviced
        assert elevator.direction is None
        assert elevator.target_floor is None

        elevator_default = Elevator(panel_id=default_panel_id)

        assert elevator_default.panel_id == default_panel_id
        assert elevator_default.current_floor == 0
        assert elevator_default.floors_serviced == []
        assert elevator_default.direction is None
        assert elevator_default.target_floor is None

    async def test_elevator_move(self) -> None:
        start_floor = 0
        up_target = 3
        down_target = 1
        elevator = Elevator(
            panel_id=1,
            current_floor=start_floor,
            floors_serviced=[0, 1, 2],
        )
        elevator.target_floor = up_target

        with patch(
            "elevator_backend.backend.helpers.classes.asyncio.sleep",
            new=AsyncMock(),
        ):
            await elevator.move()

            assert elevator.current_floor == up_target
            assert elevator.direction == "up"

            elevator.target_floor = down_target

            await elevator.move()

        assert elevator.current_floor == down_target
        assert elevator.direction == "down"

    async def test_elevator_move_when_already_at_target(self) -> None:
        floor = 2
        elevator = Elevator(panel_id=1, current_floor=floor, target_floor=floor)

        await elevator.move()

        assert elevator.current_floor == floor
        assert elevator.direction is None
