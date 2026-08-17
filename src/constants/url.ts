// -------- internal urls --------

// pages
export const HOME_PATH = "/";
export const NOTE_LIST_PATH = "/notes";
export const NOTE_DETAIL_PATH = (id: string) => `${NOTE_LIST_PATH}/${id}`;

// api
export const API_PATH = "/api";
export const AUTH_API_PATH = API_PATH + "/auth";
export const GOOGLE_AUTH_API_PATH = AUTH_API_PATH + "/google";
export const CALLBACK_GOOGLE_AUTH_API_PATH = GOOGLE_AUTH_API_PATH + "/callback";
export const SESSION_API_PATH = AUTH_API_PATH + "/session";
export const LOGOUT_API_PATH = AUTH_API_PATH + "/logout";

// -------- external urls ---------

// pages
export const GOOGLE_OAUTH_CONSENT_SCREEN_URL = "https://accounts.google.com/o/oauth2/v2/auth";

// api
export const GOOGLE_OAUTH_TOKEN_API_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_OAUTH_USERINFO_API_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
