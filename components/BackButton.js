import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native';

export default ({ onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      elevation: 6,
      zIndex: 1000,
      position: 'absolute',
      backgroundColor: '#00AEF0',
      height: 60,
      width: 60,
      right: 30,
      bottom: 300,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Icon name={'search'} size={30} color="white" />
  </TouchableOpacity>
);