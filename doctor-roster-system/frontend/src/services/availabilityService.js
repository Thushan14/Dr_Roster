import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const testBackend = async () => {
  const response = await axios.get(`${API_URL}/test`);
  return response.data;
};

export const submitAvailability = async (availabilityData) => {
  const response = await axios.post(`${API_URL}/availability`, availabilityData);
  return response.data;
};

export const getAvailability = async () => {
  const response = await axios.get(`${API_URL}/availability`);
  return response.data;
};

export const deleteAllAvailability = async () => {
  const response = await axios.delete(`${API_URL}/availability`);
  return response.data;
};
export const getAvailabilityByWeek = async (weekStartDate) => {
  const response = await axios.get(`${API_URL}/availability/week/${weekStartDate}`);
  return response.data;
};
export const getSavedWeeks = async () => {
  const response = await axios.get(`${API_URL}/availability/weeks`);
  return response.data;
};
export const saveRoster = async (rosterData) => {
  const response = await axios.post(`${API_URL}/rosters/save`, rosterData);
  return response.data;
};

export const getSavedRosters = async () => {
  const response = await axios.get(`${API_URL}/rosters`);
  return response.data;
};

export const deleteSavedRoster = async (id) => {
  const response = await axios.delete(`${API_URL}/rosters/${id}`);
  return response.data;
};

export const getPublishedRoster = () => {
  const data = localStorage.getItem("publishedRoster");
  return data ? JSON.parse(data) : null;
};

export const savePrivateRoster = (roster) => {
  const saved = JSON.parse(localStorage.getItem("privateSavedRosters")) || [];
  saved.push(roster);
  localStorage.setItem("privateSavedRosters", JSON.stringify(saved));
};

export const publishRoster = (roster) => {
  localStorage.setItem("publishedRoster", JSON.stringify(roster));
};