import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Image,
  ScrollView,
  Keyboard
} from "react-native";
import { MaterialIcons, FontAwesome, Entypo } from "@expo/vector-icons";
import Logos from "../../assets/images/Atom_walk_logo.jpg";
import { useRouter } from "expo-router";
import { loginURL, userLoginURL } from "../../src/services/ConstantServices";
import axios from "axios"; // If you prefer axios for API calls
import { getCompanyInfo, getDBListInfo } from "../../src/services/authServices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  authAxiosPost,
  publicAxiosRequest,
} from "../../src/services/HttpMethod";
import { customerLogin } from "../../src/services/productServices";
import CompanyDropdown from "../../src/components/CompanyDropdown";
import { colors } from "../../src/Styles/appStyle";
import { LinearGradient } from "expo-linear-gradient";


const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scaleWidth = (size) => (width / 375) * size;
const scaleHeight = (size) => (height / 812) * size;



const LoginScreen = () => {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState("");
  const [pin, setPin] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userPin, setUserPin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companyError, setCompanyError] = useState("");
  const [dbList, setDbList] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [keyboardStatus, setKeyboardStatus] = useState(false);
  const isLoginDisabled = !mobileNumber || !pin;

  useEffect(() => {
    const fetchUserPin = async () => {
      try {
        const storedPin = await AsyncStorage.getItem("userPin");
        setUserPin(storedPin);
      } catch (error) {
        console.error("Error fetching userPin from AsyncStorage:", error);
      }
    };
    fetchUserPin();
  }, []);

    useEffect(() => {
  const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardStatus(true)
  );
  const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardStatus(false)
  );

  return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
  };
}, []);

  useEffect(() => {
    fetchDbName();
  }, []);

  useEffect(() => {
    if (selectedCompany && dbList.length > 0) {
      const company = dbList.find(
        (c) => c.ref_cust_name === selectedCompany.ref_cust_name
      );
      if (company) {
        const dbName = company.name.replace("SD_", "");
        AsyncStorage.setItem("dbName", dbName);
      }
    }
  }, [selectedCompany, dbList]);

  const fetchDbName = async () => {
    try {
      const DBData = await getDBListInfo();
      setDbList(DBData.data || []);

      if (DBData.data?.length === 1) {
        const company = DBData.data[0];
        setSelectedCompany({
          label: company.ref_cust_name,
          value: company.ref_cust_name,
        });
      }
    } catch (error) {
      console.error("Error fetching DB List:", error);
    }
  };

  const handleCompanyChange = async (item) => {
    if (item) {
      setSelectedCompany(item);
      const selected = dbList.find(
        (company) => company.ref_cust_name === item.value
      );
      if (selected) {
        const dbName = selected.name.replace("SD_", "");
        await AsyncStorage.setItem("dbName", dbName);
      }
    }
    setCompanyError("");
  };

  // const getDropdownValue = () => {
  // if (!selectedCompany) return null;
  // return {
  //   label: selectedCompany.ref_cust_name,
  //   value: selectedCompany.ref_cust_name
  // };
  // };

  const validateInput = () => {
    if (!selectedCompany) {
      setCompanyError("Please select your company");
      return false;
    }
    if (!mobileNumber) {
      setErrorMessage("Mobile number is required");
      return false;
    }
    if (!pin) {
      setErrorMessage("PIN is required");
      return false;
    }
    if (pin.length < 4) {
      setErrorMessage("PIN must be at least 4 characters long");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handlePressPassword = () => {
    router.push({
      pathname: "PinScreen",
    });
  };

  const handlePress = async () => {
    if (!validateInput()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        mobile_number: mobileNumber,
        pin: parseInt(pin),
      };
      const response = await customerLogin(payload);
      if (response.status === 200) {
        AsyncStorage.setItem("userPin", pin);
        AsyncStorage.setItem("mobileNumber", mobileNumber);
        const userToken = response.data?.token;
        const Customer_id = response.data?.customer_id;
        await AsyncStorage.setItem("Customer_id", Customer_id.toString());
        await AsyncStorage.setItem("userToken", userToken);
        router.push("/home");
      } else {
        setErrorMessage("Invalid User id or Password");
      }
    } catch (error) {
      console.log("API call error:", error.response?.data || error.message);
      if (error.response) {
        setErrorMessage(
          `Error: ${error.response.data.error || "Invalid credentials"}`
        );
      } else if (error.request) {
        setErrorMessage(
          "No response from the server. Please check your connection."
        );
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaContainer>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Container>
        <Header style={styles.headerContainer}>
          <LinearGradient
            colors={[colors.primary, "#feb3b3"]}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.headerGradient}
          >
            <View style={styles.headerTop}>
              <View style={styles.logoContainer}>
                {Logos ? (
                  <Image source={Logos} style={styles.logo} />
                ) : (
                  <View style={styles.companyPlaceholder}>
                    <MaterialIcons
                      name="business"
                      size={scaleWidth(40)}
                      color="#fff"
                    />
                  </View>
                )}
              </View>
              {/* {profileName && (
                <WelcomeContainer>
                  <GreetingText>Welcome back,</GreetingText>
                  <UserNameText>{profileName}</UserNameText>
                </WelcomeContainer>
              )} */}
            </View>
          </LinearGradient>
        </Header>
        <MainContent keyboardStatus={keyboardStatus}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Content>
              <Card>
                <Title>Login</Title>

                <InputContainer>
                  {dbList.length > 0 && (
                    <CompanyDropdown
                      label="Company"
                      data={dbList.map((company) => ({
                        label: company.ref_cust_name,
                        value: company.ref_cust_name,
                      }))}
                      value={selectedCompany}
                      setValue={handleCompanyChange}
                      error={companyError}
                    />
                  )}

                  <InputLabel>Enter your Mobile number</InputLabel>
                  <InputWrapper>
                    <MaterialIcons name="person" size={20} color="#6c757d" />
                    <Input
                      placeholder="Mobile number"
                      value={mobileNumber}
                      onChangeText={setMobileNumber}
                      keyboardType="numeric" // Changed to default to allow both numbers and text
                      placeholderTextColor="#6c757d"
                      maxLength={10} // Increased max length for employee IDs
                    />
                  </InputWrapper>

                  <InputLabel>Enter your PIN (min 4 digits)</InputLabel>
                  <InputWrapper>
                    <MaterialIcons
                      name="lock-outline"
                      size={20}
                      color="#6c757d"
                    />
                    <Input
                      placeholder="Enter your PIN"
                      value={pin}
                      onChangeText={setPin}
                      secureTextEntry={!isPasswordVisible}
                      keyboardType="numeric"
                      placeholderTextColor="#6c757d"
                      maxLength={10} 
                    />
                    <TouchableOpacity
                      onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                      <MaterialIcons
                        name={
                          isPasswordVisible ? "visibility" : "visibility-off"
                        }
                        size={20}
                        color="#6c757d"
                      />
                    </TouchableOpacity>
                  </InputWrapper>

                  {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}

                  <LoginButton
                    onPress={handlePress}
                    disabled={isLoginDisabled}
                    style={{
                      backgroundColor: isLoginDisabled ? "#fff" : "#0062cc",
                    }}
                  >
                    <LoginButtonText
                      style={{ color: isLoginDisabled ? "#3333" : "#fff" }}
                    >
                      LOGIN
                    </LoginButtonText>
                  </LoginButton>
                </InputContainer>
              </Card>

              {userPin && (
                <AlternativeLogin onPress={handlePressPassword}>
                  <FingerprintIcon>
                    <Entypo
                      name="fingerprint"
                      size={scaleWidth(24)}
                      color="#fff"
                    />
                  </FingerprintIcon>
                  <AlternativeLoginText>
                    Login with PIN/Fingerprint
                  </AlternativeLoginText>
                </AlternativeLogin>
              )}
            </Content>
          </ScrollView>
        </MainContent>
        <Footer style={styles.fixedFooter}>
          <FooterText>Version Code: 1.0.8</FooterText>
        </Footer>
      </Container>
    </SafeAreaContainer>
  );
};
// Styled Components (remain the same as in your original code)
const styles = StyleSheet.create({
  headerContainer: {
    overflow: "visible",
    zIndex: 10,
  },
  headerGradient: {
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight + scaleHeight(10)
        : scaleHeight(10),
    paddingHorizontal: scaleWidth(20),
    paddingBottom: scaleHeight(20),
    borderBottomLeftRadius: scaleWidth(30),
    borderBottomRightRadius: scaleWidth(30),
  },
  headerTop: {
    paddingVertical: scaleHeight(10),
  },
  companySection: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scaleHeight(20),
  },

  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    borderRadius: scaleWidth(10),
    overflow: "hidden",
  },

  logo: {
    width: scaleWidth(150),
    height: scaleHeight(60),
    borderRadius: scaleWidth(10),
    resizeMode: "contain",
    backgroundColor: "#fff",
  },
  companyPlaceholder: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(40),
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    flex: 1,
    position: "relative", // Needed for absolute positioning of footer
  },
  fixedFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: scaleHeight(80), // Add padding to prevent content from being hidden behind footer
  },
  hiddenFooter: {
    display: "none",
  },
  visibleFooter: {
    padding: scaleHeight(15),
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    width: "100%",
  },
});

const SafeAreaContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.primary};
`;

const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
`;

const Header = styled.View`
  background-color: transparent;
`;

const ContentContainer = styled.View`
  flex: 1;
  margin-top: ${scaleHeight(-40)}px;
`;

const Content = styled.View`
  padding: ${scaleWidth(20)}px;
  padding-bottom: ${scaleHeight(80)}px;
`;

const Logo = styled.Image`
  width: ${scaleWidth(150)}px;
  height: ${scaleHeight(60)}px;
  border-radius: ${scaleWidth(10)}px;
  resize-mode: contain;
`;

const Card = styled.View`
  background-color: #fff;
  border-radius: ${scaleWidth(10)}px;
  margin-top: ${scaleHeight(50)}px;
  padding: ${scaleWidth(20)}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const Title = styled.Text`
  font-size: ${scaleWidth(22)}px;
  font-weight: bold;
  color: #333;
  margin-bottom: ${scaleHeight(25)}px;
  text-align: center;
`;

const InputContainer = styled.View`
  width: 100%;
`;

const InputLabel = styled.Text`
  font-size: ${scaleWidth(14)}px;
  color: #666;
  margin-bottom: ${scaleHeight(5)}px;
  font-weight: 500;
`;

const InputWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: ${scaleWidth(5)}px;
  border: 1px solid #ddd;
  margin-bottom: ${scaleHeight(15)}px;
  padding: 0 ${scaleWidth(15)}px;
  height: ${scaleHeight(50)}px;
`;

const Input = styled.TextInput`
  flex: 1;
  color: #333;
  font-size: ${scaleWidth(16)}px;
`;

const EyeButton = styled.TouchableOpacity`
  padding: ${scaleWidth(5)}px;
`;

const ErrorText = styled.Text`
  color: #e74c3c;
  font-size: ${scaleWidth(14)}px;
  margin-bottom: ${scaleHeight(15)}px;
`;

const LoginButton = styled.TouchableOpacity`
  background-color: ${(props) => (props.disabled ? "#fff" : "#0062cc")};
  border: 1px solid rgb(215, 222, 230);
  padding: ${scaleHeight(15)}px;
  border-radius: ${scaleWidth(5)}px;
  align-items: center;
  margin-top: ${scaleHeight(10)}px;
`;

const LoginButtonText = styled.Text`
  color: #fff;
  font-size: ${scaleWidth(16)}px;
  font-weight: bold;
`;

const WelcomeContainer = styled.View`
  margin-bottom: ${scaleHeight(20)}px;
  align-items: center;
`;

const GreetingText = styled.Text`
  color: rgba(255, 255, 255, 0.9);
  font-size: ${scaleWidth(16)}px;
  font-weight: 500;
`;

const UserNameText = styled.Text`
  color: #fff;
  font-size: ${scaleWidth(24)}px;
  font-weight: bold;
  margin-top: ${scaleHeight(3)}px;
`;

const AlternativeLogin = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: ${scaleHeight(30)}px;
`;

const FingerprintIcon = styled.View`
  background-color: ${colors.primary};
  width: ${scaleWidth(40)}px;
  height: ${scaleWidth(40)}px;
  border-radius: ${scaleWidth(20)}px;
  align-items: center;
  justify-content: center;
  margin-right: ${scaleWidth(10)}px;
`;

const AlternativeLoginText = styled.Text`
  color: ${colors.primary};
  font-size: ${scaleWidth(16)}px;
  font-weight: 500;
`;
const MainContent = styled.View`
  flex: 1;
  margin-bottom: ${(props) => (props.keyboardStatus ? 0 : scaleHeight(60))}px;
`;
const Footer = styled.View`
  padding: ${scaleHeight(10)}px;
  align-items: center;
  justify-content: center;
  border-top-width: 1px;
  border-top-color: #eee;
  background-color: #fff;
  width: 100%;
`;

const FooterText = styled.Text`
  color: ${colors.black};
  font-size: ${scaleWidth(14)}px;
  font-weight: 500;
`;

export default LoginScreen;
