import React, { useState, useLayoutEffect, useContext, useEffect } from 'react';
import { View, Text, Button, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions, ToastAndroid} from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PatientContext } from '../../apis/patients';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import { AuthContext } from '../../apis/Users';


const NewOrderScreen = ({ navigation }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [nearestPharmacies, setNearestPharmacies] = useState([]);
  const {addOrder, getNearestPharmacies} = useContext(PatientContext);
  const {userInfo} = useContext(AuthContext);
  const isFocused = useIsFocused(); 


  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.navigate("MyOrders")} />
      ),
      headerShown: true,
      drawerEnabled: false,
    });
  }, [navigation]);

  useEffect(() => {
    if (!isFocused) {
      reset()
    } 
    if(isFocused){
      const fetchData = async () => {
        try {
          console.log({userInfo})

          if(userInfo && userInfo.user.role === "patient"){
            const repsonse = await getNearestPharmacies(userInfo.user.userId)
            console.log({repsonse})
            setNearestPharmacies(repsonse.data || [])
          }
        } catch (error) {
          // Handle error if AsyncStorage or getMyOrders fails
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }
   
  }, [isFocused]);


  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        if(imageUri){
          setSelectedImages([...selectedImages, imageUri]);
        }
      }
    });
  };

  const handleCameraLaunch = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };
  
    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        console.log('Camera Error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        if(imageUri) {
          setSelectedImages([...selectedImages, imageUri]);
        }
      }
    });
  };

  const handleImageDelete = (index) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);
  };

  const handleSubmit = async () => {
    console.log({selectedImages, selectedPharmacy})
    if(selectedPharmacy){
      if(selectedImages && selectedImages.length){
        addOrder(userInfo.user.userId, selectedImages, selectedPharmacy, navigation)
      } else {
        ToastAndroid.show("Il faut ajouter un ou plusieurs ordonnaces", ToastAndroid.LONG)
      }
    } else {
      ToastAndroid.show("Il faut selectionner une pharmacie", ToastAndroid.LONG)
    }
 
  };

  const reset = () => {
    setSelectedImages([])
  };

  return (
    <View style={styles.container}>
      <View style={styles.addPrescription}>
        <Text style={styles.titleText}>Ajouter une ordonnance:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {selectedImages.map((imageUri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.selectedImage} />
              <TouchableOpacity onPress={() => handleImageDelete(index)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <View style={styles.cameraButtonsContainer}>
          <TouchableOpacity style={styles.cameraButton} onPress={openImagePicker}>
            <Text style={styles.cameraButtonText}>Choisir une image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton} onPress={handleCameraLaunch}>
            <Text style={styles.cameraButtonText}>Prendre une photo</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.pickerView}>
          <Picker
            style={styles.picker}
            selectedValue={selectedPharmacy}
            onValueChange={(itemValue, itemIndex) => setSelectedPharmacy(itemValue)}
          >
            {nearestPharmacies.map((item)=> <Picker.Item key={item._id} label={item.username} value={item._id} />)}
          </Picker>
        </View>
      </View>
      <View style={styles.orderButtonView}>
        <Button title="Annuler Commande" onPress={reset} />
        <Button title="Passer Commande" onPress={handleSubmit} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  addPrescription: {
    backgroundColor: '#F4F1F1',
    borderColor: 'black',
    padding: 5,
    margin: 10,
    borderRadius: 5,
    height: Dimensions.get("window").height * 0.75,
  },
  titleText: {
    fontSize: 20,
    paddingBottom: 20,
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  selectedImage: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 5,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
  },
  cameraButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderButtonView: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  picker: {
    width: 200,
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 20,
  },
  cameraButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  cameraButtonText: {
    color: 'white',
  },
});

export default NewOrderScreen;


