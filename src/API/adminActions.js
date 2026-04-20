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

// all properites
export const getAdminProperties = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/backend/getAdminProperties.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

// delete comments
export const deleteProperty = async (propertyId) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/backend/deleteProperty.php`, { propertyId }, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

//delete commnets
export const deleteComment = async (commentId) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/backend/deleteComment.php`, { commentId }, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

//comments
export const getAdminComments = async (propertyId = null) => {
    const token = localStorage.getItem('token');
    const url = propertyId 
        ? `${API_BASE_URL}/backend/getAdminComments.php?propertyId=${propertyId}`
        : `${API_BASE_URL}/backend/getAdminComments.php`;

    const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};
