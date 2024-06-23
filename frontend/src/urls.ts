import { API_HOST, API_PORT } from "./config";

/*

  All the URLs for navigation on the frontend or
  endpoints on the backend in one place.

*/

// FRONT END
export const homePageLink = "/";
export const aboutPageLink = "/about";
export const accountSettingsPageLink = "/account-settings";
export const accountSetupPageLink = "/account-setup";
export const privacypolicyPageLink = "/privacy-policy";
export const termsOfServicePageLink = "/tos";
export const attributionsPageLink = "/attributions";
export const contactPageLink = "/contact";
export const oauthCallBackPageLink = "/oauth-callback";
export const communitiesPageLink = "/communities";
export const propertiesPageLink = "/properties";
export const mapPageLink = "/map";
export const dashboardPageLink = "/dashboard";

// BACK END
export const api_auth_googleOAuthLink = `${API_HOST}:${API_PORT}/auth/google`;
export const api_auth_logout_Link = `${API_HOST}:${API_PORT}/auth/logout`;
export const api_auth_check_link = `${API_HOST}:${API_PORT}/auth/check`;

export const api_account_Link = `${API_HOST}:${API_PORT}/api/account`;
export const api_account_update_Link = `${API_HOST}:${API_PORT}/api/account`;
export const api_user_role_Link = `${API_HOST}:${API_PORT}/api/account/role`;

export const api_admin_users_Link = `${API_HOST}:${API_PORT}/api/admin/users`;
export const api_admin_users_roles_Link = `${API_HOST}:${API_PORT}/api/admin/users/roles`;

export const api_properties_Link = `${API_HOST}:${API_PORT}/api/properties`;
