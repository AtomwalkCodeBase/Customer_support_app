import AsyncStorage from "@react-native-async-storage/async-storage";
import { addEmpLeave, getEmpLeavedata, addClaim, getEmpClaimdata, getExpenseItemList, getProjectList, getEmpAttendanceData, getEmpHolidayData, empCheckData, processClaim, getClaimApproverList, userLoginURL, userTaskListURL, getTaskCategoryURL, getTaskURL, addCustomerTicketURL, getCustomerDetailListURL, getCustomerListURL, setUserPinURL } from "./ConstantServices";
import { authAxios, authAxiosFilePost, authAxiosPost, authAxiosPosts } from "./HttpMethod";

export function getEmpLeave(leave_type , emp_id, year) {
    let data = {};
    if (leave_type ){
        data['leave_type '] = leave_type;
    }
    if (emp_id){
        data['emp_id'] = emp_id;
    }
    if (year){
        data['year'] = year;
    }
  
    // console.log('getUserTasks', task_type, userTaskListURL, data)
    return authAxios(getEmpLeavedata, data)
  }

  // export const login = async (dispatch, username, password) => {
// export function getUserTasks(task_type, customer_id, lead_id) {
//   let data = {};
//   if (task_type){
//       data['task_type'] = task_type;
//   }
//   if (customer_id){
//       data['customer_id'] = customer_id;
//   }
//   if (lead_id){
//       data['lead_id'] = lead_id;
//   }

//   // console.log('getUserTasks', task_type, userTaskListURL, data)
//   return authAxios(userTaskListURL, data)
// }
  
  export function postEmpLeave(leave_type) {
    let data = {};
    if (leave_type) {
      data['leave_data'] = leave_type;
    }
    // console.log('Data to be sent:', data);
    return authAxiosPost(addEmpLeave, data)
  
  }

  export function postClaim(claim_data) {
    let data = {};
    if (claim_data) {
      data = claim_data;
    }
    // console.log('Data to be sent:', claim_data);
    return authAxiosFilePost(addClaim, claim_data)
  }

  export function postClaimAction(claim_type) {
    let data = {};
    if (claim_type) {
      data['claim_data'] = claim_type;
    }
    // console.log('Data to be sent:', data);
    return authAxiosPost(processClaim, data)
  
  }

  export function getClaimApprover() { 
    let data = {};
    return authAxios(getClaimApproverList)
  }

  export function getEmpClaim(res) {
    let data = {
      'call_mode':res
    };
    return authAxios(getEmpClaimdata, data)
  }

  export function getExpenseItem() { 
    return authAxios(getExpenseItemList)
  }

  export function getExpenseProjectList() { 
    return authAxios(getProjectList)
  }

  export function getEmpAttendance(res) {
    let data = {
      'emp_id':res.emp_id,
      'month':res.month,
      'year': res.year
    };
    // console.log('Final response data',data)
    return authAxios(getEmpAttendanceData, data)
  }

  export function getEmpHoliday(res) {
    let data = {
      'year': res.year
    };
    // console.log(data,'Final response data')
    return authAxios(getEmpHolidayData, data)
  }

  export function postCheckIn(checkin_data) {
    let data = {};
    if (checkin_data) {
      data['attendance_data'] = checkin_data;
      // data = checkin_data;
    }
    // console.log('Data to be sent:', data);
    return authAxiosPost(empCheckData, data)
  }

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

export async function getCustomerList() { 
  const url = await getCustomerListURL();
  return authAxios(url)
}

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
    console.log("API Response:", response);
    return response;
  } catch (error) {
    console.error("Error in setUserPinView:", error.response ? error.response.data : error.message);
    throw error;
  }
}  