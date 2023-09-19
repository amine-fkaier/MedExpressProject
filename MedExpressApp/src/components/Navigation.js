import React, { useContext, useEffect } from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import NewOrderScreen from '../screens/Orders/NewOrderScreen';
import {
  View, TouchableOpacity
} from 'react-native';
import HomeScreen from '../screens/Home/HomeScreen';
import LoginScreen from '../screens/User/LoginScreen';
import SplashScreen from '../screens/Home/SplashScreen';
import RegisterScreen from '../screens/User/RegisterScreen';
import DrawerContent from '../components/DrawerContent';
import { AuthContext } from '../apis/Users.js';
import MyOrders from '../screens/Orders/MyOrders';
import ProfileScreen from '../screens/User/Profile';
import { Text } from 'react-native-paper';
import OrderDetailsScreen from '../screens/Orders/OrderDetails';
import NotifsScreen from '../screens/Home/NotifsScreen';
import UserScreen from '../screens/User/UserDetails';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // Import your desired icon library


// const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();


// const MainStack = () => (
//   <Stack.Navigator>
//     <Stack.Screen 
//       name="Splash" 
//       component={SplashScreen} 
//       options={{headerShown: false }} 
//     />
//     <Stack.Screen
//       name="Login"
//       component={LoginScreen}
//       options={{ headerShown: false }}
//     />
//     <Stack.Screen
//       name="Register"
//       component={RegisterScreen}
//       options={{ headerShown: false }}
//     />

//     <Stack.Screen
//       name="Home"
//       component={HomeScreen}
//       options={{ headerShown: false }}
//     />

//   </Stack.Navigator>
// );

const CustomNotificationIcon = ({ navigation }) => (
  <TouchableOpacity onPress={() => navigation.navigate('Notifs')} style={{padding: 15}}>
    <FontAwesome name="bell" size={25} />
  </TouchableOpacity>
);

const DrawerNavigator = () => {
  return (
       <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />}>
            <Drawer.Screen 
              name="Splash" 
              component={SplashScreen} 
              options={{headerShown: false, hidden: true}} 
            />
            <Drawer.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false, hidden: true}}
            />
            <Drawer.Screen
              name="Register"
              component={RegisterScreen}
              options={{headerShown: false, hidden: true}}
            />
            <Drawer.Screen
              name="Home"
              component={HomeScreen}
              options={({ navigation }) => ({
                title: 'Accueil',
                headerRight: () => <CustomNotificationIcon navigation={navigation} />
              })}
            />
            <Drawer.Screen
              name="Notifs"
              component={NotifsScreen}
              options={{ title: 'Notifications' }}
            />
            <Drawer.Screen
              name="NewOrder"
              component={NewOrderScreen}
              options={{ title: 'Nouvelle commande' }}
            />
            <Drawer.Screen
              name="MyOrders"
              component={MyOrders}
              options={{ title: 'Mes commandes' }}
            />
            <Drawer.Screen
              name="MyProfile"
              component={ProfileScreen}
              options={{ title: 'Mon profil' }}
            />
            <Drawer.Screen
              name="OrderDetails"
              component={OrderDetailsScreen}
              options={{ title: 'Détails Commande', hidden: true}}
            />
            <Drawer.Screen
              name="UserScreen"
              component={UserScreen}
              options={{headerShown: false, hidden: true}}
            /> 
         </Drawer.Navigator>
  );
};

export default DrawerNavigator;
