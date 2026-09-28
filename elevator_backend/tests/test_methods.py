import asyncio
import uuid
from typing import Never
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException

from elevator_backend.backend.helpers.classes import Elevator
from elevator_backend.backend.helpers.methods import (
    process_user_requests,
    simulate_elevators,
)
from elevator_backend.backend.models.elevators_models import FloorRequest, UserRequest
from elevator_backend.backend.routes.elevator_routes import user_request_queue


class TestProcessUserRequests(IsolatedAsyncioTestCase):
    def tearDown(self) -> None:
        while not user_request_queue.empty():
            user_request_queue.get_nowait()
            user_request_queue.task_done()

    async def test_process_user_requests_assigns_elevator(self) -> None:
        requested_floor = 3
        user_request = UserRequest(
            user_id=uuid.uuid4(),
            floor_request=FloorRequest(floor=requested_floor),
        )
        user_request_queue.put(user_request)

        async def stop(_delay: float) -> Never:
            raise asyncio.CancelledError

        with (
            patch(
                "elevator_backend.backend.helpers.methods.request_elevator",
                new=AsyncMock(return_value=1),
            ) as request_mock,
            patch(
                "elevator_backend.backend.helpers.methods.asyncio.sleep",
                stop,
            ),
            pytest.raises(asyncio.CancelledError),
        ):
            await process_user_requests()

        request_mock.assert_awaited_once_with(user_request.floor_request)
        assert user_request_queue.empty()

    async def test_process_user_requests_logs_http_errors(self) -> None:
        requested_floor = 2
        user_request = UserRequest(
            user_id=uuid.uuid4(),
            floor_request=FloorRequest(floor=requested_floor),
        )
        user_request_queue.put(user_request)

        async def stop(_delay: float) -> Never:
            raise asyncio.CancelledError

        with (
            patch(
                "elevator_backend.backend.helpers.methods.request_elevator",
                new=AsyncMock(side_effect=HTTPException(status_code=400, detail="bad")),
            ),
            patch(
                "elevator_backend.backend.helpers.methods.asyncio.sleep",
                stop,
            ),
            patch(
                "elevator_backend.backend.helpers.methods.logger.error",
            ) as error_log,
            pytest.raises(asyncio.CancelledError),
        ):
            await process_user_requests()

        error_log.assert_called_once()
        assert "Error processing user request" in error_log.call_args.args[0]
        assert user_request_queue.empty()


class TestSimulateElevators(IsolatedAsyncioTestCase):
    async def test_simulate_elevators_moves_each_car_once_per_pass(self) -> None:
        calls = {"count": 0}
        cars_per_pass = 3
        cancel_on_call = cars_per_pass + 1

        async def fake_move(_elevator: Elevator) -> None:
            calls["count"] += 1
            if calls["count"] == cancel_on_call:
                raise asyncio.CancelledError

        with (
            patch(
                "elevator_backend.backend.helpers.methods.Elevator.move",
                fake_move,
            ),
            pytest.raises(asyncio.CancelledError),
        ):
            await simulate_elevators()

        assert calls["count"] == cancel_on_call
