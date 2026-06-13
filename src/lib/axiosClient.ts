import axios from 'axios';

// Use empty baseURL so requests go to the same origin (frontend server).
// Next.js rewrites will proxy /api/* requests to the backend server.
const axiosClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
