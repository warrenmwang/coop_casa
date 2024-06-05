import { API_HOST, API_PORT, IS_PROD } from './config'

/*

  All the URLs for navigation on the frontend or
  endpoints on the backend in one place.

*/

// FRONT END
export const homePageLink = "/"
export const aboutPageLink = "/about"
export const accountSettingsPageLink = "/account-settings"
export const accountSetupPageLink = "/account-setup"
export const privacypolicyPageLink = "/privacy-policy"
export const termsOfServicePageLink = "/tos"
export const attributionsPageLink = "/attributions"
export const contactPageLink = "/contact"
export const oauthCallBackPageLink = "/oauth-callback"
export const communitiesPageLink = "/communities"
export const propertiesPageLink = "/properties"
export const mapPageLink = "/map"
export const dashboardPageLink = "/dashboard"


// BACK END
// NOTE: We need to use different urls based on whether we are in prod or dev (local machine) environments,
// bc in our deploment environment, we are using nginx as a reverse proxy for the backend that uses the same
// domain as the frontend, but with a different port. We can't access the backend directly from the client browser
// and need to access the backend requests through the same domain that nginx will proxy to the 
// backend port.
export const api_auth_googleOAuthLink = IS_PROD ? `${API_HOST}/auth/google` : `${API_HOST}:${API_PORT}/auth/google`
export const api_auth_logout_Link = IS_PROD ? `${API_HOST}/auth/logout` : `${API_HOST}:${API_PORT}/auth/logout`
export const api_auth_check_link = IS_PROD ? `${API_HOST}/auth/check` : `${API_HOST}:${API_PORT}/auth/check`
export const api_account_Link = IS_PROD ? `${API_HOST}/api/account` : `${API_HOST}:${API_PORT}/api/account`
export const api_account_update_Link = IS_PROD ? `${API_HOST}/api/account/update` : `${API_HOST}:${API_PORT}/api/account/update`
