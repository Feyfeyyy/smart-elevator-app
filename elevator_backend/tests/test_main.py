import runpy
from pathlib import Path
from unittest import TestCase
from unittest.mock import patch

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import main


class TestApp(TestCase):
    def test_app_exposes_elevator_routes_and_cors(self) -> None:
        assert isinstance(main.app, FastAPI)
        assert main.app.title == "SmartElevator API"
        assert main.app.version == "0.1.0"

        paths = {getattr(route, "path", None) for route in main.app.routes}
        assert "/user_request" in paths
        assert "/assigned_elevator" in paths
        assert "/configure_elevators" in paths
        assert "/elevator_locations" in paths
        assert "/elevator_locations/{panel_id}" in paths
        assert "/delete_configure_elevators/{panel_id}" in paths
        assert "/request_elevator" in paths

        cors = main.app.user_middleware[0]
        assert cors.cls is CORSMiddleware
        assert cors.options["allow_origins"] == ["http://localhost:3000"]
        assert cors.options["allow_credentials"]
        assert cors.options["allow_methods"] == ["*"]
        assert cors.options["allow_headers"] == ["*"]

    def test_main_starts_uvicorn(self) -> None:
        main_path = Path(main.__file__)

        expected_host = "0.0.0.0"  # noqa: S104
        expected_port = 8000

        with patch("uvicorn.run") as run_server:
            runpy.run_path(str(main_path), run_name="__main__")

        app = run_server.call_args.args[0]
        assert isinstance(app, FastAPI)
        assert run_server.call_args.kwargs["host"] == expected_host
        assert run_server.call_args.kwargs["port"] == expected_port
