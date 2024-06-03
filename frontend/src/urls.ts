import { API_HOST, API_PORT, IS_PROD } from './config'

/*

  All the URLs for navigation on the frontend or
  endpoints on the backend in one place.

*/

// FRONT END
export const homePageLink = "/"
export const aboutPageLink = "/about"
export const accountSettingsLink = "/account-settings"
export const privacypolicyPageLink = "/privacy-policy"
export const termsOfServicePageLink = "/tos"
export const attributionsPageLink = "/attributions"
export const contactPageLink = "/contact"

// BACK END
// NOTE: We need to use different urls based on whether we are in prod or dev (local machine) environments,
// bc in our deploment environment, we are using nginx as a reverse proxy for the backend that uses the same
// domain as the frontend, but with a different port. We can't access the backend directly from the client browser
// and need to access the backend requests through the same domain that nginx will proxy to the 
// backend port.
export const googleOAuthLink = IS_PROD ? `${API_HOST}/auth/google` : `${API_HOST}:${API_PORT}/auth/google`
export const api_account_Link = IS_PROD ? `${API_HOST}/api/account` : `${API_HOST}:${API_PORT}/api/account`
export const api_account_update_Link = IS_PROD ? `${API_HOST}/api/account/update` : `${API_HOST}:${API_PORT}/api/account/update`
export const api_logout_Link = IS_PROD ? `${API_HOST}/api/logout` : `${API_HOST}:${API_PORT}/api/logout`