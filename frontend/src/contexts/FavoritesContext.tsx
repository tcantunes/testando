import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@voluntai:favorites';

interface FavoritesContextData {
  favorites: number[];
  isFavorite: (vagaId: number) => boolean;
  toggleFavorite: (vagaId: number) => Promise<void>;
  clearFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>([]);

  // Carregar favoritos do AsyncStorage
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const saveFavorites = async (newFavorites: number[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  };

  const isFavorite = useCallback((vagaId: number) => {
    return favorites.includes(vagaId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (vagaId: number) => {
    const newFavorites = isFavorite(vagaId)
      ? favorites.filter(id => id !== vagaId)
      : [...favorites, vagaId];
    
    await saveFavorites(newFavorites);
  }, [favorites, isFavorite]);

  const clearFavorites = useCallback(async () => {
    await saveFavorites([]);
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

