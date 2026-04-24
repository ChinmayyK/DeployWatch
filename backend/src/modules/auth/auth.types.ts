export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: AuthUserDto;
}
