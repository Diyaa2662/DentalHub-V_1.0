import axios from "axios";

// Base URL
const BASE_URL = "http://back.neotonicglobal.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const isFormData = config.data instanceof FormData;

    if (!isFormData) {
      config.headers["Content-Type"] = "application/json";
    }

    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.error("Session expired");
      } else if (status === 403) {
        console.error("No permission");
      } else if (status === 404) {
        console.error("Not found");
      } else if (status === 422) {
        console.error("Validation error");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
