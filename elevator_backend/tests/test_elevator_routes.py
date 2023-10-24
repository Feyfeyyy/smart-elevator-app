import uuid
from unittest import IsolatedAsyncioTestCase
from unittest.mock import Mock, patch

import elevator_backend
from elevator_backend.backend.models.elevators_models import (
    ElevatorRequestResponse,
    FloorRequest,
    UserRequest,
)
from elevator_backend.backend.routes.elevator_routes import (
    handle_user_request,
    user_request_queue,
)


class TestUserRequestHandler(IsolatedAsyncioTestCase):
    def setUp(self):
        self.test_user_request = UserRequest(
            user_id=uuid.uuid4(), floor_request=FloorRequest(floor=5)
        )

    @patch(
        "elevator_backend.backend.routes.elevator_routes.user_request_queue",
        Mock(put=Mock()),
    )
    async def test_handle_user_request(self):
        expected_response = ElevatorRequestResponse(
            message="User request received for Floor 5"
        )

        response = await handle_user_request(self.test_user_request)

        self.assertEqual(response, expected_response)
        elevator_backend.backend.routes.elevator_routes.user_request_queue.put.assert_called_once_with(
            self.test_user_request
        )

    async def test_user_request_queue(self):
        await handle_user_request(self.test_user_request)
        self.assertEqual(user_request_queue.qsize(), 1)
