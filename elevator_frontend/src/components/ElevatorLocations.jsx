import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

const DirectionMark = ({ direction }) => {
  if (direction === "up") {
    return <FontAwesomeIcon icon={faArrowUp} className="text-amber-300" />;
  }
  if (direction === "down") {
    return <FontAwesomeIcon icon={faArrowDown} className="text-amber-300" />;
  }
  return <span className="text-amber-300/40">–</span>;
};

const ElevatorLocations = ({ elevatorConfig }) => {
  const cars = Array.isArray(elevatorConfig) ? elevatorConfig : [];

  if (cars.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {cars.map((elevator) => (
        <div
          key={elevator.id}
          className="led-window flex items-center justify-between rounded-md px-3 py-2"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-amber-200/70">
              Car {elevator.id}
            </p>
            <p className="text-2xl leading-none">
              {String(elevator.current_floor).padStart(2, "0")}
            </p>
          </div>
          <DirectionMark direction={elevator.direction} />
        </div>
      ))}
    </div>
  );
};

export default ElevatorLocations;
