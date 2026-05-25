import { useState } from "react";
import "./AvailabilityTable.css";
import { submitAvailability } from "../services/availabilityService";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
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

function AvailabilityTable({ user, onLogout, onRoster }) {
  const [data, setData] = useState({});
  const [success, setSuccess] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

  const handleSubmit = async () => {
    const availabilityList = [];

    days.forEach((day) => {
      shifts.forEach((shift) => {
        const slot = data[day]?.[shift];

        if (slot?.available) {
          availabilityList.push({
            doctorName: user.name,
            doctorEmail: user.email,
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
  };

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <h1>Doctor Roster System</h1>
          <p>Manage your weekly availability</p>
        </div>

        <div className="profileWrapper">
          <button
            type="button"
            className="profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profileIcon">👤</div>
            <div>
              <strong>{user.name}</strong>
              <p>{user.email}</p>
            </div>
          </button>

          <button type="button" className="resetBtn" onClick={onRoster}>
            Admin Roster
          </button>

          {showProfileMenu && (
            <div className="profileMenu">
              <button type="button">Settings</button>
              <button type="button" onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="glassCard">
        <div className="cardHeader">
          <div>
            <h2>
              Weekly <span>Availability</span>
            </h2>
            <p>Select your available shifts and preferred locations</p>
          </div>

          <button type="button" className="resetBtn" onClick={resetForm}>
            Reset Form
          </button>
        </div>

        <div className="availabilityGrid header">
          <div>Day</div>
          {shifts.map((shift) => (
            <div key={shift}>{shift}</div>
          ))}
        </div>

        {days.map((day) => (
          <div className="availabilityGrid row" key={day}>
            <div className="dayCell">📅 {day}</div>

            {shifts.map((shift) => {
              const checked = data[day]?.[shift]?.available || false;

              return (
                <div className="shiftCell" key={shift}>
                  <label className="checkLabel">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        handleChange(day, shift, "available", e.target.checked)
                      }
                    />
                    Available
                  </label>

                  {checked && (
                    <select
                      value={data[day]?.[shift]?.preference || ""}
                      onChange={(e) =>
                        handleChange(day, shift, "preference", e.target.value)
                      }
                    >
                      <option value="">Select Preference</option>
                      {options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        <div className="bottomArea">
          <button type="button" className="submitBtn" onClick={handleSubmit}>
            Submit Availability
          </button>
        </div>

        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
}

export default AvailabilityTable;