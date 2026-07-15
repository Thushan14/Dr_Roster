import { useEffect, useState } from "react";
import "../components/AvailabilityTable.css";
import "./DoctorRosterView.css";
import AdminSidebar from "../components/AdminSidebar";

function DoctorRosterView({
  user,
  onBack,
  onProfile,
  onAdminHome,
  onManageDoctors,
  onAdminRoster,
  onLogout,
}) {
  const [savedRosters, setSavedRosters] = useState([]);
  const [selectedRoster, setSelectedRoster] = useState(null);
  const [activeRosterType, setActiveRosterType] = useState("uw");
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("publishedRosters")) || [];
    setSavedRosters(data);
    if (data.length > 0) setSelectedRoster(data[data.length - 1]);
  }, []);

  const goToPage = (callback) => {
    setPageLoading(true);
    window.setTimeout(() => callback?.(), 450);
  };

  const uwRoster = selectedRoster?.uwRoster || [];
  const grRoster = selectedRoster?.grRoster || [];
  const isManager = user?.role === "manager";

  return (
    <div className="page">
      <div className="doctorRosterPanel">
        {pageLoading && <div className="pageTransition" />}

        {isManager && (
          <AdminSidebar
            activePage="roster"
            onHome={() => goToPage(onAdminHome || onBack)}
            onManageDoctors={() => goToPage(onManageDoctors)}
            onRoster={() => onAdminRoster?.()}
            onProfile={() => goToPage(onProfile)}
            onLogout={onLogout}
          />
        )}

        <div className="doctorRosterContent">
          <div className="doctorRosterTop">
            <div>
              <h1>Roster</h1>
              <p>Published roster view only</p>
            </div>

            <button type="button" onClick={() => goToPage(onBack)}>
              Back
            </button>
          </div>

          <div className="rosterSelectBox">
            <label>Select Published Roster</label>
            <select
              value={selectedRoster?.id || ""}
              onChange={(event) => {
                const roster = savedRosters.find(
                  (item) => item.id === Number(event.target.value)
                );
                setSelectedRoster(roster || null);
              }}
            >
              {savedRosters.map((rosterItem) => (
                <option key={rosterItem.id} value={rosterItem.id}>
                  {rosterItem.title} - {rosterItem.weekStartDate}
                </option>
              ))}
            </select>
          </div>

          {!selectedRoster ? (
            <p>No published roster available.</p>
          ) : (
            <div className="rosterTableArea">
              <div className="rosterToggle">
                <button
                  type="button"
                  className={activeRosterType === "gr" ? "active" : ""}
                  onClick={() => setActiveRosterType("gr")}
                >
                  GR
                </button>
                <button
                  type="button"
                  className={activeRosterType === "uw" ? "active" : ""}
                  onClick={() => setActiveRosterType("uw")}
                >
                  UW
                </button>
              </div>

              <div className="rosterScrollBox">
                {activeRosterType === "uw" ? (
                  <ReadOnlyRosterTable
                    title="Uyanwaththa Roster"
                    data={uwRoster}
                    sections={[
                      "ETU-Uyanwaththa",
                      "Ward1-UW",
                      "Ward2-UW",
                      "OPD-UW",
                    ]}
                  />
                ) : (
                  <ReadOnlyRosterTable
                    title="Galle Road Roster"
                    data={grRoster}
                    sections={["ETU-Galle Road", "Ward-GR", "WC-GR"]}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReadOnlyRosterTable({ title, data, sections }) {
  return (
    <div className="doctorRosterCard">
      <h2>{title}</h2>
      <div className="tableWrapper">
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
            {data.map((row, index) => (
              <tr key={`${row.day}-${row.shift}-${index}`}>
                {index % 3 === 0 && (
                  <td rowSpan="3" className="mergedDayCell">
                    {row.day}
                  </td>
                )}
                <td>{row.shift}</td>
                {sections.map((section) => (
                  <td key={section}>
                    {Array.isArray(row[section])
                      ? row[section].join(", ")
                      : row[section] || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DoctorRosterView;