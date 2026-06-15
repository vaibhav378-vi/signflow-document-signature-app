import axios from "axios";

const API = axios.create({
  baseURL: "https://signflow-document-signature-app-2.onrender.com/api",
});

export default API;