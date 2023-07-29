import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { BannerAdSize, AppOpenAd, RewardedAdEventType, InterstitialAd, RewardedAd, BannerAd, TestIds } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_BASE_URL = 'https://volneiapi.entrar.site/';

const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-4973308715139947/5584042430';
const adUnitIdReward = __DEV__ ? TestIds.REWARDED  : 'ca-app-pub-4973308715139947/6465432151';

const rewarded = RewardedAd.createForAdRequest(adUnitIdReward, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['fashion', 'clothing'],
});

const App = () => {
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState('0');
  const [fraseTexto, setFraseTexto] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [idFrase, setIdFrase] = useState(0);
  const [dataAtual, setDataAtual] = useState('');

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categorias.php`);
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handlePickerChange = (itemValue) => {
    setSelectedCategoria(itemValue);
  };

  const esperarLoad = () => {
    rewarded.load();
    // Chama a função após 5 segundos (5000 milissegundos)
    setTimeout(handleLoadFrasePress, 5000);
  };

  const handleLoadFrasePress = () => {
    
    if (selectedCategoria === "0") {
      var aleatorio = Math.floor(Math.random() * 20) + 1;
      setSelectedCategoria(aleatorio, () => {
        fetchFraseTexto(aleatorio);
      });
    } else {
      fetchFraseTexto(selectedCategoria);
    }
    
  };

  const fetchFraseTexto = async (categoriaId) => {
    try {
      const jsonFraseSalva = await AsyncStorage.getItem('idFraseSalva');
      const fraseSalva = JSON.parse(jsonFraseSalva);
      if (fraseSalva) {
        setIdFrase(fraseSalva);
      }

      let url = `${API_BASE_URL}/frases.php?id=${idFrase}&cat=${categoriaId}`;

      const response = await axios.get(url);
      
      if (response.data.length === 0) {
       Alert.alert('Nenhuma frase encontrada para esta categoria.');
      } else {
        setFraseTexto(response.data[0].texto);
        setIdFrase(response.data[0].id);
        saveFraseToAsyncStorage(response.data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar frase:', error);
    }
  };

  const saveFraseToAsyncStorage = async (fraseId) => {
    try {
      const data = {
        id: fraseId,
        date: new Date().toISOString(), // Salva a data atual em formato ISO8601
      };
      //await AsyncStorage.setItem('fraseSalva', JSON.stringify(data));
      await AsyncStorage.setItem('idFraseSalva', fraseId);
      console.log('Frase salva com sucesso no AsyncStorage:', data);
    } catch (error) {
      console.error('Erro ao salvar frase no AsyncStorage:', error);
    }
  };

  useEffect(() => {
    // Carregar as categorias ao abrir a tela
    fetchCategorias();
    fetchFraseTexto(selectedCategoria);

    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
      rewarded.show();
    });
    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('User earned reward of ', reward);
      },
    );

    // Unsubscribe from events on unmount
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, []);

  

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -50, backgroundColor: '#AAF' }}>
        <Text style={{ fontSize: 24, fontFamily: 'Verdana', marginBottom: 50, fontWeight: 'bold' }}>
          FRASES
        </Text>
        <Picker
          selectedValue={selectedCategoria}
          onValueChange={handlePickerChange}
          style={{ width: 200 }}>
          <Picker.Item label="Tipo de frase" value="0" />
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
          onPress={esperarLoad}>
          <Image
            source={require('./img/movie.png')}
            style={{
              width: 24,
              height: 24,
              marginRight: 8, // Espaçamento entre o ícone e o texto
            }}
          />
          <Text style={{ color: '#fff' }}>Nova Frase</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontFamily: 'Verdana', fontWeight: 'bold' }}>
            Frase do dia:
          </Text>
          {fraseTexto ? (
            <Text style={{ fontSize: 16, fontFamily: 'Verdana', margin: 10 }}>
              {fraseTexto}
            </Text>
          ) : null}
        </View>
      </View>
      <BannerAd 
        unitId={adUnitId} 
        size={BannerAdSize.FULL_BANNER}
      />
    </View>

  );
};

export default App;
