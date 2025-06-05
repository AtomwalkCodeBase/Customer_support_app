import AsyncStorage from '@react-native-async-storage/async-storage';

const getDbName = async () => {
  let dbData = await AsyncStorage.getItem('dbName');
  console.log("Current dbName:", dbData);
  return dbData
};
// const localhost = "https://www.atomwalk.com"
const localhost = "https://crm.atomwalk.com"

// const apiURL = "/api";
const db_name = getDbName();
const apiURL = "/api";
// const db_name = "PMA_00001";

export const endpoint = `${localhost}${apiURL}`;

export const userLoginURL = async () => {
  const db_name = await getDbName();
   return `${endpoint}/customer_user_login/${db_name}/`;
}

export const companyInfoURL = async () => {
  const db_name = await getDbName();
  return `${endpoint}/company_info/${db_name}/`;
};

export const getTaskCategoryURL = async () => {
  const db_name = await getDbName();
   return `${endpoint}/get_task_category/${db_name}/`;
}

export const userTaskListURL  = async () => {
  const db_name = await getDbName();
  return `${endpoint}/user_task/${db_name}/`;
} 

  
export const addCustomerTicketURL  = async () => {
  const db_name = await getDbName();
  return `${endpoint}/process_customer_ticket/${db_name}/`;
}

export const getDbList = `${endpoint}/get_applicable_site/`;


export const setUserPinURL =  async () => {
  const db_name = await getDbName();
  return `${endpoint}/set_user_pin/${db_name}/`;
} 

export const profileInfoURL = async () => {
   const db_name = await getDbName();
  return  `${endpoint}/profile_info/${db_name}/`;
}

export const getCustomerDetailListURL = async () => {
  const db_name = await getDbName();
  return `${endpoint}/customer_detail_list/${db_name}/`;
}

export const forgetCustomerPinURL =  async () => {
  const db_name = await getDbName();
  return `${endpoint}/customer_forget_pin/${db_name}/`;
}
