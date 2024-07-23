import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken('pk.eyJ1IjoiZGFuaWxvbWlndWVsMTQ4NSIsImEiOiJjbGZwYzg2ZzQwdW0yM3FwdG91Z3BoZXVtIn0.FOkbq1V7d5cjKTXgyTQVuQ');

const App = () => {

  const { width, height } = Dimensions.get('window');

  return (
    <View style={[styles.page, {width, height}]}>
        <Mapbox.MapView style={styles.map} />
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  page: {
    flex: 1,

  },
 
  map: {
    flex: 1
  }
});