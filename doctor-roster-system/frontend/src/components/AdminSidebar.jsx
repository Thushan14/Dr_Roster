import { useState } from "react";
import "./AdminSidebar.css";

import menuIcon from "../assets/menu.png";
import homeIcon from "../assets/home.png";
import layersIcon from "../assets/layers.png";
import infoIcon from "../assets/info.png";

function AdminSidebar({
  activePage,
  onHome,
  onManageDoctors,
  onRoster,
  onProfile,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);

  const closeMenu = () => {
    setMenuClosing(true);
    window.setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
    }, 220);
  };

  const goTo = (callback) => {
    closeMenu();
    window.setTimeout(() => callback?.(), 220);
  };

  return (
    <>
      {menuOpen && (
        <div
          className="sharedAdminOverlay"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sharedAdminSidebar ${
          menuOpen ? "sharedAdminSidebarBlurred" : ""
        }`}
      >
        <button
          type="button"
          className="sharedAdminMenuButton"
          onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
          aria-label="Open menu"
        >
          <img src={menuIcon} alt="" />
        </button>

        <button
          type="button"
          className={`sharedAdminIconButton ${
            activePage === "home" ? "active" : ""
          }`}
          onClick={() => setMenuOpen(true)}
          aria-label="Home"
        >
          <img src={homeIcon} alt="" />
        </button>

        <button
          type="button"
          className={`sharedAdminIconButton ${
            activePage === "manageDoctors" ? "active" : ""
          }`}
          onClick={() => setMenuOpen(true)}
          aria-label="Manage doctors"
        >
          <span className="sharedDoctorsIcon">☷</span>
        </button>

        <button
          type="button"
          className={`sharedAdminIconButton ${
            activePage === "roster" ? "active" : ""
          }`}
          onClick={() => setMenuOpen(true)}
          aria-label="Roster"
        >
          <img src={layersIcon} alt="" />
        </button>

        <button
          type="button"
          className={`sharedAdminIconButton ${
            activePage === "profile" ? "active" : ""
          }`}
          onClick={() => setMenuOpen(true)}
          aria-label="Profile"
        >
          <img src={infoIcon} alt="" />
        </button>
      </aside>

      {menuOpen && (
        <div
          className={`sharedAdminPopup ${menuClosing ? "closing" : ""}`}
        >
          <button
            type="button"
            className={`sharedAdminPopupItem ${
              activePage === "home" ? "active" : ""
            }`}
            onClick={() => goTo(onHome)}
          >
            <img src={homeIcon} alt="" />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={`sharedAdminPopupItem ${
              activePage === "manageDoctors" ? "active" : ""
            }`}
            onClick={() => goTo(onManageDoctors)}
          >
            <span className="sharedPopupDoctorsIcon">☷</span>
            <span>Manage Doctors</span>
          </button>

          <button
            type="button"
            className={`sharedAdminPopupItem ${
              activePage === "roster" ? "active" : ""
            }`}
            onClick={() => goTo(onRoster)}
          >
            <img src={layersIcon} alt="" />
            <span>Roster</span>
          </button>

          <button
            type="button"
            className={`sharedAdminPopupItem ${
              activePage === "profile" ? "active" : ""
            }`}
            onClick={() => goTo(onProfile)}
          >
            <img src={infoIcon} alt="" />
            <span>Profile</span>
          </button>

          <button
            type="button"
            className="sharedAdminLogout"
            onClick={() => goTo(onLogout)}
          >
            Log out
          </button>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;