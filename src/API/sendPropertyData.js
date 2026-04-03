import axios from 'axios';

export const submitPropertyData = async (formData) => {
  const API_BASE_URL = 'https://huskyrentlens.cs.mtu.edu';
  const response = await axios.post(`${API_BASE_URL}/backend/`);

  return response.data;
};