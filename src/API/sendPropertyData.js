import axios from 'axios';

export const submitPropertyData = async (formData) => {
  const API_BASE_URL = 'https://huskyrentlens.cs.mtu.edu';
  
  const token = localStorage.getItem('token');

  const response = await axios.post(`${API_BASE_URL}/backend/addProperty.php`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data', 
        'Authorization': `Bearer ${token}`     
    }
  });

  return response.data;
};