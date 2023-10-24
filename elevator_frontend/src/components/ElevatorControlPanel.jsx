import React, { useState, useEffect } from "react";
import axios from "axios";
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
          "http://localhost:8000/elevator_locations"
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
            "http://localhost:8000/elevator_locations"
          );
          setElevatorConfig(response.data);
        } catch (error) {
          console.error("Error fetching elevator configuration:", error);
        }
      }, 5000); // Fetch every 5 seconds

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
        "http://localhost:8000/request_elevator",
        { floor: floor }
      );
      const assignedElevatorPromise = axios.post(
        "http://localhost:8000/assigned_elevator",
        { floor: floor }
      );
      const getElevatorLocationsPromise = axios.get(
        "http://localhost:8000/elevator_locations"
      );
      const [
        requestElevatorResponse,
        assignedElevatorResponse,
        getElevatorLocationsResponse,
      ] = await axios.all([
        requestElevatorPromise,
        assignedElevatorPromise,
        getElevatorLocationsPromise,
      ]);

      setAssignedElevator(assignedElevatorResponse.data);
      const updatedElevatorConfig = getElevatorLocationsResponse.data.map(
        (elevator) => {
          if (elevator.current_floor === floor) {
            return { ...elevator, direction: "none" };
          } else if (elevator.current_floor < floor) {
            return { ...elevator, direction: "up" };
          } else {
            return { ...elevator, direction: "down" };
          }
        }
      );

      setElevatorConfig(updatedElevatorConfig);
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
        "http://localhost:8000/configure_elevators",
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
          "http://localhost:8000/elevator_locations"
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

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <RequestQueue
        userRequests={userRequests}
        onProcessComplete={() => setUserRequests(userRequests.slice(1))}
      />
      {showElevatorLocations && (
        <ElevatorLocations elevatorConfig={elevatorConfig} />
      )}
      <div className="w-1/2 mb-10">
        {elevatorConfig.length === 0 ? (
          <div className="text-center">
            <p className="text-2xl text-red-500">
              Please first configure the elevator.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 mb-10">
            <p className="text-2xl text-center italic">Choose a floor:</p>
            <div className="flex items-center space-x-4">
              {responseFloor.map((floor, index) => (
                <button
                  key={index}
                  onClick={() => setFloor(floor)}
                  className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                >
                  {`Floor ${floor}`}
                </button>
              ))}
            </div>
          </div>
        )}
        {!showManualFloorInput && elevatorConfig.length > 0 && (
          <div className="flex justify-center mb-4">
            <button
              onClick={handleShowManualFloorInput}
              className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-2 py-1 text-center mr-2 mb-2 italic"
            >
              Manually Enter Floor
            </button>
          </div>
        )}
        {showManualFloorInput && elevatorConfig.length > 0 && (
          <div>
            <label className="block mb-4 text-6xl font-medium text-gray-900 dark:text-white">
              Floor Number:
              <div className="text-xs italic text-gray-500 dark:text-gray-400">
                (what floor are you on?)
              </div>
              <input
                type="number"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full p-4 mt-5 text-9xl bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </label>
            <div className="flex justify-center mb-4">
              <button
                onClick={handleCancelManualFloorInput}
                className="py-2 px-4 bg-red-500 text-white rounded-lg"
              >
                Cancel Manual Entry
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-center">
          {elevatorConfig.length === 0 ? (
            <div></div>
          ) : (
            <button
              onClick={handleRequestElevator}
              className="relative inline-flex items-center justify-center p-1 mb-2 mr-2 overflow-hidden text-3xl font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 mb-5"
            >
              <span className="relative px-6 py-3 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                Request Elevator
              </span>
            </button>
          )}
        </div>
        <div className="relative flex justify-center">
          {assignedElevator && (
            <div className="bg-gray-100 bg-opacity-80 p-4 rounded-lg text-lg relative">
              Your Assigned Elevator: <strong>{assignedElevator}</strong>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center flex-col mb-10">
        {!showForm && (
          <div>
            <button
              onClick={handleConfigureElevator}
              className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-lg px-20 py-10 text-center mr-2 mb-2"
            >
              Configure Elevator
            </button>
            {responseMessage && (
              <div className="bg-gray-100 border border-gray-300 p-4 rounded-md my-4">
                <p className="text-lg text-center text-gray-800">
                  {responseMessage}
                </p>
              </div>
            )}
          </div>
        )}
        {showForm && (
          <ElevatorConfiguration
            showForm={showForm}
            newElevatorConfigs={newElevatorConfigs}
            handleFormSubmit={handleFormSubmit}
            handleInputChange={handleInputChange}
            handleAddElevator={handleAddElevator}
            handleRemoveElevator={handleRemoveElevator}
            setShowForm={setShowForm}
          />
        )}
      </div>
    </div>
  );
}

export default ElevatorControlPanel;
