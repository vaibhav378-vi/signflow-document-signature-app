import axios from "axios";

const API = axios.create({
  baseURL: "https://YOUR-RENDER-BACKEND-URL.onrender.com/api",
});

export default API;