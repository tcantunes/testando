import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { StackParamList } from '../routes/types';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { getUsuarioAtual, getUserStorage } from '../lib/backend';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Verificar se usuário já está logado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getUserStorage();
        if (token) {
          const user = await getUsuarioAtual();
          // Redireciona baseado no tipo de usuário
          if (user.tipo === 'juridico') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'OngAcoes' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'DashboardVagas' }],
            });
          }
          return;
        }
      } catch (error) {
        // Token inválido ou expirado, continua na home
        console.log('Usuário não autenticado');
      }
      setCheckingAuth(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!checkingAuth) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [checkingAuth]);

  // Mostra loading enquanto verifica autenticação
  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#059669', '#10B981', '#34D399']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color={colors.neutral.white} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background com gradiente */}
      <LinearGradient
        colors={['#059669', '#10B981', '#34D399']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Círculos decorativos */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {/* Conteúdo principal com ScrollView */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
        {/* Logo e título */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={styles.logoWrapper}>
            <MaterialIcons name="favorite" size={50} color={colors.neutral.white} />
          </View>
          <Text style={styles.brandName}>Voluntaí</Text>
          <Text style={styles.tagline}>Faça a diferença</Text>
        </Animated.View>

        {/* Card de apresentação */}
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconRow}>
              <View style={[styles.featureIcon, { backgroundColor: '#DCFCE7' }]}>
                <MaterialIcons name="people" size={24} color={colors.primary.main} />
              </View>
              <View style={[styles.featureIcon, { backgroundColor: '#FEF3C7' }]}>
                <MaterialIcons name="volunteer-activism" size={24} color={colors.accent.orange} />
              </View>
              <View style={[styles.featureIcon, { backgroundColor: '#DBEAFE' }]}>
                <MaterialIcons name="public" size={24} color={colors.feedback.info} />
              </View>
            </View>
          </View>

          <Text style={styles.cardTitle}>
            Conectando corações a causas que importam
          </Text>
          
          <Text style={styles.cardDescription}>
            Encontre oportunidades de voluntariado e 
            faça parte de uma comunidade que transforma vidas.
          </Text>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={colors.primary.main} />
              <Text style={styles.featureText}>Vagas verificadas</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={colors.primary.main} />
              <Text style={styles.featureText}>Chat integrado</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={colors.primary.main} />
              <Text style={styles.featureText}>100% gratuito</Text>
            </View>
          </View>

          {/* Botões */}
          <View style={styles.buttonContainer}>
            <Button 
              title="Entrar" 
              onPress={() => navigation.navigate('Login')} 
              variant="primary"
              size="large"
            />
            
            <Button 
              title="Criar conta gratuita" 
              onPress={() => navigation.navigate('Cadastro')} 
              variant="outline"
              size="large"
            />
          </View>
        </Animated.View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  safeArea: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -100,
    right: -100,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: 100,
    left: -80,
  },
  decorCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: 200,
    right: -50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.xxl,
    justifyContent: 'center',
    minHeight: height,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.neutral.white,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...colors.shadows.large,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  cardDescription: {
    ...typography.body,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  features: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.body,
    color: colors.neutral.textPrimary,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: spacing.md,
  },
});
