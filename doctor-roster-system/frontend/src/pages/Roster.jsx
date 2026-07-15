import { useEffect, useState } from "react";
import {
  getAvailability,
  deleteAllAvailability,
  saveRoster,
  getSavedRosters,
  deleteSavedRoster,
} from "../services/availabilityService";
import "./Roster.css";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const shifts = ["Morning", "Evening", "Night"];

const uwSections = ["ETU-Uyanwaththa", "Ward1-UW", "Ward2-UW", "OPD-UW"];
const grSections = ["ETU-Galle Road", "Ward-GR", "WC-GR"];

function Roster({ onLogout }) {
  const [availability, setAvailability] = useState([]);
  const [uwRoster, setUwRoster] = useState([]);
  const [grRoster, setGrRoster] = useState([]);
  const [rosterTitle, setRosterTitle] = useState("");
  const [rosterWeekDate, setRosterWeekDate] = useState("");
  const [savedRosters, setSavedRosters] = useState([]);

  useEffect(() => {
    loadAvailability();
    loadSavedRosters();
  }, []);

  const loadAvailability = async () => {
    const data = await getAvailability();
    setAvailability(data);
  };

  const loadSavedRosters = async () => {
    const data = await getSavedRosters();
    setSavedRosters(data);
  };

  const clearAllData = async () => {
    if (!window.confirm("Delete all availability records?")) return;

    await deleteAllAvailability();
    setAvailability([]);
    setUwRoster([]);
    setGrRoster([]);
  };

  const generateRoster = () => {
    const uw = [];
    const gr = [];

    days.forEach((day) => {
      shifts.forEach((shift) => {
        const availableDoctors = availability.filter(
          (slot) => slot.day === day && slot.shift === shift && slot.available
        );

        const uwRow = {
          day,
          shift,
          "ETU-Uyanwaththa": "-",
          "Ward1-UW": "-",
          "Ward2-UW": "-",
          "OPD-UW": "-",
        };

        const grRow = {
          day,
          shift,
          "ETU-Galle Road": "-",
          "Ward-GR": "-",
          "WC-GR": "-",
        };

        availableDoctors.forEach((doctor) => {
          const doctorName =
            doctor.doctorName || doctor.doctorEmail || `Doctor ${doctor.id}`;

          if (uwSections.includes(doctor.preference)) {
            if (uwRow[doctor.preference] === "-") {
              uwRow[doctor.preference] = doctorName;
            }
          } else if (grSections.includes(doctor.preference)) {
            if (grRow[doctor.preference] === "-") {
              grRow[doctor.preference] = doctorName;
            }
          } else {
            const emptyUw = uwSections.find((section) => uwRow[section] === "-");
            const emptyGr = grSections.find((section) => grRow[section] === "-");

            if (emptyUw) uwRow[emptyUw] = doctorName;
            else if (emptyGr) grRow[emptyGr] = doctorName;
          }
        });

        uw.push(uwRow);
        gr.push(grRow);
      });
    });

    setUwRoster(uw);
    setGrRoster(gr);
  };

  const updateRosterCell = (tableType, rowIndex, section, value) => {
    if (tableType === "uw") {
      const updated = [...uwRoster];
      updated[rowIndex][section] = value;
      setUwRoster(updated);
    } else {
      const updated = [...grRoster];
      updated[rowIndex][section] = value;
      setGrRoster(updated);
    }
  };

  const handleSaveRoster = async () => {
    if (!rosterTitle) {
      alert("Please enter roster title.");
      return;
    }

    if (!rosterWeekDate) {
      alert("Please select roster week date.");
      return;
    }

    await saveRoster({
      title: rosterTitle,
      weekStartDate: rosterWeekDate,
      uwRosterJson: JSON.stringify(uwRoster),
      grRosterJson: JSON.stringify(grRoster),
    });

    alert("Roster saved successfully!");
    setRosterTitle("");
    setRosterWeekDate("");
    loadSavedRosters();
  };

  const handleViewSavedRoster = (roster) => {
  setUwRoster(JSON.parse(roster.uwRosterJson));
  setGrRoster(JSON.parse(roster.grRosterJson));
  setRosterTitle(roster.title);
  setRosterWeekDate(roster.weekStartDate);
};

  const handleDeleteSavedRoster = async (id) => {
    if (!window.confirm("Delete this saved roster?")) return;

    await deleteSavedRoster(id);
    loadSavedRosters();
  };

  return (
    <div className="rosterPage">
      <div className="rosterTopbar">
        <div>
          <h1>Admin Roster Page</h1>
          <p>View doctor availability and manually save final rosters</p>
        </div>

        <button type="button" className="backBtn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="rosterActions">
        <button type="button" onClick={loadAvailability}>Refresh Availability</button>
        <button type="button" onClick={generateRoster}>Generate Roster</button>
        <button type="button" onClick={clearAllData}>Clear Availability Data</button>
      </div>

      <div className="summaryBox">
        Saved availability records: <strong>{availability.length}</strong>
      </div>

      <AvailabilitySummary data={availability} />

      <div className="rosterCard">
        <h2>Save Final Roster</h2>

        <input
          className="rosterTitleInput"
          type="text"
          placeholder="Enter roster title"
          value={rosterTitle}
          onChange={(e) => setRosterTitle(e.target.value)}
        />

        <input
          className="rosterTitleInput"
          type="date"
          value={rosterWeekDate}
          onChange={(e) => setRosterWeekDate(e.target.value)}
        />

        <button type="button" className="summaryBtn" onClick={handleSaveRoster}>
          Save Roster
        </button>
      </div>

      <div className="rosterCard">
        <h2>Saved Rosters</h2>

        {savedRosters.length === 0 ? (
          <p>No saved rosters yet.</p>
        ) : (
          savedRosters.map((roster) => (
            <div className="savedRosterItem" key={roster.id}>
              <div>
                <strong>{roster.title}</strong>
                <p>Week: {roster.weekStartDate}</p>
              </div>

              <div>
                <button type="button" onClick={() => handleViewSavedRoster(roster)}>
                  View
                </button>

                <button type="button" onClick={() => handleDeleteSavedRoster(roster.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <RosterTable
        title="Uyanwaththa Roster"
        sections={uwSections}
        data={uwRoster}
        tableType="uw"
        updateRosterCell={updateRosterCell}
      />

      <RosterTable
        title="Galle Road Roster"
        sections={grSections}
        data={grRoster}
        tableType="gr"
        updateRosterCell={updateRosterCell}
      />
    </div>
  );
}

function AvailabilitySummary({ data }) {
  const [showSummary, setShowSummary] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const groupedDoctors = data.reduce((groups, item) => {
    const key = item.doctorEmail || item.doctorName || `doctor-${item.id}`;

    if (!groups[key]) {
      groups[key] = {
        doctorName: item.doctorName || "-",
        doctorEmail: item.doctorEmail || "-",
        slots: [],
      };
    }

    groups[key].slots.push({
      day: item.day,
      shift: item.shift,
      preference: item.preference,
    });

    return groups;
  }, {});

  const doctors = Object.values(groupedDoctors);

  return (
    <div className="rosterCard">
      <div className="summaryHeader">
        <h2>Doctor Availability Summary</h2>

        <button
          type="button"
          className="summaryBtn"
          onClick={() => setShowSummary(!showSummary)}
        >
          {showSummary ? "Hide Summary" : "Show Availability Summary"}
        </button>
      </div>

      {showSummary && (
        <table>
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            {doctors.map((doctor, index) => (
              <tr
                key={index}
                className="doctorRow"
                onClick={() =>
                  setSelectedDoctor(
                    selectedDoctor === doctor.doctorEmail ? null : doctor.doctorEmail
                  )
                }
              >
                <td>{doctor.doctorName}</td>
                <td>{doctor.doctorEmail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showSummary && selectedDoctor && (
        <div className="doctorDetails">
          <h3>
            Availability for{" "}
            {doctors.find((d) => d.doctorEmail === selectedDoctor)?.doctorName}
          </h3>

          <div className="availabilityList">
            {doctors
              .find((d) => d.doctorEmail === selectedDoctor)
              ?.slots.map((slot, index) => (
                <span className="availabilityTag" key={index}>
                  {slot.day} - {slot.shift} - {slot.preference}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RosterTable({ title, sections, data, tableType, updateRosterCell }) {
  return (
    <div className="rosterCard">
      <h2>{title}</h2>

      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Shift</th>
            {sections.map((section) => (
              <th key={section}>{section}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={sections.length + 2}>Click Generate Roster to create roster</td>
            </tr>
          ) : (
            data.map((row, index) => {
              const isFirstShiftOfDay = index % 3 === 0;

              return (
                <tr key={index}>
                  {isFirstShiftOfDay && (
                    <td rowSpan="3" className="mergedDayCell">
                      {row.day}
                    </td>
                  )}

                  <td>{row.shift}</td>

                  {sections.map((section) => (
                    <td key={section}>
                      <input
                        className="rosterCellInput"
                        value={row[section]}
                        onChange={(e) =>
                          updateRosterCell(tableType, index, section, e.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Roster;