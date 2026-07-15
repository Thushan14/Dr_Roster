import { useEffect, useState } from "react";
import "./AvailabilityTable.css";
import {
  submitAvailability,
  getAvailability,
} from "../services/availabilityService";

import menuIcon from "../assets/menu.png";
import homeIcon from "../assets/home.png";
import layersIcon from "../assets/layers.png";
import infoIcon from "../assets/info.png";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const shifts = ["Morning", "Evening", "Night"];

const options = [
  "ETU-Uyanwaththa",
  "ETU-Galle Road",
  "Ward1-UW",
  "Ward2-UW",
  "Ward-GR",
  "OPD-UW",
  "WC-GR",
  "No Preference",
];

const formatDate = (date) => {
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
};

const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);

  d.setDate(diff);
  d.setHours(0, 0, 0, 0);

  return d;
};

const getWeekOptions = () => {
  const currentMonday = getMonday(new Date());

  const nextMonday = new Date(currentMonday);
  nextMonday.setDate(currentMonday.getDate() + 7);

  return [
    {
      value: currentMonday.toISOString().split("T")[0],
      label: `This Week (${formatDate(currentMonday)} - ${formatDate(
        new Date(currentMonday.getTime() + 6 * 86400000)
      )})`,
    },
    {
      value: nextMonday.toISOString().split("T")[0],
      label: `Next Week (${formatDate(nextMonday)} - ${formatDate(
        new Date(nextMonday.getTime() + 6 * 86400000)
      )})`,
    },
  ];
};

function AvailabilityTable({
  user,
  onLogout,
  onRoster,
  onDoctorRoster,
  onProfile,
}) {
  const [data, setData] = useState({});
  const [success, setSuccess] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarClosing, setSidebarClosing] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [weekOptions] = useState(() => getWeekOptions());
  const [weekStartDate, setWeekStartDate] = useState(weekOptions[0].value);

  useEffect(() => {
    const loadSubmittedAvailability = async () => {
      try {
        const records = await getAvailability();

        const myRecords = records.filter(
          (record) =>
            record.doctorEmail === user.email &&
            record.weekStartDate === weekStartDate
        );

        const loadedData = {};

        myRecords.forEach((record) => {
          loadedData[record.day] = {
            ...loadedData[record.day],
            [record.shift]: {
              available: true,
              preference: record.preference,
            },
          };
        });

        setData(loadedData);
      } catch (error) {
        console.error(error);
      }
    };

    if (user?.email && weekStartDate) {
      loadSubmittedAvailability();
    }
  }, [user, weekStartDate]);

  const handleChange = (day, shift, field, value) => {
    setData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [shift]: {
          ...prev[day]?.[shift],
          [field]: value,
        },
      },
    }));
  };

  const closeSidebar = () => {
    setSidebarClosing(true);

    setTimeout(() => {
      setSidebarOpen(false);
      setSidebarClosing(false);
    }, 250);
  };

  const goToPage = (callback) => {
    closeSidebar();
    setShowProfileMenu(false);
    setPageLoading(true);

    setTimeout(() => {
      callback();
    }, 550);
  };

  const handleSubmit = async () => {
    if (!weekStartDate) {
      setSuccess("Please select availability week.");
      return;
    }

    const availabilityList = [];

    days.forEach((day) => {
      shifts.forEach((shift) => {
        const slot = data[day]?.[shift];

        if (slot?.available) {
          availabilityList.push({
            doctorName: user.name,
            doctorEmail: user.email,
            weekStartDate,
            day,
            shift,
            available: true,
            preference: slot.preference || "No Preference",
          });
        }
      });
    });

    if (availabilityList.length === 0) {
      setSuccess("Please select at least one availability.");
      return;
    }

    try {
      await submitAvailability(availabilityList);
      setSuccess("Availability submitted successfully!");
    } catch (error) {
      console.error(error);
      setSuccess("Failed to submit availability.");
    }
  };

  const resetForm = () => {
    setData({});
    setSuccess("");
    setWeekStartDate(weekOptions[0].value);
  };

  return (
    <div className="page">
      <div className="mainPanel">
        {pageLoading && <div className="pageTransition"></div>}

        {sidebarOpen && (
          <button
            type="button"
            className="menuOverlay"
            onClick={closeSidebar}
          ></button>
        )}

        <aside className={`sideBar ${sidebarOpen ? "blurIcons" : ""}`}>
          <button
            type="button"
            className="menuBtn"
            onClick={() =>
              sidebarOpen ? closeSidebar() : setSidebarOpen(true)
            }
          >
            <img src={menuIcon} alt="Menu" />
          </button>

          <button
            type="button"
            className="sideIconBtn"
            onClick={() => setSidebarOpen(true)}
          >
            <img src={homeIcon} alt="Home" />
          </button>

          <button
            type="button"
            className="sideIconBtn"
            onClick={() => setSidebarOpen(true)}
          >
            <img src={layersIcon} alt="Roster" />
          </button>

          <button
            type="button"
            className="sideIconBtn"
            onClick={() => setSidebarOpen(true)}
          >
            <img src={infoIcon} alt="Profile" />
          </button>
        </aside>

        {sidebarOpen && (
          <div
            className={sidebarClosing ? "sidePopupMenu closing" : "sidePopupMenu"}
          >
            <button
              type="button"
              className="popupItem active"
              onClick={closeSidebar}
            >
              <img src={homeIcon} alt="Home" />
              <span>Home</span>
            </button>

            <button
              type="button"
              className="popupItem"
              onClick={() => goToPage(onDoctorRoster)}
            >
              <img src={layersIcon} alt="Roster" />
              <span>Roster</span>
            </button>

            <button
              type="button"
              className="popupItem"
              onClick={() => goToPage(onProfile)}
            >
              <img src={infoIcon} alt="Profile" />
              <span>Profile</span>
            </button>

            <button type="button" className="popupLogout" onClick={onLogout}>
              Log out
            </button>
          </div>
        )}

        <main className="contentArea">
          <div className="topbar">
            <div>
              <h1>Dashboard</h1>
              <p>{user?.name}</p>
            </div>

            <div className="profileWrapper">
              {user?.role === "manager" && (
                <button type="button" className="smallBtn" onClick={onRoster}>
                  Admin Roster
                </button>
              )}

              <button
                type="button"
                className="profileAvatarBtn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="topProfileImg"
                  />
                ) : (
                  <div className="defaultAvatar">👤</div>
                )}
              </button>

              {showProfileMenu && (
                <div className="profileMenu">
                  <button type="button" onClick={() => goToPage(onProfile)}>
                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="cardHeader">
            <div className="weekSelector">
              <label>Availability Week</label>

              <select
                value={weekStartDate}
                onChange={(e) => {
                  setWeekStartDate(e.target.value);
                  setSuccess("");
                }}
              >
                {weekOptions.map((week) => (
                  <option key={week.value} value={week.value}>
                    {week.label}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" className="smallBtn" onClick={resetForm}>
              Reset
            </button>
          </div>

          <div className="availabilityBox">
            <div className="availabilityTableWrapper">
              <div className="availabilityGrid header">
                <div>Days</div>
                {shifts.map((shift) => (
                  <div key={shift}>{shift}</div>
                ))}
              </div>

              {days.map((day) => (
                <div className="availabilityGrid row" key={day}>
                  <div className="dayCell">{day.substring(0, 3)}</div>

                  {shifts.map((shift) => {
                    const checked = data[day]?.[shift]?.available || false;

                    return (
                      <div className="shiftCell" key={shift}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            handleChange(
                              day,
                              shift,
                              "available",
                              e.target.checked
                            )
                          }
                        />

                        {checked ? (
                          <select
                            value={data[day]?.[shift]?.preference || ""}
                            onChange={(e) =>
                              handleChange(
                                day,
                                shift,
                                "preference",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select...</option>

                            {options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select disabled>
                            <option>Select...</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <button type="button" className="submitBtn" onClick={handleSubmit}>
            Submit Availability
          </button>

          {success && <p className="success">{success}</p>}
        </main>
      </div>
    </div>
  );
}

export default AvailabilityTable;