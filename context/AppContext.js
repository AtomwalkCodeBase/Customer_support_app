// src/context/AppContext.js
import React, { createContext, useState, useEffect } from 'react';
import { publicAxiosRequest } from "../src/services/HttpMethod";
import { loginURL } from "../src/services/ConstantServices";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getCompanyInfo} from '../src/services/authServices'
import { Alert } from 'react-native'
import axios from "axios";
import { useRouter } from 'expo-router';

// import { useRoute } from '@react-navigation/native';

// Create the context
const AppContext = createContext();

// Create a provider component
const AppProvider = ({ children }) => {
    const [state, setState] = useState("datass");
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [dbName, setDbName] = useState(null);
    const [error, setError] = useState('');
    const [refs,setRefs]=useState(1);
    const router=useRouter();

    const login = async(username, password) => {
        setIsLoading(true);
        let isError = false;

        if (!username.includes("@")) {
            try {
              // First API call to get the username if it's not an email
              const userDetailResponse = await axios.get(
                `https://www.atomwalk.com/api/get_user_detail/?user_id=${username}`
              );
      
              username = userDetailResponse.data.username;
      
              // if (userDetailResponse.status === 200) {
              //   finalUsername = userDetailResponse.data.username;
              // } else {
              //   handleError("User not found for nick name");
              //   return;
              // }
            } catch (error) {
            //   console.log("Error fetching username:", error);
              Alert.alert(
                '❌ User not found for nick name', // Adding a cross icon using emoji
                '', // Empty message (if needed)
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                { cancelable: true }
              );
              // handleError("Failed to retrieve user details");
              isError = true
              setIsLoading(false);
              return
            
            }
        }
        // console.log(username, loginURL);
        try {
            const res = await publicAxiosRequest.post(loginURL, {
                username: username,
                password: password,
            });
            const userToken = res.data['key']
            console.log('After call', res.data, userToken)
            AsyncStorage.setItem('userToken', userToken);
            AsyncStorage.setItem('Password', password);
            AsyncStorage.setItem('username', username);
            setUserToken(userToken)
            setError('')
            router.replace({pathname: 'home' });
            // console.log('TOKEN', getData())
        } catch (err) {
            isError = true
            // console.log('Login', err)
            setError(`Unable to Authenticate : ${err}`)
            Alert.alert(
                '❌ Incorrect E-mail ID or password', // Adding a cross icon using emoji
                '', // Empty message (if needed)
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                { cancelable: true }
              );
        }

        if (!isError){
            getCompanyInfo().then((res) => {
                let comanyInfo = res.data; 
                AsyncStorage.setItem('companyInfo', JSON.stringify(comanyInfo));
                let db_name = comanyInfo.db_name.substr(3)
                AsyncStorage.setItem('dbName', db_name);
                setCompanyInfo(comanyInfo);
                setDbName(db_name);
                // console.log(res.data.db_name, db_name);  
                
            })
            .catch((error) => {
                    console.log('ERROR', {error}, error.message);
            });
        }
        
        setIsLoading(false);
    }

    const logout = () => {
        setIsLoading(true);
        AsyncStorage.removeItem('userToken');
        AsyncStorage.removeItem('companyInfo');
        AsyncStorage.removeItem('dbName');
        
        setUserToken(null);
        setCompanyInfo([]);
        setDbName(null);
        setIsLoading(false);
        setError('')
        router.replace('AuthScreen')
    }


  const isLoggedIn = async() => {
    try {
        setIsLoading(true);
        let userToken = await AsyncStorage.getItem('userToken');
        setUserToken(userToken);
            
        let dbName = await AsyncStorage.getItem('dbName');
        setDbName(dbName);
        
        let companyInfo = await AsyncStorage.getItem('companyInfo');
        
        companyInfo = JSON.parse(companyInfo);
        // console.log('isLoggedin',companyInfo);
        if (companyInfo){
            setCompanyInfo(companyInfo);
        }
        setError('');
        setIsLoading(false);
    } catch (e) {
        console.log(`Logged In Error ${e}`);
        setError(`Logged In Error ${e}`)
    }
}

useEffect( () => {
    isLoggedIn();
}, []);

  return (
    <AppContext.Provider value={{ state, login, logout, isLoading, userToken, companyInfo, dbName, error,setRefs,refs }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };