import axios from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthInterceptor?: boolean;
  }
}

// Centralized Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true, // Crucial for manual cookie parser on the server
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to handle responses and throw standard exceptions
api.interceptors.response.use(
  (response) => {
    // Return the response data envelope directly
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    
    // Log token failures or expired sessions, which can trigger auth store resets
    // Skip dispatching event for auth check requests to prevent infinite loops
    if (error.response?.status === 401 && !error.config?.skipAuthInterceptor) {
      if (typeof window !== "undefined") {
        // Trigger event or store action if needed
        window.dispatchEvent(new Event("auth-unauthorized"));
      }
    }

    // Attach user friendly error message to the error object
    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

export default api;
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}
