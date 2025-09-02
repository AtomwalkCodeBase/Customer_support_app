import React, { createContext, useState, useEffect } from 'react';
import { publicAxiosRequest } from "../src/services/HttpMethod";
// import { customerLogin } from "../src/services/ConstantServies";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCompanyInfo } from '../src/services/authServices';
import { useRouter } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import NetworkErrorModal from '../src/components/NetworkErrorModal';
import { customerLogin, getCustomerDetailList } from '../src/services/productServices';
import { userLoginURL } from '../src/services/ConstantServices';

const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [dbName, setDbName] = useState(null);
    const [isConnected, setIsConnected] = useState(true);
    const [profile, setProfile] = useState({});
    const [isError, setIsError] = useState({ visible: false, message: "" });

    const router = useRouter();

    const checkNetwork = async () => {
        const netState = await NetInfo.fetch();
        setIsConnected(netState.isConnected);
        return netState.isConnected;
    };

    const onRetry = async () => {
        const networkStatus = await checkNetwork();
        if (networkStatus) {
            setIsConnected(true);
        }
    };
    
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    const login = async (username, password, dbName) => {
        setIsLoading(true);
        setIsError({visible: false, message: null});

        if (!isConnected) {
            setIsLoading(false);
            setIsError({visible: true, message: 'No internet connection. Please check your network.'});
            return;
        }

        try {
            // Update dbName if provided
            if (dbName) {
                await AsyncStorage.multiSet([
                    ['dbName', dbName],
                    ['previousDbName', dbName]
                ]);
                setDbName(dbName);
            }

            // Determine if the input is a mobile number (10 digits) or employee ID
            // const isMobileNumber = /^\d{10}$/.test(username);

            const payload = 
                {
                    mobile_number: username,
                    pin: password,
                }
                // : {
                //     emp_id: username,
                //     pin: password,
                //   };

            // Call login API correctly with payload
            const response = await customerLogin(payload);

            if (response.status === 200) {
                const { token, customer_id } = response.data;
                console.log(response.data);

                // Calculate token expiration date (15 days from now) 
                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 15);
                const expirationDateString = expirationDate.toISOString();

                // Store appropriate identifier based on input type
                await AsyncStorage.setItem('mobileNumber', username);

                // Store token and expiration date
                await AsyncStorage.multiSet([
                    ['userToken', token],
                    ['tokenExpiration', expirationDateString],
                    ['Customer_id', String(customer_id)],
                    ['userPin', password]
                ]);

                try {
                    const companyInfoResponse = await getCompanyInfo();
                    const companyInfo = companyInfoResponse.data;
                    await AsyncStorage.setItem('companyInfo', JSON.stringify(companyInfo));
                    setCompanyInfo(companyInfo);
                } catch (error) {
                    console.error('Error fetching company info:', error.message);
                }

                setUserToken(token); // Update the token in state
                // setReload(true);
                router.replace({ pathname: 'home' });
            } else {
                setIsError({visible: true, message:'Invalid credentials'});
            }
        } catch (error) {
            console.error('API call error:', error.response?.data || error.message);
            if (error.response) {
                if (error.response.data?.error) {
                    const errorMessage = error.response.data.error;

                    // Handle "Wrong Attempt [X]" case
                    const wrongAttemptMatch = errorMessage.match(/Wrong Attempt \[(\d+)\]/);
                    if (wrongAttemptMatch) {
                        const attemptCount = parseInt(wrongAttemptMatch[1]);

                        if (attemptCount >= 6) {
                            setIsError({visible: true ,message:'Your account has been blocked due to too many failed attempts. Please contact support.'});
                            return;
                        } else {
                            setIsError({visible: true,message:`Incorrect PIN. You have ${6 - attemptCount} attempts remaining before your account gets blocked.`});
                            return;
                        }
                    }

                    // Handle other error messages with brackets
                    if (errorMessage.includes('Multiple wrong attempt. Employee login is Inactive now.')) {
                        setIsError({visible: true,message:'Multiple wrong attempts. Your account is now inactive. Please contact respective manager.'});
                    } else {
                        setIsError({visible: true, message :errorMessage});
                    }
                } else {
                    setIsError({visible: true, message: 'Invalid credentials. Please try again.'});
                }
            } else if (error.request) {
                setIsError({visible: true, message: 'No response from the server. Please check your connection.'});
            } else {
                setIsError({visible: true, message: 'An error occurred. Please try again.'});
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);

        try {
            router.replace('PinScreen');
            await AsyncStorage.multiRemove([
                'userToken',
            ]);

            setUserToken(null);
            setProfile({});
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const completLogout = async () => {
        setIsLoading(true);

        try {
            router.replace('AuthScreen');
            await AsyncStorage.multiRemove([
                'userToken', 'Customer_id', 'tokenExpiration', 'dbName', 'userPin', 'profilename', 'userBiometric', 'mobileNumber'
            ]);

            setUserToken(null);
            setProfile({});
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const isLoggedIn = async () => {
        const networkStatus = await checkNetwork();
        if (!networkStatus) {
            return;
        }

        try {
            setIsLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            const Dbname = await AsyncStorage.getItem('dbName');
            if (!userToken && !Dbname) {
                router.replace('AuthScreen');
                return;
            }

            if (!userToken) {
                router.replace('PinScreen'); // You might want to double-check this logic
                return;
            }


            setUserToken(userToken);

            // Retrieve all stored data
            const [
                companyInfo,
                dbName,
                userPin
            ] = await Promise.all([
                AsyncStorage.getItem('companyInfo'),
                AsyncStorage.getItem('dbName'),
                AsyncStorage.getItem('userPin')
            ]);

            if (companyInfo) {
                setCompanyInfo(JSON.parse(companyInfo));
            }
            if (dbName) {
                setDbName(dbName);
            }


            if (userPin) {
                router.replace('PinScreen');
                // return;
            }
        } catch (e) {
            console.error('Login Status Error:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    const fetchCustomerDetails = async () => {
      try {
        setIsLoading(true);
        const customerId = await AsyncStorage.getItem("Customer_id");
        const res = await getCustomerDetailList(customerId);
        const customer = res.data.find(
          (item) => item.id?.toString() === customerId?.toString()
        );
        setProfile(customer || {});
        await AsyncStorage.setItem("profilename", customer.name);
      } catch (error) {
        setIsError({
          visible: true,
          message: "Failed to load Customer Details",
        });
      } finally {
        setIsLoading(false);
                }
            };

    const refreshProfileData = async () => {
        try {
            setIsLoading(true);
        } catch (error) {
            console.error('Failed to refresh data:', error);
        }
    };

    return (
        <AppContext.Provider value={{
            login,
            logout,
            isLoading,
            userToken,
            companyInfo,
            dbName,
            isConnected,
            checkNetwork,
            setIsLoading,
            profile,
            isLoading,
            isError,
            setIsError,
            completLogout,
            refreshProfileData ,
            fetchCustomerDetails     
        }}>
            {children}
            <NetworkErrorModal 
                visible={!isConnected} 
                onRetry={onRetry} 
                onNetworkRestore={() => setIsConnected(true)} 
            />
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };