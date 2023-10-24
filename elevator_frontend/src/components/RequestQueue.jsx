import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const RequestQueue = ({ userRequests, onProcessComplete }) => {
  const [processing, setProcessing] = useState(false);

  const processUserRequests = useCallback(async () => {
    if (!processing && userRequests.length > 0) {
      setProcessing(true);
      try {
        const userRequest = userRequests[0];
        console.log("Processing user request:", userRequest);
        await axios.post("http://localhost:8000/user_request", {
          user_id: userRequest.user_id,
          floor_request: { floor: userRequest.floor },
        });
        console.log("User request processed successfully.");
        // Remove the processed request from the queue
        onProcessComplete();
      } catch (error) {
        console.error("Error handling user request:", error);
      } finally {
        setProcessing(false);
      }
    }
  }, [processing, userRequests, onProcessComplete]);

  useEffect(() => {
    processUserRequests();
  }, [processUserRequests]);

  return (
    <div className="flex items-center justify-center mb-5">
      <div className="bg-gray-100 bg-opacity-80 p-4 rounded-lg border-2 border-black w-80">
        <p className="text-lg text-center">Elevator Queue</p>
        <p className="text-center italic ">
          {processing
            ? "Request is currently processing..."
            : userRequests.length > 0
            ? "Request is in the queue and awaiting processing..."
            : "Queue is currently clear"}
        </p>
      </div>
    </div>
  );
};

export default RequestQueue;
