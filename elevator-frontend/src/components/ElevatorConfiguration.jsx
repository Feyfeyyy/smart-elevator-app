import React from "react";

function ElevatorConfiguration({
  showForm,
  newElevatorConfigs,
  handleFormSubmit,
  handleInputChange,
  handleAddElevator,
  handleRemoveElevator,
  setShowForm,
}) {
  return (
    <div>
      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="container mx-auto bg-gray-300 rounded-xl shadow border p-8 w-full max-w-lg"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-sm text-gray-900 dark:text-white">
                Elevators Configured:{" "}
                <strong>{newElevatorConfigs.length}</strong>
              </span>
            </div>
            <div>
              <button
                type="button"
                onClick={handleAddElevator}
                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 ml-5"
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                  Add Additional Elevator
                </span>
              </button>
            </div>
          </div>
          {newElevatorConfigs.map((config, index) => (
            <div key={index} className="relative z-0 w-full mb-6 group">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Elevator ID:
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-1-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                    </svg>
                  </span>
                  <input
                    type="number"
                    name="id"
                    value={config.id}
                    onChange={(e) => handleInputChange(e, index)}
                    className={`"rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" ${
                      config.id ? "border-gray-300" : "border-red-500"
                    } rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white`}
                  />
                </div>
                {!config.id && (
                  <p className="text-red-500 text-xs italic">
                    Please fill out this field.
                  </p>
                )}
              </label>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Elevator Currently On Floor:
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-1-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="black"
                      viewBox="0 0 122.88 86.89"
                    >
                      <path d="M1.85,41.59,43.44,0,86.89,43.44,43.44,86.89,0,43.44l1.85-1.85ZM74,5.45,79.44,0l43.44,43.44L79.43,86.8l-5.5-5.5,3.7-3.71,1.82,1.82,36-36-36-36L77.69,9.16,74,5.45Zm-18.4.6,6-6,43.44,43.44L61.64,86.89l-5.82-5.82,3.71-3.7,2.11,2.11,36-36-36-36L59.29,9.75l-3.7-3.7ZM43.44,7.41l-36,36,36,36,36-36-36-36Z" />
                    </svg>
                  </span>
                  <input
                    type="number"
                    name="current_floor"
                    value={config.current_floor}
                    onChange={(e) => handleInputChange(e, index)}
                    className={`"rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" ${
                      config.current_floor
                        ? "border-gray-300"
                        : "border-red-500"
                    } rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white`}
                  />
                </div>
                {!config.current_floor && (
                  <p className="text-red-500 text-xs italic">
                    Please fill out this field.
                  </p>
                )}
              </label>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Floors To Service:
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-1-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 231.233 231.233"
                    >
                      <path d="M230.505,102.78c-0.365-3.25-4.156-5.695-7.434-5.695c-10.594,0-19.996-6.218-23.939-15.842  c-4.025-9.855-1.428-21.346,6.465-28.587c2.486-2.273,2.789-6.079,0.705-8.721c-5.424-6.886-11.586-13.107-18.316-18.498  c-2.633-2.112-6.502-1.818-8.787,0.711c-6.891,7.632-19.27,10.468-28.836,6.477c-9.951-4.187-16.232-14.274-15.615-25.101  c0.203-3.403-2.285-6.36-5.676-6.755c-8.637-1-17.35-1.029-26.012-0.068c-3.348,0.37-5.834,3.257-5.723,6.617  c0.375,10.721-5.977,20.63-15.832,24.667c-9.451,3.861-21.744,1.046-28.621-6.519c-2.273-2.492-6.074-2.798-8.725-0.731  c-6.928,5.437-13.229,11.662-18.703,18.492c-2.133,2.655-1.818,6.503,0.689,8.784c8.049,7.289,10.644,18.879,6.465,28.849  c-3.99,9.505-13.859,15.628-25.156,15.628c-3.666-0.118-6.275,2.345-6.68,5.679c-1.016,8.683-1.027,17.535-0.049,26.289  c0.365,3.264,4.268,5.688,7.582,5.688c10.07-0.256,19.732,5.974,23.791,15.841c4.039,9.855,1.439,21.341-6.467,28.592  c-2.473,2.273-2.789,6.07-0.701,8.709c5.369,6.843,11.537,13.068,18.287,18.505c2.65,2.134,6.504,1.835,8.801-0.697  c6.918-7.65,19.295-10.481,28.822-6.482c9.98,4.176,16.258,14.262,15.645,25.092c-0.201,3.403,2.293,6.369,5.672,6.755  c4.42,0.517,8.863,0.773,13.32,0.773c4.23,0,8.461-0.231,12.692-0.702c3.352-0.37,5.834-3.26,5.721-6.621  c-0.387-10.716,5.979-20.626,15.822-24.655c9.514-3.886,21.752-1.042,28.633,6.512c2.285,2.487,6.063,2.789,8.725,0.73  c6.916-5.423,13.205-11.645,18.703-18.493c2.135-2.65,1.832-6.503-0.689-8.788c-8.047-7.284-10.656-18.879-6.477-28.839  c3.928-9.377,13.43-15.673,23.65-15.673l1.43,0.038c3.318,0.269,6.367-2.286,6.768-5.671  C231.476,120.379,231.487,111.537,230.505,102.78z M115.616,182.27c-36.813,0-66.654-29.841-66.654-66.653  s29.842-66.653,66.654-66.653s66.654,29.841,66.654,66.653c0,12.495-3.445,24.182-9.428,34.176l-29.186-29.187  c2.113-4.982,3.229-10.383,3.228-15.957c0-10.915-4.251-21.176-11.97-28.893c-7.717-7.717-17.978-11.967-28.891-11.967  c-3.642,0-7.267,0.484-10.774,1.439c-1.536,0.419-2.792,1.685-3.201,3.224c-0.418,1.574,0.053,3.187,1.283,4.418  c0,0,14.409,14.52,19.23,19.34c0.505,0.505,0.504,1.71,0.433,2.144l-0.045,0.317c-0.486,5.3-1.423,11.662-2.196,14.107  c-0.104,0.103-0.202,0.19-0.308,0.296c-0.111,0.111-0.213,0.218-0.32,0.328c-2.477,0.795-8.937,1.743-14.321,2.225l0.001-0.029  l-0.242,0.061c-0.043,0.005-0.123,0.011-0.229,0.011c-0.582,0-1.438-0.163-2.216-0.94c-5.018-5.018-18.862-18.763-18.862-18.763  c-1.242-1.238-2.516-1.498-3.365-1.498c-1.979,0-3.751,1.43-4.309,3.481c-3.811,14.103,0.229,29.273,10.546,39.591  c7.719,7.718,17.981,11.968,28.896,11.968c5.574,0,10.975-1.115,15.956-3.228l29.503,29.503  C141.125,178.412,128.825,182.27,115.616,182.27z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="floors_serviced"
                    value={config.floors_serviced}
                    onChange={(e) => handleInputChange(e, index)}
                    className={`"rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" ${
                      config.floors_serviced
                        ? "border-gray-300"
                        : "border-red-500"
                    } rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white`}
                  />
                </div>
                <p className="text-red-500 text-xs italic">
                  Please provide a list of floors to be serviced.
                </p>
              </label>
              <button
                type="button"
                onClick={() => handleRemoveElevator(index)}
                className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2"
              >
                Remove Elevator
              </button>
            </div>
          ))}

          <div>
            <div>
              <hr className="my-4 border-gray-400" />
              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default ElevatorConfiguration;
