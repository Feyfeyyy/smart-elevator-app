import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../api";
import ElevatorConfiguration from "./ElevatorConfiguration";
import RequestQueue from "./RequestQueue";
import ElevatorLocations from "./ElevatorLocations";

import { v4 as uuidv4 } from "uuid";

function ElevatorControlPanel() {
  const [floor, setFloor] = useState(0);
  const [assignedElevator, setAssignedElevator] = useState(null);
  const [elevatorConfig, setElevatorConfig] = useState([]);
  const [showElevatorLocations, setShowElevatorLocations] = useState(false);
  const [showManualFloorInput, setShowManualFloorInput] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newElevatorConfigs, setNewElevatorConfigs] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseFloor, setResponseFloor] = useState("");
  const [userRequests, setUserRequests] = useState([]);

  useEffect(() => {
    async function fetchElevatorConfig() {
      try {
        const response = await axios.get(
          `${API_URL}/elevator_locations`
        );
        setElevatorConfig(response.data);
      } catch (error) {
        console.error("Error fetching elevator configuration:", error);
      }
    }
    if (showElevatorLocations) {
      fetchElevatorConfig();
    }
  }, [showElevatorLocations]);

  useEffect(() => {
    if (formSubmitted) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(
            `${API_URL}/elevator_locations`
          );
          setElevatorConfig(response.data);
        } catch (error) {
          console.error("Error fetching elevator configuration:", error);
        }
      }, 500);

      return () => clearInterval(interval); // Clear the interval on unmounting to prevent memory leaks
    }
  }, [formSubmitted]);

  const handleShowManualFloorInput = () => {
    setShowManualFloorInput(true); // Set the state to true to show the manual floor input
  };

  const handleCancelManualFloorInput = () => {
    setShowManualFloorInput(false); // Set the state to false to hide the manual floor input
    setFloor(0); // Reset the floor value
  };

  const handleRequestElevator = async () => {
    try {
      const user_id = uuidv4();
      const newUserRequests = [
        ...userRequests,
        { user_id: user_id, floor: floor },
      ];
      setUserRequests(newUserRequests);

      const requestElevatorPromise = axios.post(
        `${API_URL}/request_elevator`,
        { floor: floor }
      );
      const assignedElevatorPromise = axios.post(
        `${API_URL}/assigned_elevator`,
        { floor: floor }
      );
      const getElevatorLocationsPromise = axios.get(
        `${API_URL}/elevator_locations`
      );
      const [, assignedElevatorResponse, getElevatorLocationsResponse] =
        await axios.all([
          requestElevatorPromise,
          assignedElevatorPromise,
          getElevatorLocationsPromise,
        ]);

      setAssignedElevator(assignedElevatorResponse.data);
      if (Array.isArray(getElevatorLocationsResponse.data)) {
        setElevatorConfig(getElevatorLocationsResponse.data);
      }
      setShowElevatorLocations(true);
    } catch (error) {
      console.error("Error requesting elevator:", error);
    }
  };

  const handleConfigureElevator = () => {
    setShowForm(true);
  };

  const handleAddElevator = () => {
    setNewElevatorConfigs((prevConfigs) => [
      ...prevConfigs,
      { id: 0, current_floor: 0, floors_serviced: [], direction: "none" },
    ]);
  };

  const handleRemoveElevator = (index) => {
    const updatedElevatorConfigs = [...newElevatorConfigs];
    updatedElevatorConfigs.splice(index, 1);
    setNewElevatorConfigs(updatedElevatorConfigs);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/configure_elevators`,
        newElevatorConfigs
      );
      setResponseMessage(response.data.message);
      setResponseFloor(response.data.floors_serviced);
      setElevatorConfig(response.data);
      setNewElevatorConfigs([]); // Reset the form
      setShowForm(false); // Hide the form after submission
      setFormSubmitted(true);
      setShowElevatorLocations(true);
      setTimeout(() => {
        setResponseMessage(""); // Clear the response message after 5 seconds
      }, 5000); // 5 seconds (in milliseconds)
      try {
        const response = await axios.get(
          `${API_URL}/elevator_locations`
        );
        setElevatorConfig(response.data);
      } catch (error) {
        console.error("Error fetching elevator configuration:", error);
      }
    } catch (error) {
      console.error("Error configuring elevators:", error);
    }
  };

  const handleInputChange = (event, index) => {
    const { name, value } = event.target;
    const updatedElevatorConfigs = [...newElevatorConfigs];
    if (name === "floors_serviced") {
      // Convert the input value to a list
      const floorList = value.split(",").map((floor) => {
        const parsedFloor = parseInt(floor.trim());
        return isNaN(parsedFloor) ? 0 : parsedFloor;
      });
      updatedElevatorConfigs[index][name] = floorList;
    } else {
      updatedElevatorConfigs[index][name] = value;
    }
    setNewElevatorConfigs(updatedElevatorConfigs);
  };

  const cars = Array.isArray(elevatorConfig) ? elevatorConfig : [];
  const floors = Array.isArray(responseFloor)
    ? [...responseFloor].sort((left, right) => Number(right) - Number(left))
    : [];
  const panelReady = cars.length > 0 || floors.length > 0;
  const assignedLabel =
    assignedElevator && typeof assignedElevator !== "object"
      ? String(assignedElevator)
      : assignedElevator?.message;
  const movingCar =
    cars.find((car) => String(car.id) === assignedLabel) || cars[0];
  const displayFloor = movingCar
    ? String(movingCar.current_floor).padStart(2, "0")
    : "--";
  const hallDirection = movingCar?.direction;
  const isTraveling = hallDirection === "up" || hallDirection === "down";
  const travelLabel = isTraveling ? `Passing ${displayFloor}` : "Idle";

  return (
    <div className="flex w-full max-w-3xl items-stretch justify-center gap-5">
      <section
        className="relative hidden w-56 flex-col self-stretch overflow-hidden rounded-sm md:flex"
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center">
          <div className="led-window mt-6 w-24 rounded-md py-3 text-center text-4xl">
            {displayFloor}
          </div>
        </div>
        <div className="flex min-h-[28rem] flex-1">
          <div className="door w-1/2 border-r border-black/30" />
          <div className="door w-1/2 border-l border-black/40" />
        </div>
        <p className="absolute inset-x-0 bottom-6 text-center text-[10px] uppercase tracking-[0.28em] text-slate-800/70">
          {isTraveling ? travelLabel : "Doors"}
        </p>
      </section>

      <section className="panel-metal w-full max-w-sm rounded-[2rem] p-4">
        <div className="rounded-[1.4rem] bg-gradient-to-b from-black/10 to-black/5 p-4">
          <header className="mb-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-700">
              Smart Elevator
            </p>
          </header>

          <div className="space-y-3">
            <div className="led-window rounded-lg px-4 py-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">
                    Floor
                  </p>
                  <p className="text-5xl leading-none">{displayFloor}</p>
                </div>
                <p className="pb-1 text-right text-sm uppercase tracking-[0.16em]">
                  {hallDirection === "up"
                    ? `▲ ${travelLabel}`
                    : hallDirection === "down"
                      ? `▼ ${travelLabel}`
                      : "● Idle"}
                </p>
              </div>
            </div>

            <RequestQueue
              userRequests={userRequests}
              onProcessComplete={() => setUserRequests(userRequests.slice(1))}
            />

            {showElevatorLocations && (
              <ElevatorLocations elevatorConfig={elevatorConfig} />
            )}

            {showForm ? (
              <div className="rounded-xl bg-slate-100/80 p-3">
                <ElevatorConfiguration
                  showForm={showForm}
                  newElevatorConfigs={newElevatorConfigs}
                  handleFormSubmit={handleFormSubmit}
                  handleInputChange={handleInputChange}
                  handleAddElevator={handleAddElevator}
                  handleRemoveElevator={handleRemoveElevator}
                  setShowForm={setShowForm}
                />
              </div>
            ) : (
              <>
                {panelReady ? (
                  <div className="rounded-xl bg-black/10 p-4">
                    <p className="mb-3 text-center text-[10px] uppercase tracking-[0.22em] text-slate-600">
                      Select floor
                    </p>
                    <div className="mx-auto grid max-w-[14rem] grid-cols-3 justify-items-center gap-3">
                      {floors.map((servedFloor) => (
                        <button
                          key={servedFloor}
                          type="button"
                          onClick={() => setFloor(servedFloor)}
                          className={`floor-button font-display text-lg ${
                            isTraveling &&
                            Number(movingCar.current_floor) === Number(servedFloor)
                              ? "is-passing"
                              : Number(floor) === Number(servedFloor)
                                ? "is-selected"
                                : ""
                          }`}
                        >
                          {servedFloor}
                        </button>
                      ))}
                    </div>

                    {showManualFloorInput ? (
                      <div className="mt-4 space-y-2">
                        <label className="block text-center text-[10px] uppercase tracking-[0.18em] text-slate-600">
                          Floor number
                          <input
                            type="number"
                            value={floor}
                            onChange={(event) => setFloor(event.target.value)}
                            className="led-window mt-2 w-full rounded-md py-2 text-center text-3xl outline-none"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleCancelManualFloorInput}
                          className="w-full text-xs uppercase tracking-wider text-slate-600"
                        >
                          Close keypad
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleShowManualFloorInput}
                        className="mt-4 w-full text-center text-[10px] uppercase tracking-[0.18em] text-slate-600"
                      >
                        Enter floor
                      </button>
                    )}

                    <div className="mt-5 flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={handleRequestElevator}
                        className="call-button font-display text-xs"
                      >
                        Call
                      </button>
                      {assignedLabel && (
                        <p className="text-center text-sm text-slate-800">
                          Proceed to car{" "}
                          <span className="font-display text-base">{assignedLabel}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-black/10 px-4 py-8 text-center">
                    <p className="font-display text-3xl text-slate-800">--</p>
                    <p className="mt-2 text-sm text-slate-600">
                      This bank has no cars yet. Open service setup to add one.
                    </p>
                  </div>
                )}

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleConfigureElevator}
                    className="text-[11px] uppercase tracking-[0.2em] text-slate-600 underline-offset-4 hover:underline"
                  >
                    Service setup
                  </button>
                  {responseMessage && (
                    <p className="mt-2 text-sm text-slate-800">{responseMessage}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ElevatorControlPanel;
