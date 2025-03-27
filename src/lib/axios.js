import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create();

// Set the base URL for all requests
axiosInstance.defaults.baseURL = `${import.meta.env.VITE_API_URL}/api`;

// Add a request interceptor to include the Authorization header with the token
axiosInstance.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem("token"); // Retrieve the auth token from localStorage

    if (authToken) {
      // Set the Authorization header if the token exists
      config.headers["Authorization"] = `Bearer ${authToken}`;
    }

    return config; // Return the modified config object
  },
  (error) => {
    // Handle errors if necessary
    return Promise.reject(error);
  }
);

export default axiosInstance;
