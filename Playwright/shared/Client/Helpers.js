import axios from "axios";
import dotenv from "dotenv";
import { test, expect } from "@playwright/test";

dotenv.config();

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_API_URI;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": API_KEY,
  },
});

export const postRequest = async (endpoint, data) => {
  try {
    const response = await apiClient.post(endpoint, data);
    expect(await response.data.isSuccess).toBe(true);
    return response;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};
