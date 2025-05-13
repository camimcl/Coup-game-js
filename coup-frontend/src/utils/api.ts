import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

// Base URL from environment
const BASE_URL = import.meta.env.VITE_API_URL as string || "http://localhost:3000";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Generic GET request
 * @param path - endpoint path (e.g. '/api/matches')
 * @returns parsed response data
 */
export async function get<T>(path: string): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.get(path);
  return response.data;
}

/**
 * Generic POST request
 * @param path - endpoint path
 * @param body - request payload
 * @returns parsed response data
 */
export async function post<T, U>(path: string, body: T): Promise<U> {
  const response: AxiosResponse<U> = await apiClient.post(path, body);
  return response.data;
}

/**
 * Generic PUT request
 * @param path - endpoint path
 * @param body - request payload
 * @returns parsed response data
 */
export async function put<T, U>(path: string, body: T): Promise<U> {
  const response: AxiosResponse<U> = await apiClient.put(path, body);
  return response.data;
}
