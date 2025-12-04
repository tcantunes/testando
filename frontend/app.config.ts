import 'dotenv/config';
import type { ExpoConfig } from '@expo/config';
import rawAppJson from './app.json';

const appJson = rawAppJson.expo as unknown as ExpoConfig;
const config: ExpoConfig = {
  ...appJson,
  extra: {
    ...appJson.extra,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://seu-backend.onrender.com/api',
  },
};

export default config;
