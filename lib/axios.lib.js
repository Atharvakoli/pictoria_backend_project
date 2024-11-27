const axios = require("axios");

const axiosInstance = axios.create({
  baseURL: process.env.MICROSERVICE_BASE_URL,
});

module.exports = axiosInstance;
