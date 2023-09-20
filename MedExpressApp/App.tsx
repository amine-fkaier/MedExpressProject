import React, {useRef} from 'react';
import {StatusBar, Text, View,StyleSheet} from 'react-native';
import NavigationComponent from './src/components/Navigation';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import {AuthProvider} from './src/apis/Users';
import { PatientsProvider } from './src/apis/patients';
import { PharmaciesProvider } from './src/apis/Pharmacies';
import { DeliveryPersonsProvider } from './src/apis/DeliveryPersons';

const App = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <PatientsProvider>
          <PharmaciesProvider>
            <DeliveryPersonsProvider>
              <StatusBar backgroundColor="#06bcee" />
              <PaperProvider>
                <NavigationComponent />
              </PaperProvider>
            </DeliveryPersonsProvider>
          </PharmaciesProvider>
        </PatientsProvider>
      </AuthProvider>
    </NavigationContainer>
  );
};

export default App;
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center', 
  },
});
