import uvicorn
from backend.routes.elevator_routes import router as elevator_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SmartElevator API",
    version="0.1.0",
    description="Backend for the Smart Elevator application.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(elevator_router, tags=["Elevator"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
