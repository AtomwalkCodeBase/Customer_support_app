import { authAxios, authAxiosGET } from "./HttpMethod";
import { profileInfoURL, companyInfoURL, getDbList, } from "./ConstantServices";

export async function getProfileInfo() {
    const url = await profileInfoURL();
    // console.log('getProfileInfo')
    return authAxios(url)
}

export async function getCompanyInfo() {
    const url = await companyInfoURL(); // Await the async function
    return authAxios(url);
  }

export function getDBListInfo() {
    let data = {
         'mobile_app_type': 'CRM_C'
      };
    return authAxiosGET(getDbList, data)
}

