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


export const googleOAuthLink = IS_PROD ? `${API_HOST}/auth/google` : `${API_HOST}:${API_PORT}/auth/google`
export const api_account_Link = IS_PROD ? `${API_HOST}/api/account` : `${API_HOST}:${API_PORT}/api/account`
export const api_account_update_Link = IS_PROD ? `${API_HOST}/api/account/update` : `${API_HOST}:${API_PORT}/api/account/update`
export const api_logout_Link = IS_PROD ? `${API_HOST}/api/logout` : `${API_HOST}:${API_PORT}/api/logout`