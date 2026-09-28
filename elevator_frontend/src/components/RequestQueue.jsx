import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const RequestQueue = ({ userRequests, onProcessComplete }) => {
  const [processing, setProcessing] = useState(false);

  const processUserRequests = useCallback(async () => {
    if (!processing && userRequests.length > 0) {
      setProcessing(true);
      try {
        const userRequest = userRequests[0];
        await axios.post("http://localhost:8000/user_request", {
          user_id: userRequest.user_id,
          floor_request: { floor: userRequest.floor },
        });
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

  const status = processing
    ? "Dispatching"
    : userRequests.length > 0
      ? "Call queued"
      : "Standby";

  return (
    <div className="flex items-center justify-between rounded-md bg-black/80 px-3 py-2 font-display text-xs uppercase tracking-[0.18em] text-amber-300">
      <span className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            processing
              ? "animate-pulse bg-amber-300"
              : userRequests.length > 0
                ? "bg-amber-300"
                : "bg-emerald-400"
          }`}
        />
        Hall call
      </span>
      <span>{status}</span>
    </div>
  );
};

export default RequestQueue;
