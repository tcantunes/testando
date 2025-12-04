import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create({
  baseURL: 'http://10.0.2.2:4000/api',
  timeout: 10000,
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
