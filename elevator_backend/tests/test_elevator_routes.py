import asyncio
import uuid
from collections.abc import Coroutine, Iterator
from typing import Any
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, Mock, patch


import elevator_backend
from elevator_backend.backend.helpers.classes import Elevator
from elevator_backend.backend.models.elevators_models import (
    ElevatorConfig,
    ElevatorRequestResponse,
    FloorRequest,
    UserRequest,
)
from elevator_backend.backend.routes import elevator_routes as routes
from elevator_backend.backend.routes.elevator_routes import (
    assigned_elevator,
    configure_elevators,
    delete_configure_elevators,
    get_elevator_locations,
    get_single_elevator_locations,
    handle_user_request,
    request_elevator,
    update_elevator_floor,
    user_request_queue,
)


class ElevatorRouteTestCase(IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        routes.elevators.clear()
        self._drain_queue()

    def tearDown(self) -> None:
        routes.elevators.clear()
        self._drain_queue()

    @staticmethod
    def _drain_queue() -> None:
        while not user_request_queue.empty():
            user_request_queue.get_nowait()
            user_request_queue.task_done()


class TestUserRequestHandler(ElevatorRouteTestCase):
    async def test_handle_user_request(self) -> None:
        test_user_request = UserRequest(
            user_id=uuid.uuid4(),
            floor_request=FloorRequest(floor=5),
        )

        expected_response = ElevatorRequestResponse(
            message="User request received for Floor 5",
        )

        with patch(
            "elevator_backend.backend.routes.elevator_routes.user_request_queue",
            Mock(put=Mock()),
        ):
            response = await handle_user_request(test_user_request)

            assert response == expected_response
            elevator_backend.backend.routes.elevator_routes.user_request_queue.put.assert_called_once_with(
                test_user_request,
            )

    async def test_user_request_queue(self) -> None:
        test_user_request = UserRequest(
            user_id=uuid.uuid4(),
            floor_request=FloorRequest(floor=5),
        )
        await handle_user_request(test_user_request)
        assert user_request_queue.qsize() == 1


class TestAssignedElevatorHandler(ElevatorRouteTestCase):
    async def test_assigned_elevator(self) -> None:
        test_floor_request = FloorRequest(floor=5)
        test_elevator_id = str(uuid.uuid4())

        with patch(
            "elevator_backend.backend.routes.elevator_routes.elevators",
            [
                Mock(panel_id=test_elevator_id, current_floor=5),
                Mock(panel_id=str(uuid.uuid4()), current_floor=7),
                Mock(panel_id=str(uuid.uuid4()), current_floor=6),
            ],
        ):
            expected_elevator_id = test_elevator_id

            response = await assigned_elevator(test_floor_request)

            assert response == expected_elevator_id

    async def test_assigned_elevator_picks_nearest(self) -> None:
        nearest_id = "nearest"
        routes.elevators.extend(
            [
                Elevator(panel_id="far", current_floor=0, floors_serviced=[0]),
                Elevator(panel_id="farther", current_floor=9, floors_serviced=[9]),
                Elevator(panel_id=nearest_id, current_floor=4, floors_serviced=[4]),
            ],
        )

        response = await assigned_elevator(FloorRequest(floor=5))

        assert response == nearest_id

    async def test_assigned_elevator_with_no_elevators(self) -> None:
        response = await assigned_elevator(FloorRequest(floor=1))

        assert response == ElevatorRequestResponse(message="No elevators configured")


class TestConfigureElevatorsHandler(ElevatorRouteTestCase):
    async def test_configure_elevators(self) -> None:
        test_elevator_configs = [
            ElevatorConfig(
                id=str(uuid.uuid4()),
                current_floor=0,
                floors_serviced=[0, 1, 2, 3, 4],
            ),
            ElevatorConfig(
                id=str(uuid.uuid4()),
                current_floor=0,
                floors_serviced=[5, 6, 7, 8, 9],
            ),
        ]

        expected_response = ElevatorRequestResponse(
            message="Elevator configuration updated",
            floors_serviced=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        )

        response = await configure_elevators(test_elevator_configs)

        assert response.message == expected_response.message
        assert set(response.floors_serviced) == set(expected_response.floors_serviced)
        assert len(routes.elevators) == len(test_elevator_configs)
        assert routes.elevators[0].panel_id == test_elevator_configs[0].id
        assert routes.elevators[0].current_floor == 0
        assert routes.elevators[0].floors_serviced == [0, 1, 2, 3, 4]

    async def test_configure_elevators_deduplicates_shared_floors(self) -> None:
        configs = [
            ElevatorConfig(id="a", current_floor=1, floors_serviced=[1, 2, 2]),
            ElevatorConfig(id="b", current_floor=2, floors_serviced=[2, 3]),
        ]

        response = await configure_elevators(configs)

        assert set(response.floors_serviced) == {1, 2, 3}
        assert [elevator.panel_id for elevator in routes.elevators] == ["a", "b"]


class TestGetElevatorLocationsHandler(ElevatorRouteTestCase):
    async def test_get_elevator_locations_with_elevators(self) -> None:
        first_id = str(uuid.uuid4())
        routes.elevators.extend(
            [
                Elevator(
                    panel_id=first_id,
                    current_floor=0,
                    floors_serviced=[0, 1, 2, 3, 4],
                    direction="up",
                ),
                Elevator(
                    panel_id=str(uuid.uuid4()),
                    current_floor=3,
                    floors_serviced=[3, 4, 5, 6, 7],
                    direction="down",
                ),
                Elevator(
                    panel_id=str(uuid.uuid4()),
                    current_floor=6,
                    floors_serviced=[6, 7, 8, 9, 10],
                    direction="none",
                ),
            ],
        )

        response = await get_elevator_locations()

        assert len(response) == len(routes.elevators)
        assert response[0] == {"id": first_id, "current_floor": 0, "direction": "up"}

    async def test_get_elevator_locations_with_no_elevators(self) -> None:
        response = await get_elevator_locations()

        assert isinstance(response, ElevatorRequestResponse)
        assert response.message == "No elevators configured"


class TestDeleteConfigureElevatorsHandler(ElevatorRouteTestCase):
    async def test_delete_configure_elevators(self) -> None:
        test_panel_id = str(uuid.uuid4())
        remaining_id = str(uuid.uuid4())
        routes.elevators.extend(
            [
                Elevator(
                    panel_id=remaining_id,
                    current_floor=0,
                    floors_serviced=[0, 1, 2, 3, 4],
                    direction="up",
                ),
                Elevator(
                    panel_id=test_panel_id,
                    current_floor=3,
                    floors_serviced=[3, 4, 5, 6, 7],
                    direction="down",
                ),
            ],
        )

        response = await delete_configure_elevators(test_panel_id)

        assert isinstance(response, ElevatorRequestResponse)
        assert response.message == f"Elevator {test_panel_id} removed"
        assert [elevator.panel_id for elevator in routes.elevators] == [remaining_id]

    async def test_delete_unknown_elevator_leaves_configuration(self) -> None:
        routes.elevators.append(
            Elevator(panel_id="keep", current_floor=1, floors_serviced=[1]),
        )

        response = await delete_configure_elevators("missing")

        assert response.message == "Elevator missing removed"
        assert [elevator.panel_id for elevator in routes.elevators] == ["keep"]


class TestGetSingleElevatorLocationsHandler(ElevatorRouteTestCase):
    async def test_get_single_elevator_locations_existing(self) -> None:
        test_panel_id = str(uuid.uuid4())
        test_elevators = [
            Elevator(
                panel_id=test_panel_id,
                current_floor=5,
                floors_serviced=[5, 6, 7, 8, 9],
                direction="up",
            ),
            Elevator(
                panel_id=str(uuid.uuid4()),
                current_floor=3,
                floors_serviced=[3, 4, 5, 6, 7],
                direction="down",
            ),
            Elevator(
                panel_id=str(uuid.uuid4()),
                current_floor=8,
                floors_serviced=[8, 9, 10, 11, 12],
                direction="none",
            ),
        ]
        routes.elevators.extend(test_elevators)

        later_elevator = test_elevators[1]
        response = await get_single_elevator_locations(later_elevator.panel_id)

        assert response == {
            "id": later_elevator.panel_id,
            "current_floor": 3,
            "direction": "down",
        }

    async def test_get_single_elevator_locations_nonexistent(self) -> None:
        test_panel_id = str(uuid.uuid4())

        response = await get_single_elevator_locations(test_panel_id)

        assert isinstance(response, ElevatorRequestResponse)
        assert response.message == f"Elevator {test_panel_id} not found"

    async def test_get_single_elevator_locations_when_lookup_changes(self) -> None:
        panel_id = "vanishing"
        elevator = Elevator(
            panel_id=panel_id,
            current_floor=2,
            floors_serviced=[2],
            direction="up",
        )

        class DisappearingElevators:
            def __iter__(self) -> Iterator[Elevator]:
                if not hasattr(self, "seen"):
                    self.seen = True
                    yield elevator

        with patch(
            "elevator_backend.backend.routes.elevator_routes.elevators",
            DisappearingElevators(),
        ):
            response = await get_single_elevator_locations(panel_id)

        assert response.message == f"Elevator {panel_id} not found"


class TestRequestElevatorHandler(ElevatorRouteTestCase):
    async def test_request_elevator(self) -> None:
        test_floor = 5
        routes.elevators.append(
            Elevator(panel_id="car-1", current_floor=0, floors_serviced=[0, 5]),
        )
        scheduled = []
        original_create_task = asyncio.create_task

        def capture_task(coroutine: Coroutine[Any, Any, None]) -> asyncio.Task[None]:
            task = original_create_task(coroutine)
            scheduled.append(task)
            return task

        with (
            patch(
                "elevator_backend.backend.routes.elevator_routes.asyncio.sleep",
                new=AsyncMock(),
            ),
            patch(
                "elevator_backend.backend.routes.elevator_routes.asyncio.create_task",
                capture_task,
            ),
        ):
            response = await request_elevator(FloorRequest(floor=test_floor))
            await asyncio.gather(*scheduled)

        assert response == ElevatorRequestResponse(
            message=f"Elevator requested for Floor {test_floor}",
        )
        assert routes.elevators[0].current_floor == test_floor

    async def test_update_elevator_floor_updates_every_car(self) -> None:
        routes.elevators.extend(
            [
                Elevator(panel_id="a", current_floor=1, floors_serviced=[1]),
                Elevator(panel_id="b", current_floor=4, floors_serviced=[4]),
            ],
        )

        with patch(
            "elevator_backend.backend.routes.elevator_routes.asyncio.sleep",
            new=AsyncMock(),
        ):
            await update_elevator_floor(8)

        assert [elevator.current_floor for elevator in routes.elevators] == [8, 8]
