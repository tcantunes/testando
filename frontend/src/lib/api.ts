import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detecta o IP do servidor de desenvolvimento automaticamente
// Para dispositivo físico com Expo Go, usa o IP do Metro Bundler
const getBaseUrl = () => {
  // Em produção, usa a URL da variável de ambiente
  const apiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (apiUrl && !__DEV__) {
    return apiUrl;
  }

  if (__DEV__) {
    // Tenta pegar o IP do debugger host (funciona com Expo Go em dispositivo físico)
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
    
    if (debuggerHost) {
      return `http://${debuggerHost}:4000/api`;
    }
    
    // Fallback para emuladores
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:4000/api'; // Emulador Android
    }
    return 'http://localhost:4000/api'; // iOS Simulator ou Web
  }
  
  // Fallback para produção se não houver variável de ambiente
  return apiUrl || 'https://seu-backend.onrender.com/api';
};

const API = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
});

export async function setToken(token: string | null) {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await AsyncStorage.setItem('token', token);
  } else {
    delete API.defaults.headers.common['Authorization'];
    await AsyncStorage.removeItem('token');
  }
}

export default API;

