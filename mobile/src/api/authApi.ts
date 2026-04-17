import { apiRequest } from './http';
import type { LoginResponse, SessionDto, UserDto } from '../types/api';

export const authApi = {
  register(email: string, password: string): Promise<UserDto> {
    return apiRequest<UserDto>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  login(
    email: string,
    password: string,
    deviceId: string,
    deviceName: string,
  ): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, deviceId, deviceName }),
    });
  },

  me(accessToken: string): Promise<UserDto> {
    return apiRequest<UserDto>('/auth/me', {
      method: 'GET',
      accessToken,
    });
  },

  sessions(accessToken: string): Promise<SessionDto[]> {
    return apiRequest<SessionDto[]>('/auth/sessions', {
      method: 'GET',
      accessToken,
    });
  },

  revokeSession(accessToken: string, sessionId: string): Promise<void> {
    return apiRequest<void>(`/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      accessToken,
    });
  },
};
