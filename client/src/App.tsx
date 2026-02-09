import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("Error connecting to server"));
  }, []);

  return (
    <div>
      <h1>Helpdesk</h1>
      <p>Server status: {status}</p>
    </div>
  );
}

export default App;
