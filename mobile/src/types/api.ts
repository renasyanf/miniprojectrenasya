export type ApiSuccess<T> = {
  statusCode: number;
  data: T;
};

export type UserDto = {
  id: string;
  email: string;
};

export type SessionDto = {
  id: string;
  deviceId: string;
  deviceName: string;
  isActive: boolean;
  lastUsedAt: string;
  createdAt?: string;
  ipAddress?: string;
  userAgent?: string;
};

export type LoginResponse = {
  accessToken: string;
  sessionId: string;
  user: UserDto;
  deviceId: string;
};
