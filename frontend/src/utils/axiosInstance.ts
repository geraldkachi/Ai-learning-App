import axios from "axios"
import { BASE_URL } from "./apiPaths"
import { toast } from "react-hot-toast/headless";


const  axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 80000, // 80 seconds timeout
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true, // Include cookies in requests
});

// Request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 errors and token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
    const originalRequest = error.config;

        if (error.response) {
            console.log(error, 'error')
            // Handle 500 errors
            if (error.response.status === 500) {
                 console.error('Server error. Please try again later.');
                 toast.error('Server error. Please try again later.');
            }
                  // Check if the error is a 401 and we haven't already tried to refresh
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
                const newToken = refreshResponse.data.token;

                // Update localStorage with the new token
                localStorage.setItem("token", newToken);

                // Update the Authorization header and retry the original request
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // If token refresh fails, clear localStorage and redirect to login
                localStorage.removeItem("token");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }
        } else if (error.code === "ECONNABORTED") {
            console.error('Request timeout.')
            toast.error('Request timeout.')
        }
        return Promise.reject(error);
    }


    // async (error) => {
    //     const originalRequest = error.config;

    //     // Check if the error is a 401 and we haven't already tried to refresh
    //     if (error.response && error.response.status === 401 && !originalRequest._retry) {
    //         originalRequest._retry = true;

    //         try {
    //             // Attempt to refresh the token
    //             const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
    //             const newToken = refreshResponse.data.token;

    //             // Update localStorage with the new token
    //             localStorage.setItem("token", newToken);

    //             // Update the Authorization header and retry the original request
    //             originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
    //             return axiosInstance(originalRequest);
    //         } catch (refreshError) {
    //             // If token refresh fails, clear localStorage and redirect to login
    //             localStorage.removeItem("token");
    //             window.location.href = "/login";
    //             return Promise.reject(refreshError);
    //         }
    //     }

    //     return Promise.reject(error);
    // }
);

export default axiosInstance;