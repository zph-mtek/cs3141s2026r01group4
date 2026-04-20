import axios from 'axios';

const API_BASE_URL = 'https://huskyrentlens.cs.mtu.edu';

//update
export const updateUser = async (data) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/backend/updateUser.php`, data, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

//ban
export const deleteUser = async (data) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/backend/deleteUser.php`, data, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};