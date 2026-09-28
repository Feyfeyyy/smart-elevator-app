# FastAPI Backend Application

This is a Python backend application built using the FastAPI framework. It provides a RESTful API for interacting with the application's functionality.

---

Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Start the server](#start-the-server)
- [Linting](#linting)
- [Formatting](#formatting)

---

## Prerequisites

Before running the application, ensure you have the following dependencies installed:

- [Python 3.11](https://www.python.org/)
- [uv](https://docs.astral.sh/uv/)

---

## Setup

1. Install project dependencies using uv:

```bash
uv sync
```

---

## Start the server

From `elevator_backend`, start the API with uv:

```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server listens on [http://localhost:8000](http://localhost:8000). Interactive API docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## Linting

This project uses [ruff](https://docs.astral.sh/ruff/) for linting. To run the linter, run the following command:

```bash
uv run ruff check .
```

Optionally you can run the linter with the `--fix` flag to automatically fix any linting errors:

```bash
uv run ruff check . --fix
```

---

## Formatting

This project uses [black](https://black.readthedocs.io/en/stable/) for formatting. To run the formatter, run the following command:

```bash
uv run black .
```

This project also uses [isort](https://pycqa.github.io/isort/) for sorting imports. To run the import sorter, run the following command:

```bash
uv run isort .
```
