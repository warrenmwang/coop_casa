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
export const apiAuthGoogleOAuthLink = `${API_HOST}:${API_PORT}/auth/v1/google`;
export const apiAuthLogoutLink = `${API_HOST}:${API_PORT}/auth/v1/google/logout`;
export const apiAuthCheckLink = `${API_HOST}:${API_PORT}/auth/v1/google/check`;

export const apiAccountLink = `${API_HOST}:${API_PORT}/api/v1/account`;
export const apiAccountUpdateLink = `${API_HOST}:${API_PORT}/api/v1/account`;
export const apiUserRoleLink = `${API_HOST}:${API_PORT}/api/v1/account/role`;
export const apiAccountUserProfileImagesLink = `${API_HOST}:${API_PORT}/api/v1/account/images`;
export const apiAccountUserSavedCommunties = `${API_HOST}:${API_PORT}/api/v1/account/saved/communities`;
export const apiAccountUserSavedProperties = `${API_HOST}:${API_PORT}/api/v1/account/saved/properties`;
export const apiAccountUserSavedUsers = `${API_HOST}:${API_PORT}/api/v1/account/saved/users`;
export const apiAccountStatusLink = `${API_HOST}:${API_PORT}/api/v1/account/status`;

export const apiAdminUsersLink = `${API_HOST}:${API_PORT}/api/v1/admin/users`;
export const apiAdminUsersRolesLink = `${API_HOST}:${API_PORT}/api/v1/admin/users/roles`;
export const apiAdminTotalsLink = `${API_HOST}:${API_PORT}/api/v1/admin/total`;

export const apiPropertiesLink = `${API_HOST}:${API_PORT}/api/v1/properties`;
export const apiListerLink = `${API_HOST}:${API_PORT}/api/v1/lister`;

export const apiCommunitiesLink = `${API_HOST}:${API_PORT}/api/v1/communities`;
export const apiCommunitiesUsersLink = `${API_HOST}:${API_PORT}/api/v1/communities/users`;
export const apiCommunitiesPropertiesLink = `${API_HOST}:${API_PORT}/api/v1/communities/properties`;

export const apiUsersLink = `${API_HOST}:${API_PORT}/api/v1/users`;
