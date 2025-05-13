import { authAxios, authAxiosGET } from "./HttpMethod";
import { profileInfoURL, companyInfoURL, getDbList, } from "./ConstantServices";

export function getProfileInfo() {
    // console.log('getProfileInfo')
    return authAxios(profileInfoURL)
}

export function getCompanyInfo() {
    return authAxios(companyInfoURL)
}

export function getDBListInfo() {
    let data = {
         'mobile_app_type': 'CRM_C'
      };
    return authAxiosGET(getDbList, data)
}

