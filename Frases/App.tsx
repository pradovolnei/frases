import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { BannerAdSize, AppOpenAd, RewardedAdEventType, InterstitialAd, RewardedAd, BannerAd, TestIds } from 'react-native-google-mobile-ads';


const API_BASE_URL = 'http://192.168.254.66/projetos/frases/api/';

const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-4973308715139947/5584042430';

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['fashion', 'clothing'],
});

const App = () => {
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [fraseTexto, setFraseTexto] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [idFrase, setIdFrase] = useState(0);

  useEffect(() => {
    // Carregar as categorias ao abrir a tela
    fetchCategorias();
    fetchFraseTexto(selectedCategoria);
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categorias.php`);
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const fetchFraseTexto = async (categoriaId) => {
    try {
      let url = `${API_BASE_URL}/frases.php`;
      if (categoriaId && idFrase == 0) {
        url += `?cat=${categoriaId}`;
      }

      if(idFrase !== 0){
        url += `?id=${idFrase}`;
      }
      
      const response = await axios.get(url);
      if (response.data.length === 0) {
        Alert.alert('Nenhuma frase encontrada para esta categoria.');
      } else {
        setFraseTexto(response.data[0].texto);
      }
    } catch (error) {
      console.error('Erro ao carregar frase:', error);
    }
  };

  const handlePickerChange = (itemValue) => {
    setSelectedCategoria(itemValue);
  };

  const handleLoadFrasePress = () => {
    fetchFraseTexto(selectedCategoria);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontFamily: 'monospace', marginBottom: 50 }}>
          Frases
        </Text>
        <Picker
          selectedValue={selectedCategoria}
          onValueChange={handlePickerChange}
          style={{ width: 200 }}>
          <Picker.Item label="Escolha uma categoria" value="" />
          {categorias.map((categoria) => (
            <Picker.Item
              key={categoria.id}
              label={categoria.categoria}
              value={categoria.id}
            />
          ))}
        </Picker>
        <TouchableOpacity
          style={{
            marginTop: 20,
            backgroundColor: '#007bff',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
            flexDirection: 'row', // Para alinhar o ícone ao lado do texto
            alignItems: 'center', // Para centralizar o conteúdo verticalmente
          }}
          onPress={handleLoadFrasePress}>
          <Image
            source={require('./img/movie.png')}
            style={{
              width: 24,
              height: 24,
              marginRight: 8, // Espaçamento entre o ícone e o texto
            }}
          />
          <Text style={{ color: '#fff' }}>Carregar Frase</Text>
        </TouchableOpacity>
        {fraseTexto ? (
          <Text style={{ marginTop: 20, fontSize: 16 }}>
            Frase: {fraseTexto}
          </Text>
        ) : null}
      </View>
      <BannerAd 
        unitId={adUnitId} 
        size={BannerAdSize.FULL_BANNER}
      />
    </View>
  );
};

export default App;
