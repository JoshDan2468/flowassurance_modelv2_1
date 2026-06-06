export type LoginCredentials = {
  email: string;
  password: string;
};

export async function login(_credentials: LoginCredentials) {
  return {
    user: null,
    token: null,
  };
}
