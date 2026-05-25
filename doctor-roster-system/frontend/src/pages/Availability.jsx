import { useState } from "react";
import "./AvailabilityTable.css";

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

function AvailabilityTable() {
  const [data, setData] = useState({});
  const [success, setSuccess] = useState("");

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

  const handleSubmit = () => {
    console.log(data);
    setSuccess("Availability submitted successfully!");
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

        <div className="profile">
          <div className="profileIcon">👤</div>
          <div>
            <strong>Dr. Sanjaya Perera</strong>
            <p>Consultant Doctor</p>
          </div>
        </div>
      </div>

      <div className="glassCard">
        <div className="cardHeader">
          <div>
            <h2>Weekly <span>Availability</span></h2>
            <p>Select your available shifts and preferred locations</p>
          </div>

          <button className="resetBtn" onClick={resetForm}>Reset Form</button>
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

                  <select
                    disabled={!checked}
                    value={data[day]?.[shift]?.preference || ""}
                    onChange={(e) =>
                      handleChange(day, shift, "preference", e.target.value)
                    }
                  >
                    <option value="">Select Preference</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        ))}

        <div className="bottomArea">
          <div className="infoBox">
            Select “Available” first, then choose your preferred location.
          </div>

          <button className="submitBtn" onClick={handleSubmit}>
            Submit Availability
          </button>
        </div>

        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
}

export default AvailabilityTable;