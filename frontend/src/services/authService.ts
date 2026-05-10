// authService.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  // Add other profile fields as needed
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
  // Add other user fields as needed
}

// Service functions
const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const register = async (username: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      username,
      email,
      password
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const getProfile = async (): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const updateProfile = async (userData: UpdateProfileData): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, userData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const changePassword = async (passwords: ChangePasswordData): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD, passwords);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
};

export default authService;