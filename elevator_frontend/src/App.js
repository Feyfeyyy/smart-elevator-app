import React from "react";
import ElevatorControlPanel from "./components/ElevatorControlPanel";

function App() {
  return (
    <div className="min-h-screen px-4 py-10 text-slate-900">
      <main className="mx-auto flex max-w-5xl items-start justify-center">
        <ElevatorControlPanel />
      </main>
    </div>
  );
}

export default App;
