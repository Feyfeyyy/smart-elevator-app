function ElevatorConfiguration({
  showForm,
  newElevatorConfigs,
  handleFormSubmit,
  handleInputChange,
  handleAddElevator,
  handleRemoveElevator,
  setShowForm,
}) {
  if (!showForm) {
    return null;
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-600">
          Cars to add · {newElevatorConfigs.length}
        </p>
        <button
          type="button"
          onClick={handleAddElevator}
          className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
        >
          Add car
        </button>
      </div>

      {newElevatorConfigs.length === 0 && (
        <p className="rounded-md bg-black/5 px-3 py-4 text-center text-sm text-slate-600">
          Add a car, then list the floors it serves.
        </p>
      )}

      {newElevatorConfigs.map((config, index) => {
        const floorsValue = Array.isArray(config.floors_serviced)
          ? config.floors_serviced.join(", ")
          : config.floors_serviced;

        return (
          <fieldset
            key={index}
            className="space-y-3 rounded-lg border border-black/10 bg-white/40 p-3"
          >
            <legend className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              Car {index + 1}
            </legend>
            <label className="block text-sm">
              <span className="mb-1 block text-xs uppercase tracking-wider text-slate-500">
                Car id
              </span>
              <input
                type="text"
                name="id"
                value={config.id}
                onChange={(event) => handleInputChange(event, index)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-900"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs uppercase tracking-wider text-slate-500">
                Current floor
              </span>
              <input
                type="number"
                name="current_floor"
                value={config.current_floor}
                onChange={(event) => handleInputChange(event, index)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-900"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs uppercase tracking-wider text-slate-500">
                Floors served
              </span>
              <input
                type="text"
                name="floors_serviced"
                value={floorsValue}
                onChange={(event) => handleInputChange(event, index)}
                placeholder="0, 1, 2, 3"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-900"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Separate floors with commas.
              </span>
            </label>
            <button
              type="button"
              onClick={() => handleRemoveElevator(index)}
              className="text-xs font-medium uppercase tracking-wider text-red-700"
            >
              Remove car
            </button>
          </fieldset>
        );
      })}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 rounded-full bg-slate-900 py-2.5 text-sm font-medium text-white"
        >
          Save cars
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="rounded-full px-4 py-2.5 text-sm text-slate-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ElevatorConfiguration;
