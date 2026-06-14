import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8000/api", // Đảm bảo đúng port backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");

      const currentPath = window.location.pathname;

      if (!currentPath.includes("/login")) {
        const pathParts = currentPath.split("/");
        const domain = pathParts[1];

        if (domain && domain !== "admin") {
          window.location.href = `/${domain}/login`;
        } else {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
