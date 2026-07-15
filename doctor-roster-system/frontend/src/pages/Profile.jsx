import { useState } from "react";
import "./Profile.css";
import AdminSidebar from "../components/AdminSidebar";

function Profile({
  user,
  onBack,
  onLogout,
  onSaveUser,
  onDoctorRoster,
  onAdminHome,
  onManageDoctors,
  onAdminRoster,
  onProfile,
}) {
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [pageLoading, setPageLoading] = useState(false);

  const navigateWithTransition = (callback) => {
    setPageLoading(true);
    window.setTimeout(() => callback?.(), 450);
  };

  const saveChanges = () => {
    const updatedUser = {
      ...user,
      name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      profileImage,
    };

    localStorage.setItem(
      `profile_${user.email}`,
      JSON.stringify(updatedUser)
    );
    onSaveUser(updatedUser);
    alert("Profile updated successfully!");
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const isManager = user?.role === "manager";

  return (
    <div className="profilePage">
      <div className="profilePanel">
        {pageLoading && <div className="pageTransition" />}

        {isManager && (
          <AdminSidebar
            activePage="profile"
            onHome={() => navigateWithTransition(onAdminHome || onBack)}
            onManageDoctors={() => navigateWithTransition(onManageDoctors)}
            onRoster={() =>
              navigateWithTransition(onAdminRoster || onDoctorRoster)
            }
            onProfile={() => onProfile?.()}
            onLogout={onLogout}
          />
        )}

        <main className="profileContent">
          <button
            type="button"
            className="profileBackBtn"
            onClick={() => navigateWithTransition(onBack)}
          >
            Back
          </button>

          <p className="profileTitle">Profile</p>

          <div className="profileTop">
            <div className="avatar">
              {profileImage ? (
                <img src={profileImage} alt="Profile" />
              ) : (
                "👤"
              )}
            </div>

            <label className="changePhotoBtn">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
            </label>
          </div>

          <div className="profileName">
            {fullName || "Name"} <span>✎</span>
          </div>

          <hr />

          <div className="profileForm">
            <label>Full name</label>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />

            <label>Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <label>Phone Num</label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="saveProfileBtn"
            onClick={saveChanges}
          >
            Save Changes
          </button>
        </main>
      </div>
    </div>
  );
}

export default Profile;