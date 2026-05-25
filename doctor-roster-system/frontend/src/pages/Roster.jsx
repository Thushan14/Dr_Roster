import { useEffect, useState } from "react";
import { getAvailability, deleteAllAvailability } from "../services/availabilityService";
import "./Roster.css";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const shifts = ["Morning", "Evening", "Night"];

const uwSections = ["ETU-Uyanwaththa", "Ward1-UW", "Ward2-UW", "OPD-UW"];
const grSections = ["ETU-Galle Road", "Ward-GR", "WC-GR"];

function Roster({ onBack }) {
  const [availability, setAvailability] = useState([]);
  const [uwRoster, setUwRoster] = useState([]);
  const [grRoster, setGrRoster] = useState([]);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const data = await getAvailability();
      setAvailability(data);
    } catch (error) {
      console.error("Failed to load availability", error);
    }
  };

  const clearAllData = async () => {
    const confirmDelete = window.confirm("Delete all availability records?");

    if (!confirmDelete) return;

    try {
      await deleteAllAvailability();
      setAvailability([]);
      setUwRoster([]);
      setGrRoster([]);
    } catch (error) {
      console.error("Failed to clear data", error);
    }
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
          const doctorName = doctor.doctorName || doctor.doctorEmail || `Doctor ${doctor.id}`;

          if (uwSections.includes(doctor.preference)) {
            uwRow[doctor.preference] = doctorName;
          } else if (grSections.includes(doctor.preference)) {
            grRow[doctor.preference] = doctorName;
          } else if (doctor.preference === "No Preference") {
            const emptyUw = uwSections.find((section) => uwRow[section] === "-");
            const emptyGr = grSections.find((section) => grRow[section] === "-");

            if (emptyUw) {
              uwRow[emptyUw] = doctorName;
            } else if (emptyGr) {
              grRow[emptyGr] = doctorName;
            }
          }
        });

        uw.push(uwRow);
        gr.push(grRow);
      });
    });

    setUwRoster(uw);
    setGrRoster(gr);
  };

  return (
    <div className="rosterPage">
      <div className="rosterTopbar">
        <div>
          <h1>Admin Roster Page</h1>
          <p>Generate weekly hospital roster from doctor availability</p>
        </div>

        <button className="backBtn" onClick={onBack}>
          Back to Availability
        </button>
      </div>

      <div className="rosterActions">
        <button onClick={loadAvailability}>Refresh Data</button>
        <button onClick={generateRoster}>Generate Roster</button>
        <button onClick={clearAllData}>Clear All Data</button>
      </div>

      <div className="summaryBox">
        Saved availability records: <strong>{availability.length}</strong>
      </div>

      <RosterTable title="Uyanwaththa Roster" sections={uwSections} data={uwRoster} />

      <RosterTable title="Galle Road Roster" sections={grSections} data={grRoster} />
    </div>
  );
}

function RosterTable({ title, sections, data }) {
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
              <td colSpan={sections.length + 2}>
                Click Generate Roster to create roster
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index}>
                <td>{row.day}</td>
                <td>{row.shift}</td>
                {sections.map((section) => (
                  <td key={section}>{row[section]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Roster;