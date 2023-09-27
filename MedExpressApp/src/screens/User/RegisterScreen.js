import React, { useContext, useState, useEffect, useRef} from 'react';
import {
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Dimensions,
  BackHandler, 
  Image
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import {AuthContext} from '../../apis/Users.js';
import { useIsFocused } from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import MapView, { Marker } from 'react-native-maps';
import WebView from 'react-native-webview';
import mapTemplate from './map-template';

const image = { uri: "https://img.freepik.com/free-vector/abstract-shiny-grey-technology-background_1035-12620.jpg?w=740&t=st=1667419101~exp=1667419701~hmac=3bbdef34e890179fbe282cbbf64169f4f1d670dcc98086340713541f09d6ac23" };

const RegisterScreen = ({navigation}) => {
  const [username, setUsername] = useState(null); 
  const [firstName, setFirstName] = useState(null); 
  const [lastName, setLastName] = useState(null); 
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmpassword, setConfirmPassword] = useState(null);
  const [roles, setRoles] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [longitude, setLongitude] = useState("0");
  const [lattitude, setLattitude] = useState("0");
  const {isLoading, register, error, getAllRoles, geocodeAddress} = useContext(AuthContext);
  const [selectedCoordinates, setSelectedCoordinates] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [address, setAdress] = useState("");

  const handleCoordinateChange = (coordinate) => {
    setSelectedCoordinates(coordinate);
  };

    const webRef = useRef(null);
  const [placeName, setPlaceName] = useState('');

  const onButtonClick = () => {
    webRef.current.injectJavaScript(`
      const searchBox = document.querySelector('.tmap-searchbox__input');
      if (searchBox) {
        searchBox.value = '${placeName}';
        searchBox.dispatchEvent(new Event('input'));
      }
    `);
  };

  const updateAdress = async (text) => {
    setAdress(text);
    if(text){
      console.log({text})
      const response = await geocodeAddress(text)
      if(response && response.latitude && response.longitude && !isNaN(response.latitude) && !isNaN(response.longitude)){
        console.log({response})
        setLattitude(response.latitude)
        setLongitude(response.longitude)
      } else {
        console.log("check your address")
      }
    }
  }
  
  const isFocused = useIsFocused(); // Get the focus state using the hook

  useEffect(() => {
    if (isFocused) {
      const fetchData = async () => {
        const rolesData = await getAllRoles();
        setRoles(rolesData);
        if(rolesData && rolesData[0]){
          setSelectedRole(rolesData[0])
        }
      };
      fetchData();
    } else {
      setUsername(null); 
      setFirstName(null); 
      setLastName(null); 
      setEmail(null);
      setPassword(null);
      setConfirmPassword(null);
      setRoles(null);
      setSelectedRole(null);
      setLongitude("0");
      setLattitude("0");
    }

    const disableBackButton = () => {
      return true;
    };

    // Add a listener for the back button press event
    BackHandler.addEventListener('hardwareBackPress', disableBackButton);

    // Clean up the listener when the component unmounts
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', disableBackButton);
    };
  }, [isFocused]); // Add isFocused as a dependency

  useEffect(() => {
    // Perform map-related operations here
  }, []); // Empty 

  return (
    <ScrollView style={styles.scrollView}>
    <View style={styles.container}>
      <Spinner visible={isLoading} />
      {/* <ImageBackground source={image} resizeMode="cover" style={styles.image}> */}
      {/* <Text style={styles.title}>Sing Up</Text> */}
      <Image source={require('../../assets/logo.jpeg')} style={styles.image} />

      <View style={styles.wrapper}>
      <TextInput
          style={styles.input}
          value={username}
          placeholder="Enter username"
          onChangeText={text => setUsername(text)}
        />

      <TextInput
          style={styles.input}
          value={firstName}
          placeholder="Enter firstName"
          onChangeText={text => setFirstName(text)}
        />
        <TextInput
          style={styles.input}
          value={lastName}
          placeholder="Enter lastName"
          onChangeText={text => setLastName(text)}
        />

        <TextInput
          style={styles.input}
          value={email}
          placeholder="Enter email"
          onChangeText={text => setEmail(text)}
        />

        <TextInput
          style={styles.input}
          value={password}
          placeholder="Enter password"
          onChangeText={text => setPassword(text)}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          value={confirmpassword}
          placeholder="confirmer password"
          onChangeText={text => setConfirmPassword(text)}
          secureTextEntry
        />

        <View style={styles.input}>
          <Picker
            style={styles.input}
            selectedValue={selectedRole}
            onValueChange={(itemValue, itemIndex) =>{
              console.log({itemValue})
              setSelectedRole(itemValue)
            }
              
            }>
              {
                roles && roles.length ? roles.map((item) => <Picker.Item label={item.name} key={item._id} value={item._id} />) : 
                <Picker.Item label="admin" value={"admin"} />
              }
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          value={lattitude}
          placeholder="Lattitude"
          onChangeText={text => setLattitude(text)}
          keyboardType='numeric'
        />
        
        <TextInput
          style={styles.input}
          value={longitude}
          placeholder="Longitude"
          onChangeText={text => setLongitude(text)}
          keyboardType='numeric'
        /> 

        <TextInput
          style={styles.input}
          value={address}
          placeholder="Entrer ton addresse"
          onChangeText={text => updateAdress(text)}
        /> 


         <View style={styles.mapContainer}>
          {/* <MapView
            style={styles.map}
            initialRegion={{
              latitude: 48.856614,
              longitude: 2.3522219,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            // customMapStyle={mapStyle}
            >
            <Marker
              draggable
              coordinate={{
                latitude: 48.856614,
                longitude: 2.3522219,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              onDragEnd={
                (e) => alert(JSON.stringify(e.nativeEvent.coordinate))
              }
              title={'Test Marker'}
              description={'This is a description of the marker'}
            />
          </MapView> */}
          <WebView
            ref={webRef}
            style={styles.map}
            originWhitelist={['*']}
            source={{ html: mapTemplate }}
          /> 
        </View>

        <View style={{}}>
          <Button
            title="Register"
            onPress={() => {
              register(username, firstName, lastName, email, password, confirmpassword, selectedRole, gpsPostion={lattitude, longitude}, navigation);
            }}
          />

          <View style={{flexDirection: 'row'}}>
            <Text>Already have an accoutn? </Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* </ImageBackground> */}
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({ 
  scrollView: {
    flexgrow: 1,
    backgroundColor: 'white'

  },
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height + Dimensions.get('window').height*0.8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'

  },
  image: {
    width: Dimensions.get('window').width - Dimensions.get('window').width *0.2,
    height: Dimensions.get('window').height / 3,
  },
  title:{
    fontSize:30,
    fontWeight:'bold',
    paddingBottom:40,
    fontFamily:'sans-serif-condensed'
  },
  wrapper: {
    width: '80%',
  },
  input: {
    padding:5,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  link: {
    color: 'blue',
  },
  button:{
    marginLeft:10,
  },
  
  mapContainer: {
    width: Dimensions.get('window').width - Dimensions.get('window').width *0.2,
    height: 300
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    marginBottom: 20
  }
});

const mapStyle = [
  {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{color: '#263c3f'}],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{color: '#6b9a76'}],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{color: '#38414e'}],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{color: '#212a37'}],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{color: '#9ca5b3'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{color: '#746855'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{color: '#1f2835'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{color: '#f3d19c'}],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{color: '#2f3948'}],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#17263c'}],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{color: '#515c6d'}],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{color: '#17263c'}],
  },
];
export default RegisterScreen;
// import React from 'react';
// import { StyleSheet, View } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';

// const MapScreen = () => {
//   return (
//     <View style={styles.container}>
//       <MapView
//         style={styles.map}
//         initialRegion={{
//           latitude: 37.78825,
//           longitude: -122.4324,
//           latitudeDelta: 0.0922,
//           longitudeDelta: 0.0421,
//         }}
//       >
//         <Marker
//           coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
//           title="Marker Title"
//           description="Marker Description"
//         />
//       </MapView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
// });

// export default MapScreen;


// import React, { useState, useRef } from 'react';
// import { StyleSheet, View, Button, TextInput } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import { WebView } from 'react-native-webview';
// import mapTemplate from './map-template';

// export default function App() {
//   const webRef = useRef(null);
//   const [placeName, setPlaceName] = useState('');

//   // const onButtonClick = () => {
//   //   webRef.current.injectJavaScript(`
//   //     const searchBox = document.querySelector('.tmap-searchbox__input');
//   //     if (searchBox) {
//   //       searchBox.value = '${placeName}';
//   //       searchBox.dispatchEvent(new Event('input'));
//   //     }
//   //   `);
//   // };

//   return (
//     <View style={styles.container}>
//       <View style={styles.buttons}>
//         {/* <TextInput
//           style={styles.textInput}
//           onChangeText={setPlaceName}
//           value={placeName}
//           placeholder="Enter a place name"
//         /> */}
//         {/* <Button title="Search Place" onPress={onButtonClick} /> */}
//       </View>
//           <MapView
//         style={styles.map}
//          initialRegion={{
//            latitude: 37.78825,
//            longitude: -122.4324,
//            latitudeDelta: 0.0922,
//           longitudeDelta: 0.0421,
//         }}
//        >
//         <Marker
//            coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
//            title="Marker Title"
//            description="Marker Description"
//         />
//        </MapView>
//       {/* <WebView
//         ref={webRef}
//         style={styles.map}
//         originWhitelist={['*']}
//         source={{ html: mapTemplate }}
//       /> */}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   buttons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 10,
//   },
//   textInput: {
//     flex: 1,
//     marginRight: 10,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 5,
//   },
//   map: {
//     flex: 1,
//   },
// });