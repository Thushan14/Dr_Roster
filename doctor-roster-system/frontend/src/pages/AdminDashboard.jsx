import { useEffect, useState } from "react";
import "./AdminDashboard.css";
import AdminSidebar from "../components/AdminSidebar";
import { getAvailability } from "../services/availabilityService";
import { createDoctor, getDoctors, deleteDoctor } from "../services/doctorService";


const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const shifts = ["Morning", "Evening", "Night"];

const uwSections = ["ETU-Uyanwaththa", "Ward1-UW", "Ward2-UW", "OPD-UW"];
const grSections = ["ETU-Galle Road", "Ward-GR", "WC-GR"];

function AdminDashboard({
  user,
  initialTab = "roster",
  onLogout,
  onProfile,
  onDoctorRoster,
  onManageDoctors,
  onHome,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeSite, setActiveSite] = useState("UW");
  const [availabilityRecords, setAvailabilityRecords] = useState([]);
  const [uwRoster, setUwRoster] = useState([]);
  const [grRoster, setGrRoster] = useState([]);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [toast, setToast] = useState("");
  const [expandedDoctor, setExpandedDoctor] = useState(null);
  const [openedSavedRoster, setOpenedSavedRoster] = useState(null);
  const [selectedDoctors, setSelectedDoctors] = useState({});
  const [openDoctorDropdown, setOpenDoctorDropdown] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorPassword, setDoctorPassword] = useState("");
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [isDeletingDoctor, setIsDeletingDoctor] = useState(false);

  const showMessage = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  };

  const loadDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showMessage(error.message || "Failed to load doctors");
    }
  };

  const handleCreateDoctor = async (e) => {
  e.preventDefault();

  const cleanName = doctorName.trim();
  const cleanEmail = doctorEmail.trim().toLowerCase();

  if (!cleanName || !cleanEmail || !doctorPassword) {
    showMessage("Please complete all doctor details");
    return;
  }

  if (doctorPassword.length < 8) {
    showMessage("Temporary password must have at least 8 characters");
    return;
  }

  try {
    await createDoctor(cleanName, cleanEmail, doctorPassword);

    setDoctorName("");
    setDoctorEmail("");
    setDoctorPassword("");

    await loadDoctors();
    showMessage("Doctor account created successfully");
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Failed to create doctor");
  }
};

const handleDeleteDoctor = (doctor) => {
  setDoctorToDelete(doctor);
};

const confirmDeleteDoctor = async () => {
  if (!doctorToDelete || isDeletingDoctor) return;

  try {
    setIsDeletingDoctor(true);
    await deleteDoctor(doctorToDelete.id);
    await loadDoctors();
    showMessage(`${doctorToDelete.name} deleted successfully`);
    setDoctorToDelete(null);
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Failed to delete doctor");
  } finally {
    setIsDeletingDoctor(false);
  }
};

  const [savedRosters, setSavedRosters] = useState(
    JSON.parse(localStorage.getItem("privateSavedRosters")) || []
  );

  const sections = activeSite === "UW" ? uwSections : grSections;
  const totalDoctors = Math.max(doctors.length, 1);

  const submittedDoctors = new Set(
    availabilityRecords.map((r) => r.doctorEmail)
  ).size;

  const submissionPercentage = Math.round(
    (submittedDoctors / totalDoctors) * 100
  );

  const dayCounts = {};
  days.forEach((day) => {
    dayCounts[day] = 0;
  });

  availabilityRecords.forEach((record) => {
    if (dayCounts[record.day] !== undefined) {
      dayCounts[record.day]++;
    }
  });

  const saveSavedRosterChanges = () => {
  if (!openedSavedRoster) return;

  const savedRosters =
    JSON.parse(localStorage.getItem("privateSavedRosters")) || [];

  const updatedRosters = savedRosters.map((roster) =>
    roster.id === openedSavedRoster.id
      ? {
          ...openedSavedRoster,
          lastModified: new Date().toLocaleString(),
        }
      : roster
  );

  localStorage.setItem(
    "privateSavedRosters",
    JSON.stringify(updatedRosters)
  );
  setSavedRosters(updatedRosters);

  showMessage("Roster changes saved successfully");
};

  const staffingRisk = [];

  days.forEach((day) => {
    shifts.forEach((shift) => {
      const count = availabilityRecords.filter(
        (r) => r.day === day && r.shift === shift
      ).length;

      if (count < 2) {
        staffingRisk.push({ level: "High", day, shift, count });
      } else if (count === 2) {
        staffingRisk.push({ level: "Medium", day, shift, count });
      }
    });
  });

  const submittedEmails = new Set(
    availabilityRecords.map((record) => record.doctorEmail)
  );

  const pendingDoctors = doctors.filter(
    (doctor) => !submittedEmails.has(doctor.email)
  );

  const maxDayCount = Math.max(...Object.values(dayCounts), 1);


  const createEmptyRoster = () =>
    days.flatMap((day) =>
      shifts.map((shift) => {
        const row = { day, shift };
        sections.forEach((section) => {
          row[section] = [];
        });
        return row;
      })
    );

    const getCurrentWeekStart = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  return monday.toISOString().split("T")[0];
};

const currentWeekStart = getCurrentWeekStart();

const filterCurrentWeekRecords = (records) => {
  return records.filter(
    (record) => record.weekStartDate === currentWeekStart
  );
};
    

 const refreshRecords = async () => {
  try {
    const data = await getAvailability();
    const currentWeekData = filterCurrentWeekRecords(data);

    setAvailabilityRecords(currentWeekData);
    showMessage("Current week availability refreshed");
  } catch (error) {
    console.error(error);
    showMessage("Failed to refresh availability records");
  }
};

const loadCurrentWeekRoster = async () => {
  try {
    const data = await getAvailability();
    const currentWeekData = filterCurrentWeekRecords(data);

    setAvailabilityRecords(currentWeekData);

    const generateForSite = (siteSections) => {
      return days.flatMap((day) =>
        shifts.map((shift) => {
          const row = { day, shift };

          siteSections.forEach((section) => {
            row[section] = [];
          });

          currentWeekData.forEach((record) => {
            if (
              record.day === day &&
              record.shift === shift &&
              siteSections.includes(record.preference)
            ) {
              if (!row[record.preference].includes(record.doctorName)) {
                row[record.preference].push(record.doctorName);
              }
            }
          });

          return row;
        })
      );
    };

    setUwRoster(generateForSite(uwSections));
    setGrRoster(generateForSite(grSections));
  } catch (error) {
    console.error(error);
  }
};

  const generateRoster = async () => {
    let records = availabilityRecords;

    if (records.length === 0) {
      records = await getAvailability();
      setAvailabilityRecords(records);
    }

    const newRoster = createEmptyRoster();

    records.forEach((record) => {
      const targetRow = newRoster.find(
        (row) => row.day === record.day && row.shift === record.shift
      );

      if (!targetRow) return;

      if (sections.includes(record.preference)) {
        if (!Array.isArray(targetRow[record.preference])) {
          targetRow[record.preference] = [];
        }

        if (!targetRow[record.preference].includes(record.doctorName)) {
          targetRow[record.preference].push(record.doctorName);
        }
      }
    });

    if (activeSite === "UW") {
      setUwRoster(newRoster);
    } else {
      setGrRoster(newRoster);
    }

    setSelectedDoctors({});
    setOpenDoctorDropdown(null);
    showMessage(`${activeSite} roster generated successfully`);
  };

  const clearRoster = () => {
    if (activeSite === "UW") {
      setUwRoster(createEmptyRoster());
    } else {
      setGrRoster(createEmptyRoster());
    }

    setSelectedDoctors({});
    setOpenDoctorDropdown(null);
    showMessage(`${activeSite} roster cleared`);
  };

  const confirmSaveRoster = () => {
    if (!saveName.trim()) {
      showMessage("Please enter roster name");
      return;
    }

    const newSavedRoster = {
      id: Date.now(),
      name: saveName,
      date: new Date().toLocaleDateString(),
      uwRoster: JSON.parse(JSON.stringify(uwRoster)),
      grRoster: JSON.parse(JSON.stringify(grRoster)),
    };

    const updated = [...savedRosters, newSavedRoster];

    localStorage.setItem("privateSavedRosters", JSON.stringify(updated));
    setSavedRosters(updated);
    setSaveName("");
    setShowSavePopup(false);
    showMessage("Roster saved successfully");
  };

  const deleteSavedRoster = (id) => {
    const updated = savedRosters.filter((roster) => roster.id !== id);
    localStorage.setItem("privateSavedRosters", JSON.stringify(updated));
    setSavedRosters(updated);
    showMessage("Saved roster deleted");
  };

  const openSavedRoster = (roster) => {
    setOpenedSavedRoster(roster);
    setActiveSite("GR");
    setOpenDoctorDropdown(null);
    showMessage(`${roster.name} opened`);
  };
  const publishSavedRoster = () => {
  if (!openedSavedRoster) return;

  const publishedRosters =
    JSON.parse(localStorage.getItem("publishedRosters")) || [];

  const newPublishedRoster = {
    id: Date.now(),
    title: openedSavedRoster.name,
    weekStartDate: openedSavedRoster.date,
    uwRoster: openedSavedRoster.uwRoster,
    grRoster: openedSavedRoster.grRoster,
    publishedAt: new Date().toLocaleString(),
  };

  localStorage.setItem(
    "publishedRosters",
    JSON.stringify([...publishedRosters, newPublishedRoster])
  );

  showMessage("Saved roster published successfully");
};

  const publishRoster = () => {
  const publishedRosters =
    JSON.parse(localStorage.getItem("publishedRosters")) || [];

  const newPublishedRoster = {
    id: Date.now(),
    title: `Published Roster ${publishedRosters.length + 1}`,
    weekStartDate: currentWeekStart,
    uwRoster,
    grRoster,
    publishedAt: new Date().toLocaleString(),
  };

  const updatedPublishedRosters = [
    ...publishedRosters,
    newPublishedRoster,
  ];

  localStorage.setItem(
    "publishedRosters",
    JSON.stringify(updatedPublishedRosters)
  );

  showMessage("Roster published successfully");
};

  const groupedAvailability = availabilityRecords.reduce((groups, record) => {
    const key = record.doctorEmail || record.doctorName;

    if (!groups[key]) {
      groups[key] = {
        doctorName: record.doctorName,
        doctorEmail: record.doctorEmail,
        records: [],
      };
    }

    groups[key].records.push(record);
    return groups;
  }, {});

  const currentRoster = activeSite === "UW" ? uwRoster : grRoster;
  const displayRoster =
    currentRoster.length > 0 ? currentRoster : createEmptyRoster();

  const changeDoctor = (cellKey, doctorName) => {
    const [day, shift, section] = cellKey.split("|");

    setSelectedDoctors((prev) => ({
      ...prev,
      [cellKey]: doctorName,
    }));

    const updateRoster = (prev) =>
      prev.map((row) => {
        if (row.day !== day || row.shift !== shift) return row;

        const currentDoctors = Array.isArray(row[section])
          ? row[section]
          : [];

        return {
          ...row,
          [section]: [
            doctorName,
            ...currentDoctors.filter((d) => d !== doctorName),
          ],
        };
      });

    if (activeSite === "UW") {
      setUwRoster(updateRoster);
    } else {
      setGrRoster(updateRoster);
    }
  };

  useEffect(() => {
    loadCurrentWeekRoster();
    loadDoctors();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setShowProfileMenu(false);
  }, [activeTab]);

  useEffect(() => {
    const closeProfileMenu = () => setShowProfileMenu(false);
    document.addEventListener("click", closeProfileMenu);

    return () => {
      document.removeEventListener("click", closeProfileMenu);
    };
  }, []);

  return (
    <div className="adminPage">
      <div className={`adminPanel ${activeTab === "manageDoctors" ? "manageDoctorsMode" : ""}`}>
        {showSavePopup && (
          <div className="adminPopupOverlay">
            <div className="adminSavePopup">
              <h3>Save Roster</h3>

              <input
                type="text"
                placeholder="Enter roster name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
              />

              <div className="adminSaveButtons">
                <button type="button" onClick={confirmSaveRoster}>
                  Save
                </button>

                <button type="button" onClick={() => setShowSavePopup(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="adminToast">{toast}</div>}

        {doctorToDelete && (
          <div
            className="deleteDoctorOverlay"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isDeletingDoctor) {
                setDoctorToDelete(null);
              }
            }}
          >
            <div
              className="deleteDoctorPopup"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-doctor-title"
            >
              <div className="deleteDoctorPopupIcon">!</div>

              <h2 id="delete-doctor-title">Delete doctor account?</h2>

              <p>
                You are about to permanently delete
                <strong>{doctorToDelete.name}</strong>.
              </p>

              <p className="deleteDoctorPopupEmail">
                {doctorToDelete.email}
              </p>

              <p className="deleteDoctorPopupWarning">
                This action cannot be undone.
              </p>

              <div className="deleteDoctorPopupActions">
                <button
                  type="button"
                  className="deleteDoctorCancelBtn"
                  onClick={() => setDoctorToDelete(null)}
                  disabled={isDeletingDoctor}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="deleteDoctorConfirmBtn"
                  onClick={confirmDeleteDoctor}
                  disabled={isDeletingDoctor}
                >
                  {isDeletingDoctor ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        <AdminSidebar
          activePage={
            activeTab === "manageDoctors" ? "manageDoctors" : "home"
          }
          onHome={() => {
            setActiveTab("roster");
            onHome?.();
          }}
          onManageDoctors={() => {
            setActiveTab("manageDoctors");
            loadDoctors();
          }}
          onRoster={onDoctorRoster}
          onProfile={onProfile}
          onLogout={onLogout}
        />

        <main className="adminContent">
          <div className="adminHeader">

  <div>
    <h1>Admin Dashboard</h1>
    <p>{user?.name || "Admin"}</p>
  </div>

  <div
    className="adminProfileWrapper"
    style={{ zIndex: 1001 }}
    onClick={(event) => event.stopPropagation()}
  >

    <button
      type="button"
      className="adminProfileAvatarBtn"
      onClick={(event) => {
        event.stopPropagation();
        setShowProfileMenu((current) => !current);
      }}
    >
      {user?.profileImage ? (
        <img src={user.profileImage} alt="Profile" />
      ) : (
        <div className="adminDefaultAvatar">
          👤
        </div>
      )}
    </button>

    {showProfileMenu && (
      <div className="adminProfileMenu">

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setShowProfileMenu(false);
            onProfile?.();
          }}
        >
          Profile
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setShowProfileMenu(false);
            onLogout?.();
          }}
        >
          Logout
        </button>

      </div>
    )}

  </div>

</div>

          <div className="adminTabs">
            
            <button
              className={activeTab === "roster" ? "active" : ""}
              onClick={() => setActiveTab("roster")}
            >
              Roster view
            </button>

            <button
              className={activeTab === "saved" ? "active" : ""}
              onClick={() => setActiveTab("saved")}
            >
              Saved
            </button>

            <button
              className={activeTab === "availability" ? "active" : ""}
              onClick={() => {
                setActiveTab("availability");
                refreshRecords();
              }}
            >
              Doc Availability
            </button>

            <button
              className={activeTab === "analytics" ? "active" : ""}
              onClick={() => {
                setActiveTab("analytics");
                refreshRecords();
              }}
            >
              Analytics
            </button>
          </div>

          <hr />

          {activeTab === "analytics" ? (
            <div className="analyticsPage">
              <div className="analyticsGrid">
                <div className="analyticsCard">
                  <h3>Submission Status</h3>

                  <div className="analyticsBigNumber">
                    {submissionPercentage}%
                  </div>

                  <p>
                    {submittedDoctors} / {totalDoctors} Doctors Submitted
                  </p>

                  <div className="progressBar">
                    <div
                      className="progressFill"
                      style={{ width: `${submissionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="analyticsCard">
                  <h3>Availability by Day</h3>

                  {days.map((day) => (
                    <div className="dayBar" key={day}>
                      <span>{day.substring(0, 3)}</span>

                      <div className="bar">
                        <div
                          className="barFill"
                          style={{
                            width: `${(dayCounts[day] / maxDayCount) * 100}%`,
                          }}
                        ></div>
                      </div>

                      <span>{dayCounts[day]}</span>
                    </div>
                  ))}
                </div>

                <div className="analyticsCard">
                  <h3>Staffing Risk</h3>

                  {staffingRisk.length === 0 ? (
                    <p>No staffing risks found.</p>
                  ) : (
                    staffingRisk.slice(0, 5).map((risk, index) => (
                      <div
                        className={`riskRow ${risk.level.toLowerCase()}`}
                        key={index}
                      >
                        <strong>{risk.level}</strong>
                        <span>
                          {risk.day} {risk.shift}
                        </span>
                        <small>{risk.count} doctors</small>
                      </div>
                    ))
                  )}
                </div>

                <div className="analyticsCard">
                  <h3>Pending Doctors</h3>

                  {pendingDoctors.length === 0 ? (
                    <p>All doctors submitted.</p>
                  ) : (
                    pendingDoctors.map((doctor) => (
                      <p key={doctor.email}>{doctor.name}</p>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === "availability" ? (
            <div className="doctorAvailabilityPage">
              {Object.values(groupedAvailability).length === 0 ? (
                <p className="noSavedText">
                  No doctor availability submitted yet.
                </p>
              ) : (
                Object.values(groupedAvailability).map((doctor) => {
                  const expanded = expandedDoctor === doctor.doctorEmail;
                  const records = expanded
                    ? doctor.records
                    : doctor.records.slice(0, 3);

                  return (
                    <div
                      key={doctor.doctorEmail}
                      className="doctorAvailabilityCard"
                      onClick={() =>
                        setExpandedDoctor(expanded ? null : doctor.doctorEmail)
                      }
                    >
                      <div className="doctorAvailabilityHeader">
                        <div>
                          <h3>{doctor.doctorName}</h3>
                          <p>{doctor.doctorEmail}</p>
                        </div>

                        <span>
                          {doctor.records.length} records {expanded ? "▲" : "▼"}
                        </span>
                      </div>

                      <div className="availabilityRecordHeader">
                        <span>Day</span>
                        <span>Shift</span>
                        <span>Preference</span>
                      </div>

                      {records.map((record, index) => (
                        <div className="availabilityRecordRow" key={index}>
                          <span>{record.day}</span>
                          <span>{record.shift}</span>
                          <span>{record.preference}</span>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          ) : activeTab === "saved" ? (
            <div className="savedRosterPage">
              {!openedSavedRoster ? (
                savedRosters.length === 0 ? (
                  <p className="noSavedText">No saved rosters yet.</p>
                ) : (
                  savedRosters.map((roster) => (
                    <div className="savedRosterRow" key={roster.id}>
                      <span>{roster.name}_{roster.date}</span>

                      <div>
                        <button onClick={() => openSavedRoster(roster)}>
                          Open
                        </button>
                        <button onClick={() => deleteSavedRoster(roster.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <>
                  <div className="savedOpenActions">
                    <div className="adminToggle">
                      <button
                        className={activeSite === "GR" ? "active" : ""}
                        onClick={() => setActiveSite("GR")}
                      >
                        GR
                      </button>

                      <button
                        className={activeSite === "UW" ? "active" : ""}
                        onClick={() => setActiveSite("UW")}
                      >
                        UW
                      </button>
                    </div>

                    <div className="savedActionButtons">

                            <button
                            className="savedSaveBtn"
                            onClick={saveSavedRosterChanges}
                        >
                            Save
                        </button>

                            <button
                                className="savedPublishBtn"
                                onClick={publishSavedRoster}
                            >
                                Publish
                            </button>

                            <button
                                className="savedBackBtn"
                                onClick={() => setOpenedSavedRoster(null)}
                            >
                                Back
                            </button>

                            </div>
                  </div>

                 <SavedRosterTable
                    roster={displayRoster}
                    sections={sections}
                    onRosterChange={(updatedRoster) => {

                        if (activeSite === "UW") {
                            setOpenedSavedRoster({
                                ...openedSavedRoster,
                                uwRoster: updatedRoster,
                            });
                        } else {
                            setOpenedSavedRoster({
                                ...openedSavedRoster,
                                grRoster: updatedRoster,
                            });
                        }

                    }}
                />
                </>
              )}
            </div>
) : activeTab === "manageDoctors" ? (
  <div className="manageDoctorsTab pageTransition">
    <div className="manageDoctorsHeader">
      <div>
        <h2>Admin Manage Doctor View</h2>
        <p>{user?.name || "Admin"}</p>
      </div>

      <button
        type="button"
        className="manageDoctorsBackBtn"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setShowProfileMenu(false);
          setActiveTab("roster");
          onHome?.();
        }}
      >
        Back
      </button>
    </div>

    <hr className="manageDoctorsDivider" />

    <form
      className="manageDoctorForm"
      onSubmit={handleCreateDoctor}
    >
      <input
        type="text"
        placeholder="Full name"
        value={doctorName}
        onChange={(e) => setDoctorName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Email address"
        value={doctorEmail}
        onChange={(e) => setDoctorEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Temporary password"
        value={doctorPassword}
        onChange={(e) => setDoctorPassword(e.target.value)}
        minLength={8}
        required
      />

      <button type="submit">
        Create
      </button>
    </form>

    <div className="manageDoctorList">
      {doctors.length === 0 ? (
        <p className="noSavedText">
          No doctor accounts found.
        </p>
      ) : (
        doctors.map((doctor) => (
          <div
            className="manageDoctorCard"
            key={doctor.id}
          >
            <div className="manageDoctorDetails">
              <strong>{doctor.name}</strong>
              <span>{doctor.email}</span>
            </div>

            <div className="manageDoctorActions">
              <span
                className={
                  doctor.enabled
                    ? "manageDoctorActive"
                    : "manageDoctorDisabled"
                }
              >
                {doctor.enabled ? "Active" : "Disabled"}
              </span>

              <button
                type="button"
                className="manageDoctorDelete"
                onClick={() => handleDeleteDoctor(doctor)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
) : (
  <>
    <div className="adminActions">
                <button onClick={refreshRecords}>Refresh</button>
                <button onClick={generateRoster}>Generate</button>
                <button onClick={() => setShowSavePopup(true)}>Save</button>
                <button onClick={clearRoster}>Clear</button>
                <button onClick={publishRoster}>Publish</button>
              </div>

              <div className="adminSubHeader">
                <div className="adminToggle">
                  <button
                    className={activeSite === "GR" ? "active" : ""}
                    onClick={() => setActiveSite("GR")}
                  >
                    GR
                  </button>

                  <button
                    className={activeSite === "UW" ? "active" : ""}
                    onClick={() => setActiveSite("UW")}
                  >
                    UW
                  </button>
                </div>

                <p>Saved Availability Records - {availabilityRecords.length}</p>
              </div>

              <div className="adminRosterBox">
                <RosterTable
                  displayRoster={displayRoster}
                  sections={sections}
                  selectedDoctors={selectedDoctors}
                  changeDoctor={changeDoctor}
                  openDoctorDropdown={openDoctorDropdown}
                  setOpenDoctorDropdown={setOpenDoctorDropdown}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}


function RosterTable({
  displayRoster,
  sections,
  selectedDoctors = {},
  changeDoctor = () => {},
  openDoctorDropdown,
  setOpenDoctorDropdown = () => {},
}) {
  return (
    <>
      <div
        className="adminRosterHeader"
        style={{
          gridTemplateColumns: `100px 100px repeat(${sections.length}, 1fr)`,
        }}
      >
        <div>Day</div>
        <div>Shift</div>

        {sections.map((section) => (
          <div key={section}>{section}</div>
        ))}
      </div>

      <div className="adminRosterBody">
        {days.map((day) => (
          <div className="adminDayGroup" key={day}>
            <div className="adminDayCell">{day}</div>

            <div className="adminShiftRows">
              {shifts.map((shift) => {
                const row = displayRoster.find(
                  (r) => r.day === day && r.shift === shift
                );

                return (
                  <div
                    className="adminRosterRow"
                    key={`${day}-${shift}`}
                    style={{
                      gridTemplateColumns: `100px repeat(${sections.length}, 1fr)`,
                    }}
                  >
                    <div className="adminShiftCell">{shift}</div>

                    {sections.map((section) => {
                      const cellKey = `${day}|${shift}|${section}`;
                      const doctors = row?.[section];

                      return (
                        <div className="adminDoctorCell" key={section}>
                          {Array.isArray(doctors) ? (
                            doctors.length > 1 ? (
                              <div className="doctorDropdown">
                                <button
                                  type="button"
                                  className="doctorDropdownBtn"
                                  onClick={() =>
                                    setOpenDoctorDropdown(
                                      openDoctorDropdown === cellKey
                                        ? null
                                        : cellKey
                                    )
                                  }
                                >
                                  {selectedDoctors[cellKey] || doctors[0]}
                                  <span>▼</span>
                                </button>

                                {openDoctorDropdown === cellKey && (
                                  <div className="doctorDropdownMenu">
                                    {doctors.map((doctor) => (
                                      <button
                                        key={doctor}
                                        type="button"
                                        onClick={() => {
                                          changeDoctor(cellKey, doctor);
                                          setOpenDoctorDropdown(null);
                                        }}
                                      >
                                        {doctor}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              doctors[0] || ""
                            )
                          ) : (
                            doctors || ""
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SavedRosterTable({
  roster,
  sections,
  onRosterChange,
}) {
  const [savedSelectedDoctors, setSavedSelectedDoctors] = useState({});
  const [savedOpenDropdown, setSavedOpenDropdown] = useState(null);

 const changeSavedDoctor = (cellKey, doctorName) => {

  const [day, shift, section] = cellKey.split("|");

  const updatedRoster = roster.map((row) => {

    if (row.day !== day || row.shift !== shift)
      return row;

    const doctors = Array.isArray(row[section])
      ? row[section]
      : [];

    return {
      ...row,
      [section]: [
        doctorName,
        ...doctors.filter((d) => d !== doctorName),
      ],
    };
  });

  onRosterChange(updatedRoster);
};

  return (
    <div className="savedRosterTableBox">
      <RosterTable
        displayRoster={roster || []}
        sections={sections}
        selectedDoctors={savedSelectedDoctors}
        changeDoctor={changeSavedDoctor}
        openDoctorDropdown={savedOpenDropdown}
        setOpenDoctorDropdown={setSavedOpenDropdown}
      />
    </div>
  );
}

export default AdminDashboard;