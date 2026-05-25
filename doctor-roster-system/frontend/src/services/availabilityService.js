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