import { useState } from "react";
import Login from "./pages/Login";
import AvailabilityTable from "./components/AvailabilityTable";
import Roster from "./pages/Roster";
import DoctorRosterView from "./pages/DoctorRosterView";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ChangePassword from "./pages/ChangePassword";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState("availability");
  const [currentUser, setCurrentUser] = useState(null);
  const [adminStartTab, setAdminStartTab] = useState("roster");

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    if (user.role === "manager") {
      setAdminStartTab("roster");
      setPage("adminDashboard");
    } else {
      setPage("availability");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setPage("availability");
    setAdminStartTab("roster");
  };

  const openAdminHome = () => {
    setAdminStartTab("roster");
    setPage("adminDashboard");
  };

  const openManageDoctors = () => {
    setAdminStartTab("manageDoctors");
    setPage("adminDashboard");
  };

  const openAdminRoster = () => setPage("doctorRoster");
  const openProfile = () => setPage("profile");

  const goHome = () => {
    currentUser?.role === "manager"
      ? openAdminHome()
      : setPage("availability");
  };

  const goRoster = () => setPage("doctorRoster");

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  if (currentUser?.mustChangePassword) {
    return (
      <ChangePassword
        user={currentUser}
        onLogout={handleLogout}
        onPasswordChanged={(updatedUser) => {
          setCurrentUser(updatedUser);
          if (updatedUser.role === "manager") {
            openAdminHome();
          } else {
            setPage("availability");
          }
        }}
      />
    );
  }

  if (page === "adminDashboard") {
    return (
      <AdminDashboard
        user={currentUser}
        initialTab={adminStartTab}
        onLogout={handleLogout}
        onProfile={openProfile}
        onDoctorRoster={openAdminRoster}
        onManageDoctors={openManageDoctors}
        onHome={openAdminHome}
      />
    );
  }

  if (page === "profile") {
    return (
      <Profile
        user={currentUser}
        onBack={goHome}
        onLogout={handleLogout}
        onSaveUser={setCurrentUser}
        onDoctorRoster={goRoster}
        onAdminHome={openAdminHome}
        onManageDoctors={openManageDoctors}
        onAdminRoster={openAdminRoster}
        onProfile={openProfile}
      />
    );
  }

  if (page === "doctorRoster") {
    return (
      <DoctorRosterView
        user={currentUser}
        onBack={() =>
          currentUser?.role === "manager"
            ? openAdminHome()
            : setPage("availability")
        }
        onProfile={openProfile}
        onAdminHome={openAdminHome}
        onManageDoctors={openManageDoctors}
        onAdminRoster={openAdminRoster}
        onLogout={handleLogout}
      />
    );
  }

  if (page === "roster") {
    return <Roster onBack={() => setPage("availability")} />;
  }

  return (
    <AvailabilityTable
      user={currentUser}
      onLogout={handleLogout}
      onRoster={() => setPage("roster")}
      onDoctorRoster={() => setPage("doctorRoster")}
      onProfile={openProfile}
    />
  );
}

export default App;