import React, { useLayoutEffect, useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../../apis/Users';

const UserScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [selectedUser, setSelectedUser] = useState(item);

  const { userInfo, verifyUserAccount } = useContext(AuthContext);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
        setSelectedUser(item)
    } else {
        setSelectedUser({})
    }
  }, [isFocused]);

  updateUserStatus = async (email, response) => {
    setSelectedUser(await verifyUserAccount(email, response))
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.navigate('Home')} />
      ),
      headerShown: true,
      drawerEnabled: false,
    });
  }, [navigation]);

  const renderButtonGroup = () => {
    if (selectedUser.status === 'pending') {
      return (
        <View style={styles.bottomButtons}>
          <Button title="Accept" onPress={() => updateUserStatus(selectedUser.email, "accepted")} />
          <Button title="Refuse" onPress={() => updateUserStatus(selectedUser.email, "refused")} />
        </View>
      );
    } else {
      return (
        <View style={styles.bottomButtonsEnableOrDisable}>
            {selectedUser.status === 'refused'?  
            <Button title="Enable" onPress={() => updateUserStatus(selectedUser.email, "accepted")} />:
            <Button title="Disable" onPress={() => updateUserStatus(selectedUser.email, "refused")} />
            }
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Text style={styles.heading}>User Details</Text>
        <Text style={styles.userInfo}>Username: {selectedUser.username}</Text>
        <Text style={styles.userInfo}>First Name: {selectedUser.firstName}</Text>
        <Text style={styles.userInfo}>Last Name: {selectedUser.lastName}</Text>
        <Text style={styles.userInfo}>Status: {selectedUser.status}</Text>
        <Text style={styles.userInfo}>Role: {selectedUser.roleName}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Change Password" onPress={() => console.log('Change Password pressed')} />
        {renderButtonGroup()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  profileContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userInfo: {
    marginBottom: 5,
  },
  buttonContainer: {
    // justifyContent: 'space-between',
    padding: 30,
  },
  bottomButtons: {
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  bottomButtonsEnableOrDisable: {
    paddingTop: 30,
  },
});

export default UserScreen;
