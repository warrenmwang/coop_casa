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
export const communitiesPageLink = "/communities";
export const propertiesPageLink = "/properties";
export const dashboardPageLink = "/dashboard";
export const usersPageLink = "/users";

// BACK END
export const apiAuthGoogleOAuthLink = `${API_HOST}:${API_PORT}/auth/google`;
export const apiAuthLogoutLink = `${API_HOST}:${API_PORT}/auth/google/logout`;
export const apiAuthCheckLink = `${API_HOST}:${API_PORT}/auth/google/check`;

export const apiAccountLink = `${API_HOST}:${API_PORT}/api/account`;
export const apiAccountUpdateLink = `${API_HOST}:${API_PORT}/api/account`;
export const apiUserRoleLink = `${API_HOST}:${API_PORT}/api/account/role`;
export const apiUserCommunities = `${API_HOST}:${API_PORT}/api/account/communities`;

export const apiAdminUsersLink = `${API_HOST}:${API_PORT}/api/admin/users`;
export const apiAdminUsersRolesLink = `${API_HOST}:${API_PORT}/api/admin/users/roles`;

export const apiPropertiesLink = `${API_HOST}:${API_PORT}/api/properties`;

export const apiListerLink = `${API_HOST}:${API_PORT}/api/lister`;

export const apiCommunitiesLink = `${API_HOST}:${API_PORT}/api/communities`;
export const apiCommunitiesUsersLink = `${API_HOST}:${API_PORT}/api/communities/users`;
export const apiCommunitiesPropertiesLink = `${API_HOST}:${API_PORT}/api/communities/properties`;

export const apiUsersLink = `${API_HOST}:${API_PORT}/api/users`;
