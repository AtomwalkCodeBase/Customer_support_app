import AsyncStorage from "@react-native-async-storage/async-storage";
import { addEmpLeave, addClaim, getEmpClaimdata, getExpenseItemList, getProjectList, getEmpAttendanceData, getEmpHolidayData, empCheckData, processClaim, getClaimApproverList, userLoginURL, userTaskListURL, getTaskCategoryURL, getTaskURL, addCustomerTicketURL, getCustomerDetailListURL, getCustomerListURL, setUserPinURL, forgetCustomerPinURL } from "./ConstantServices";
import { authAxios, authAxiosFilePost, authAxiosPost, authAxiosPosts, publicAxiosRequest } from "./HttpMethod";


  //Customer Login
export async function customerLogin(payload) {
  const url = await userLoginURL(); 
  let data = payload;
  return authAxiosPosts(url, data);
}


export async function getTaskCategory() { 
  const url = await getTaskCategoryURL();
  return authAxios(url)
}

// export async function getCustomerList() { 
//   const url = await getCustomerListURL();
//   return authAxios(url)
// }

export async function getTasksList(task_type, customer_id) {
  const url = await userTaskListURL();
  let data = {};
  if (task_type){
      data['task_type'] = task_type;
  }
  if (customer_id){
      data['customer_id'] = customer_id;
  }
  return authAxios(url, data)
}


export async function addCustomerTicket(request_data) {
  const url = await addCustomerTicketURL();
  console.log('Data to be sent:', request_data);
  return authAxiosFilePost(url, request_data)
}

export async function getCustomerDetailList(customerId) {
  let data={}
  if(customerId){
    data['customer_id']=customerId;
  }
  const url = await getCustomerDetailListURL();
  return authAxios(url,data);
}


export async function setUserPinView(o_pin, n_pin) {
  const url = await setUserPinURL();
  try {
    const customerId = await AsyncStorage.getItem("Customer_id");
    let customerIdNumber = parseInt(customerId, 10);

    if (isNaN(customerIdNumber)) {
      throw new Error("Invalid Customer ID: " + customerId);
    }

    const effectiveCustomerId = customerIdNumber;

    let data = {
      u_id: effectiveCustomerId,
      o_pin: o_pin,
      n_pin: n_pin,
      user_type: "CUSTOMER",
    };

    // console.log("Sending request to API with data:", data);
    const response = await authAxiosPost(url, data);
    // console.log("API Response:", response);
    return response;
  } catch (error) {
    console.error("Error in setUserPinView:", error.response ? error.response.data : error.message);
    throw error;
  }
}  

  export async function forgetCustomerPinView(data) {
    console.log("Data to be sent--->", data);
    const url = await forgetCustomerPinURL();
    return publicAxiosRequest.post(url, data);
}