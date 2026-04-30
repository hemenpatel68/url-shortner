export type AuthMode = "login" | "signup";

export type ShortUrl = {
  id: string;
  shortCode: string;
  targetURL: string;
  createdAt?: string;
};

export type ApiError = {
  message?: string;
  errors?: Array<{ message?: string; path?: Array<string | number> }>;
};
