export type Token = string | null;

export type UserToken = {
  token: Token;
  refreshToken?: string | null;
};
