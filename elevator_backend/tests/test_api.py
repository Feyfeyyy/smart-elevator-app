from http import HTTPStatus
from unittest import TestCase
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient
from httpx import Response

import main
from backend.routes import elevator_routes as routes


class TestElevatorEndpoints(TestCase):
    def setUp(self) -> None:
        routes.elevators.clear()
        while not routes.user_request_queue.empty():
            routes.user_request_queue.get_nowait()
            routes.user_request_queue.task_done()
        self.client = TestClient(main.app)

    def tearDown(self) -> None:
        routes.elevators.clear()

    def assert_json_ok(self, response: Response) -> None:
        assert response.status_code == HTTPStatus.OK
        assert response.headers["content-type"].startswith("application/json")
        response.json()

    def test_endpoints_return_json_ok(self) -> None:
        empty_locations = self.client.get("/elevator_locations")
        self.assert_json_ok(empty_locations)
        assert empty_locations.json()["message"] == "No elevators configured"

        unassigned = self.client.post("/assigned_elevator", json={"floor": 1})
        self.assert_json_ok(unassigned)
        assert unassigned.json()["message"] == "No elevators configured"

        configured = self.client.post(
            "/configure_elevators",
            json=[
                {"id": "car-1", "current_floor": 0, "floors_serviced": [0, 1, 2]},
                {"id": "car-2", "current_floor": 5, "floors_serviced": [3, 4, 5]},
            ],
        )
        self.assert_json_ok(configured)
        body = configured.json()
        assert body["message"] == "Elevator configuration updated"
        assert set(body["floors_serviced"]) == {0, 1, 2, 3, 4, 5}

        locations = self.client.get("/elevator_locations")
        self.assert_json_ok(locations)
        assert [elevator["id"] for elevator in locations.json()] == ["car-1", "car-2"]

        single = self.client.get("/elevator_locations/car-1")
        self.assert_json_ok(single)
        assert single.json()["id"] == "car-1"

        missing = self.client.get("/elevator_locations/missing")
        self.assert_json_ok(missing)
        assert missing.json()["message"] == "Elevator missing not found"

        assigned = self.client.post("/assigned_elevator", json={"floor": 1})
        self.assert_json_ok(assigned)
        assert assigned.json() == "car-1"

        with patch(
            "backend.routes.elevator_routes.asyncio.sleep",
            new=AsyncMock(),
        ):
            requested = self.client.post("/request_elevator", json={"floor": 2})
        self.assert_json_ok(requested)
        assert requested.json()["message"] == "Elevator requested for Floor 2"

        queued = self.client.post(
            "/user_request",
            json={
                "user_id": "11111111-1111-1111-1111-111111111111",
                "floor_request": {"floor": 4},
            },
        )
        self.assert_json_ok(queued)
        assert queued.json()["message"] == "User request received for Floor 4"

        removed = self.client.delete("/delete_configure_elevators/car-2")
        self.assert_json_ok(removed)
        assert removed.json()["message"] == "Elevator car-2 removed"

        remaining = self.client.get("/elevator_locations")
        self.assert_json_ok(remaining)
        assert [elevator["id"] for elevator in remaining.json()] == ["car-1"]
