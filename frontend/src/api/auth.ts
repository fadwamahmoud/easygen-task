import { api } from './client';

export type SignupInput = {
  email: string;
  name: string;
  password: string;
};

export type SigninInput = {
  email: string;
  password: string;
};

export type SafeUser = {
  id: string;
  email: string;
  name: string;
};

export async function signup(input: SignupInput) {
  return api<SafeUser>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function signin(input: SigninInput) {
  return api<{ accessToken: string }>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function me() {
  return api<SafeUser>('/auth/me', { method: 'GET', auth: true });
}