import { View, Text } from 'react-native'
import React from 'react';
import HomeScreen from '../../src/screens/HomeScreen';
import FingerPopup from '../../src/screens/FingerPopup';

const home = () => {
  return (
    <>
      <HomeScreen/>
      <FingerPopup/>
    </>
  )
}

export default home