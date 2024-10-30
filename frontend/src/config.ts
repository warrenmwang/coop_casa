// Read in Environment variables

const IS_PROD_TMP = import.meta.env.VITE_IS_PROD;
if (!IS_PROD_TMP) {
  throw new Error("Missing environment variables.");
}
let IS_PROD: boolean;
if (IS_PROD_TMP.trim().toLowerCase() === "true") {
  IS_PROD = true;
} else {
  IS_PROD = false;
}

const API_HOST_TMP = IS_PROD
  ? import.meta.env.VITE_API_PROD_HOST
  : import.meta.env.VITE_API_DEV_HOST;
const API_PORT_TMP = import.meta.env.VITE_API_PORT;

if (!API_HOST_TMP || !API_PORT_TMP) {
  throw new Error("Missing API_HOST or API_PORT variables.");
}

const API_HOST: string = API_HOST_TMP;
const API_PORT: number = parseInt(API_PORT_TMP);

export { API_HOST, API_PORT, IS_PROD };
