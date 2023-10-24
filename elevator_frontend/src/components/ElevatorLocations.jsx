import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

const ElevatorLocations = ({ elevatorConfig }) => {
  const getArrowIcon = (direction) => {
    if (direction === "up") {
      return <FontAwesomeIcon icon={faArrowUp} size="3x" />;
    } else if (direction === "down") {
      return <FontAwesomeIcon icon={faArrowDown} size="3x" />;
    } else {
      return <span>-</span>;
    }
  };

  return (
    <div className="flex items-center justify-center space-x-10 mb-5">
      <div className="bg-gray-100 bg-opacity-80 p-4 rounded-lg border-2 border-black text-center">
        <p className="text-lg">Elevator Location:</p>
        <ul>
          {Array.isArray(elevatorConfig) &&
            elevatorConfig.map((elevator) => (
              <li key={elevator.id} className="italic my-2">
                Current Floor: <strong>{elevator.current_floor}</strong>
              </li>
            ))}
        </ul>
      </div>
      <div className="bg-gray-100 bg-opacity-80 p-4 rounded-lg border-2 border-black w-80 text-center">
        <p className="text-lg">Direction:</p>
        <ul>
          {Array.isArray(elevatorConfig) &&
            elevatorConfig.map((elevator) => (
              <li key={elevator.id} className="my-2">
                {getArrowIcon(elevator.direction)}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default ElevatorLocations;
