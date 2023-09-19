import React,{ useState, useContext, useEffect } from 'react';
import {
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  View,
  StyleSheet,
  ToastAndroid,
  BackHandler
} from 'react-native';
import {AuthContext} from '../../apis/Users';
import UserAvatar from 'react-native-user-avatar';
import Spinner from 'react-native-loading-spinner-overlay';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const {isLoading, login, error} = useContext(AuthContext);

const image = { uri: "https://img.freepik.com/free-vector/abstract-shiny-grey-technology-background_1035-12620.jpg?w=740&t=st=1667419101~exp=1667419701~hmac=3bbdef34e890179fbe282cbbf64169f4f1d670dcc98086340713541f09d6ac23" };

useEffect(() => {
  const disableBackButton = () => {
    // Disable the default behavior of the back button
    return true;
  };

  // Add a listener for the back button press event
  BackHandler.addEventListener('hardwareBackPress', disableBackButton);

  // Clean up the listener when the component unmounts
  return () => {
    BackHandler.removeEventListener('hardwareBackPress', disableBackButton);
  };
}, []); // Add isFocused as a dependency




  return (
    <View style={styles.container}>
    <Spinner visible={isLoading} />
     <ImageBackground source={image} resizeMode="cover" style={styles.image}>
      <UserAvatar size={200} style={styles.avatar}  src="https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png" />
      <View style={styles.wrapper}>
      {error ? (
        <Text style={{ color: 'red', fontSize: 18, textAlign: 'center' }}>
          {error}
        </Text>
      ) : null}
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={text => setEmail(text)}
          label='Email'
          placeholder='example@email.com'
          autoCapitalize='none'
        />

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={text => setPassword(text)}
          label='Password'
          placeholder='********'
          autoCapitalize='none'
          secureTextEntry
        />

        <Button
          title="Login"
          onPress={() => {
            if(email && password){
              login(email, password, navigation);
              setEmail('');
              setPassword('');
            } else {
              ToastAndroid.show("Les champs email et mot de passe sont obligatoires", ToastAndroid.LONG)
            }
          }}
        />

        <View style={{flexDirection: 'row', marginTop: 20}}>
          <Text>Don't have an account? </Text>
          <TouchableOpacity style={styles.button}onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
    
  },
  image: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'center',
  },
  wrapper: {
    width: '80%',
  
  },
  avatar:{
    marginBottom:37,
    backgroundColor:'white',
  },
  input: {
    marginBottom: 12,
    padding:5,
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
  }
});

export default LoginScreen;
