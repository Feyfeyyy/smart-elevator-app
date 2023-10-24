import uuid
from unittest import IsolatedAsyncioTestCase
from unittest.mock import Mock, patch

import elevator_backend
from elevator_backend.backend.helpers.classes import Elevator
from elevator_backend.backend.models.elevators_models import (
    ElevatorConfig,
    ElevatorRequestResponse,
    FloorRequest,
    UserRequest,
)
from elevator_backend.backend.routes.elevator_routes import (
    assigned_elevator,
    configure_elevators,
    delete_configure_elevators,
    elevators,
    get_elevator_locations,
    get_single_elevator_locations,
    handle_user_request,
    request_elevator,
    user_request_queue,
)


class TestUserRequestHandler(IsolatedAsyncioTestCase):
    async def test_handle_user_request(self):
        test_user_request = UserRequest(
            user_id=uuid.uuid4(), floor_request=FloorRequest(floor=5)
        )

        expected_response = ElevatorRequestResponse(
            message="User request received for Floor 5"
        )

        with patch(
            "elevator_backend.backend.routes.elevator_routes.user_request_queue",
            Mock(put=Mock()),
        ):
            response = await handle_user_request(test_user_request)

            self.assertEqual(response, expected_response)
            elevator_backend.backend.routes.elevator_routes.user_request_queue.put.assert_called_once_with(
                test_user_request
            )

    async def test_user_request_queue(self):
        test_user_request = UserRequest(
            user_id=uuid.uuid4(), floor_request=FloorRequest(floor=5)
        )
        await handle_user_request(test_user_request)
        self.assertEqual(user_request_queue.qsize(), 1)


class TestAssignedElevatorHandler(IsolatedAsyncioTestCase):
    async def test_assigned_elevator(self):
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

            self.assertEqual(response, expected_elevator_id)


class TestConfigureElevatorsHandler(IsolatedAsyncioTestCase):
    async def test_configure_elevators(self):
        test_elevator_configs = [
            ElevatorConfig(
                id=str(uuid.uuid4()), current_floor=0, floors_serviced=[0, 1, 2, 3, 4]
            ),
            ElevatorConfig(
                id=str(uuid.uuid4()), current_floor=0, floors_serviced=[5, 6, 7, 8, 9]
            ),
        ]

        with patch(
            "elevator_backend.backend.routes.elevator_routes.elevators",
            new_callable=Mock,
        ) as mock_elevators:
            expected_response = ElevatorRequestResponse(
                message="Elevator configuration updated",
                floors_serviced=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            )

            response = await configure_elevators(test_elevator_configs)

            self.assertEqual(response.message, expected_response.message)
            self.assertCountEqual(
                response.floors_serviced, expected_response.floors_serviced
            )


class TestGetElevatorLocationsHandler(IsolatedAsyncioTestCase):
    async def test_get_elevator_locations_with_elevators(self):
        elevators.extend(
            [
                Elevator(
                    panel_id=str(uuid.uuid4()),
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
            ]
        )

        with patch(
            "elevator_backend.backend.routes.elevator_routes.elevators", new=elevators
        ):
            response = await get_elevator_locations()

            self.assertIsInstance(response, list)
            self.assertGreater(len(response), 0)
            self.assertIsInstance(response[0], dict)
            self.assertIn("id", response[0])
            self.assertIn("current_floor", response[0])
            self.assertIn("direction", response[0])

    async def test_get_elevator_locations_with_no_elevators(self):
        elevators.clear()

        with patch(
            "elevator_backend.backend.routes.elevator_routes.elevators", new=elevators
        ):
            response = await get_elevator_locations()

            self.assertIsInstance(response, ElevatorRequestResponse)
            self.assertEqual(response.message, "No elevators configured")


class TestDeleteConfigureElevatorsHandler(IsolatedAsyncioTestCase):
    async def test_delete_configure_elevators(self):
        test_panel_id = str(uuid.uuid4())
        test_elevators = [
            Elevator(
                panel_id=str(uuid.uuid4()),
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
            Elevator(
                panel_id=str(uuid.uuid4()),
                current_floor=6,
                floors_serviced=[6, 7, 8, 9, 10],
                direction="none",
            ),
        ]
        elevators.extend(test_elevators)

        with patch(
            "elevator_backend.backend.routes.elevator_routes.elevators", test_elevators
        ):
            response = await delete_configure_elevators(test_panel_id)

            self.assertIsInstance(response, ElevatorRequestResponse)
            self.assertEqual(response.message, f"Elevator {test_panel_id} removed")
            self.assertEqual(len(elevators), 3)


class TestGetSingleElevatorLocationsHandler(IsolatedAsyncioTestCase):
    async def test_get_single_elevator_locations_existing(self):
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
        elevators.extend(test_elevators)

        with patch(
            "elevator_backend.backend.routes.elevator_routes.elevators", test_elevators
        ):
            response = await get_single_elevator_locations(test_panel_id)

            self.assertIsInstance(response, dict)
            self.assertIn("id", response)
            self.assertIn("current_floor", response)
            self.assertIn("direction", response)

    async def test_get_single_elevator_locations_nonexistent(self):
        test_panel_id = str(uuid.uuid4())

        with patch("elevator_backend.backend.routes.elevator_routes.elevators", []):
            response = await get_single_elevator_locations(test_panel_id)

            self.assertIsInstance(response, ElevatorRequestResponse)
            self.assertEqual(response.message, f"Elevator {test_panel_id} not found")


class TestRequestElevatorHandler(IsolatedAsyncioTestCase):
    async def test_request_elevator(self):
        test_floor = 5
        test_floor_request = FloorRequest(floor=test_floor)
        expected_response = ElevatorRequestResponse(
            message=f"Elevator requested for Floor {test_floor}"
        )

        response = await request_elevator(test_floor_request)

        self.assertEqual(response, expected_response)
