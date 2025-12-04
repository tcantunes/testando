import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Input from '../components/Input';
import Button from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { StackParamList } from '../routes/types';
import { loginUsuario } from '../lib/backend';
import { colors, spacing, typography, borderRadius } from '../theme/colors';

const { height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    Keyboard.dismiss();
    
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha email e senha para continuar.');
      return;
    }

    setLoading(true);

    try {
      const user = await loginUsuario(email, senha);

      // Reset da navegação para impedir voltar ao login
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

    } catch (error: any) {
      Alert.alert(
        'Erro ao entrar', 
        error?.response?.data?.error || 'Verifique suas credenciais e tente novamente.'
      );
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          bounces={false}
        >
        {/* Header com gradiente */}
        <LinearGradient
          colors={['#059669', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Botão voltar */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.neutral.white} />
          </TouchableOpacity>

          {/* Círculos decorativos */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          <Animated.View 
            style={[
              styles.headerContent,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons name="login" size={40} color={colors.neutral.white} />
            </View>
            <Text style={styles.headerTitle}>Bem-vindo de volta!</Text>
            <Text style={styles.headerSubtitle}>
              Entre para continuar fazendo a diferença
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Formulário */}
        <View style={styles.formWrapper}>
          <Animated.View 
            style={[
              styles.form,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <Input
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="email"
              returnKeyType="next"
            />

            <Input
              label="Senha"
              placeholder="Digite sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              icon="lock"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <Button
                title={loading ? 'Entrando...' : 'Entrar'}
                onPress={handleLogin}
                loading={loading}
                variant="primary"
                size="large"
              />
            </View>

            {/* Divisor */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Link para cadastro */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Ainda não tem conta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
                <Text style={styles.signupLink}>Cadastre-se grátis</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: height * 0.35,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: 20,
    left: -40,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formWrapper: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    paddingBottom: spacing.xxl,
  },
  form: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...colors.shadows.large,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.caption,
    color: colors.primary.main,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.neutral.textMuted,
    paddingHorizontal: spacing.md,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  signupText: {
    ...typography.body,
    color: colors.neutral.textSecondary,
  },
  signupLink: {
    ...typography.body,
    color: colors.primary.main,
    fontWeight: '700',
  },
});
