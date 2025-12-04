import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import API from '../lib/api';
import ProfileMenu from './ProfileMenu';
import { colors, spacing, typography } from '../theme/colors';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  title,
  showBack = true,
  transparent = false,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [tipoUsuario, setTipoUsuario] = useState<'fisico' | 'juridico' | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchUserType = async () => {
      try {
        const res = await API.get('/auth/me');
        const user = res.data;
        if (!mounted) return;
        if (user?.tipo) {
          setTipoUsuario(user.tipo === 'juridico' ? 'juridico' : 'fisico');
        }
      } catch (err) {
        setTipoUsuario(null);
      }
    };

    fetchUserType();
    return () => { mounted = false; };
  }, []);

  const getTitle = () => {
    if (title) return title;
    return tipoUsuario === 'juridico' ? 'Área da ONG' : 'Voluntaí';
  };

  const canGoBack = navigation.canGoBack && navigation.canGoBack();

  const HeaderContent = () => (
    <View style={[
      styles.header,
      { paddingTop: insets.top + spacing.sm }
    ]}>
      <View style={styles.leftSection}>
        {showBack && canGoBack ? (
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name="arrow-back" 
              size={24} 
              color={transparent ? colors.neutral.white : colors.neutral.white} 
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoContainer}>
            <MaterialIcons name="favorite" size={24} color={colors.neutral.white} />
          </View>
        )}
      </View>

      <Text style={styles.title}>{getTitle()}</Text>

      <View style={styles.rightSection}>
        <ProfileMenu />
      </View>
    </View>
  );

  if (transparent) {
    return (
      <View style={styles.transparentContainer}>
        <HeaderContent />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#059669', '#10B981']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <HeaderContent />
    </LinearGradient>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  gradient: {
    ...colors.shadows.medium,
  },
  transparentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  header: {
    height: 60 + (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  leftSection: {
    width: 48,
    alignItems: 'flex-start',
  },
  rightSection: {
    width: 48,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.subtitle,
    color: colors.neutral.white,
    fontWeight: '700',
  },
});
