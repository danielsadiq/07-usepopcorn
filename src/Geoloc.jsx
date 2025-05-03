/* eslint-disable react/react-in-jsx-scope */
import { useState } from "react";

function useGeolocation(dataFunc = null) {
  const [isLoading, setIsLoading] = useState(false);
  // 
  const [position, setPosition] = useState({});
  const [error, setError] = useState(null);

  const { lat, lng } = position;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function getPosition() {
    dataFunc?.();
    if (!navigator.geolocation)
      return setError("Your browser does not support geolocation");

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsLoading(false);
      },
      (error) => {
        setError(error.message);
        setIsLoading(false);
      }
    );
    return {getPosition, lat, lng, isLoading, error}
  }
}

export default function Geoloc() {
  const [countClicks, setCountClicks] = useState(0);
  const {getPosition, lat, lng, isLoading, error} = useGeolocation(addClick);
  
  function addClick(){
    setCountClicks((count) => count + 1);
  }

  return (
    <div>
      <button onClick={getPosition} disabled={isLoading}>
        Get my position
      </button>

      {isLoading && <p>Loading position...</p>}
      {error && <p>{error}</p>}
      {!isLoading && !error && lat && lng && (
        <p>
          Your GPS position:{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://www.openstreetmap.org/#map=16/${lat}/${lng}`}
          >
            {lat}, {lng}
          </a>
        </p>
      )}

      <p>You requested position {countClicks} times</p>
    </div>
  );
}
