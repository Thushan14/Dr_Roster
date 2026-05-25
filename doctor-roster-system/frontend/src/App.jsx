import { useState } from "react";
import Login from "./pages/Login";
import AvailabilityTable from "./components/AvailabilityTable";
import Roster from "./pages/Roster";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState("availability");
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setPage("availability");
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (page === "roster") {
    return <Roster onBack={() => setPage("availability")} />;
  }

  return (
    <AvailabilityTable
      user={currentUser}
      onLogout={handleLogout}
      onRoster={() => setPage("roster")}
    />
  );
}

export default App;