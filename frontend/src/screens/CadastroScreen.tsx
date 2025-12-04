import React, { useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
  Keyboard,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { StackParamList } from "../routes/types";
import Input from "../components/Input";
import Button from "../components/Button";
import { buscarEndereco } from "../services/api";
import { registrarUsuario } from "../lib/backend";
import { colors, spacing, typography, borderRadius } from '../theme/colors';

const { height } = Dimensions.get('window');

const CadastroSchema = Yup.object().shape({
  nome: Yup.string().required("Informe seu nome"),
  email: Yup.string().email("Email inválido").required("Informe seu email"),
  senha: Yup.string()
    .min(6, "Mínimo de 6 caracteres")
    .required("Informe sua senha"),
  telefone: Yup.string()
    .min(10, "Telefone inválido")
    .required("Informe seu telefone"),
  cep: Yup.string().length(8, "CEP inválido").required("Informe o CEP"),
  tipo: Yup.string()
    .oneOf(["fisico", "juridico"], "Selecione o tipo de usuário")
    .required(),
  cpf: Yup.string().when("tipo", {
    is: "fisico",
    then: (schema) => schema.required("Informe o CPF"),
    otherwise: (schema) => schema.notRequired(),
  }),
  cnpj: Yup.string().when("tipo", {
    is: "juridico",
    then: (schema) => schema.required("Informe o CNPJ"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const CadastroScreen = () => {
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();

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

  const handleCadastro = async (values: any, { resetForm, setSubmitting }: any) => {
    Keyboard.dismiss();
    
    try {
      const payload = {
        nome: values.nome,
        email: values.email,
        senha: values.senha,
        telefone: values.telefone,
        cep: values.cep,
        rua: values.rua,
        cidade: values.cidade,
        estado: values.estado,
        tipo: values.tipo,
        cpf: values.tipo === "fisico" ? values.cpf : null,
        cnpj: values.tipo === "juridico" ? values.cnpj : null,
        latitude: null,
        longitude: null,
      };

      await registrarUsuario(payload);

      Alert.alert(
        "Cadastro realizado! 🎉", 
        "Bem-vindo ao Voluntaí! Faça login para começar."
      );
      resetForm();
      navigation.navigate("Login");
    } catch (error: any) {
      Alert.alert(
        "Erro no cadastro",
        error?.response?.data?.error || "Não foi possível realizar o cadastro."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Formik
        initialValues={{
          nome: "",
          email: "",
          senha: "",
          telefone: "",
          cep: "",
          rua: "",
          cidade: "",
          estado: "",
          tipo: "fisico",
          cpf: "",
          cnpj: "",
        }}
        validationSchema={CadastroSchema}
        onSubmit={handleCadastro}
      >
        {({
          handleChange,
          handleSubmit,
          values,
          setFieldValue,
          errors,
          touched,
          setFieldError,
          isSubmitting,
        }) => {
          const handleCepChange = async (text: string) => {
            const numericCep = text.replace(/\D/g, "").slice(0, 8);
            setFieldValue("cep", numericCep);

            if (numericCep.length === 8) {
              const endereco = await buscarEndereco(numericCep);

              if (!endereco || !endereco.rua) {
                setFieldError("cep", "CEP inválido ou não encontrado");
                setFieldValue("rua", "");
                setFieldValue("cidade", "");
                setFieldValue("estado", "");
              } else {
                setFieldError("cep", "");
                setFieldValue("rua", endereco.rua);
                setFieldValue("cidade", endereco.cidade);
                setFieldValue("estado", endereco.estado);
              }
            }
          };

          return (
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
                    <MaterialIcons name="person-add" size={40} color={colors.neutral.white} />
                  </View>
                  <Text style={styles.headerTitle}>Criar conta</Text>
                  <Text style={styles.headerSubtitle}>
                    Junte-se à nossa comunidade de voluntários
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
                  {/* Seleção de tipo */}
                  <Text style={styles.sectionTitle}>Você é:</Text>
                  <View style={styles.tipoContainer}>
                    <TouchableOpacity
                      style={[
                        styles.tipoBotao,
                        values.tipo === "fisico" && styles.tipoSelecionado,
                      ]}
                      onPress={() => {
                        setFieldValue("tipo", "fisico");
                        setFieldValue("cpf", "");
                        setFieldValue("cnpj", "");
                      }}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons 
                        name="person" 
                        size={28} 
                        color={values.tipo === "fisico" ? colors.neutral.white : colors.primary.main} 
                      />
                      <Text
                        style={
                          values.tipo === "fisico"
                            ? styles.tipoTextoSelecionado
                            : styles.tipoTexto
                        }
                      >
                        Voluntário
                      </Text>
                      <Text style={[
                        styles.tipoDescricao,
                        values.tipo === "fisico" && styles.tipoDescricaoSelecionada
                      ]}>
                        Quero ajudar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.tipoBotao,
                        values.tipo === "juridico" && styles.tipoSelecionado,
                      ]}
                      onPress={() => {
                        setFieldValue("tipo", "juridico");
                        setFieldValue("cpf", "");
                        setFieldValue("cnpj", "");
                      }}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons 
                        name="business" 
                        size={28} 
                        color={values.tipo === "juridico" ? colors.neutral.white : colors.primary.main} 
                      />
                      <Text
                        style={
                          values.tipo === "juridico"
                            ? styles.tipoTextoSelecionado
                            : styles.tipoTexto
                        }
                      >
                        ONG
                      </Text>
                      <Text style={[
                        styles.tipoDescricao,
                        values.tipo === "juridico" && styles.tipoDescricaoSelecionada
                      ]}>
                        Preciso de voluntários
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Dados pessoais */}
                  <Text style={styles.sectionTitle}>Dados pessoais</Text>
                  
                  <Input
                    label="Nome completo"
                    placeholder="Digite seu nome"
                    value={values.nome}
                    onChangeText={handleChange("nome")}
                    icon="person"
                    error={touched.nome && errors.nome ? errors.nome : undefined}
                    returnKeyType="next"
                  />

                  <Input
                    label="E-mail"
                    placeholder="seu@email.com"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon="email"
                    error={touched.email && errors.email ? errors.email : undefined}
                    returnKeyType="next"
                  />

                  <Input
                    label="Senha"
                    placeholder="Mínimo 6 caracteres"
                    value={values.senha}
                    onChangeText={handleChange("senha")}
                    secureTextEntry
                    icon="lock"
                    error={touched.senha && errors.senha ? errors.senha : undefined}
                    returnKeyType="next"
                  />

                  <Input
                    label="Telefone"
                    placeholder="(00) 00000-0000"
                    value={values.telefone}
                    onChangeText={handleChange("telefone")}
                    keyboardType="phone-pad"
                    icon="phone"
                    error={touched.telefone && errors.telefone ? errors.telefone : undefined}
                    returnKeyType="next"
                  />

                  {/* CPF ou CNPJ */}
                  {values.tipo === "fisico" ? (
                    <Input
                      label="CPF"
                      placeholder="000.000.000-00"
                      value={values.cpf}
                      onChangeText={handleChange("cpf")}
                      keyboardType="numeric"
                      icon="badge"
                      error={touched.cpf && errors.cpf ? errors.cpf : undefined}
                      returnKeyType="next"
                    />
                  ) : (
                    <Input
                      label="CNPJ"
                      placeholder="00.000.000/0000-00"
                      value={values.cnpj}
                      onChangeText={handleChange("cnpj")}
                      keyboardType="numeric"
                      icon="business"
                      error={touched.cnpj && errors.cnpj ? errors.cnpj : undefined}
                      returnKeyType="next"
                    />
                  )}

                  {/* Endereço */}
                  <Text style={styles.sectionTitle}>Endereço</Text>

                  <Input
                    label="CEP"
                    placeholder="00000-000"
                    value={values.cep}
                    onChangeText={handleCepChange}
                    keyboardType="numeric"
                    icon="location-on"
                    error={touched.cep && errors.cep ? errors.cep : undefined}
                    returnKeyType="done"
                  />

                  <Input
                    label="Rua"
                    placeholder="Preenchido automaticamente"
                    value={values.rua}
                    editable={false}
                    icon="home"
                  />

                  <View style={styles.row}>
                    <View style={styles.halfInput}>
                      <Input
                        label="Cidade"
                        placeholder="Cidade"
                        value={values.cidade}
                        editable={false}
                        icon="location-city"
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Input
                        label="Estado"
                        placeholder="UF"
                        value={values.estado}
                        editable={false}
                        icon="map"
                      />
                    </View>
                  </View>

                  {/* Botão de cadastro */}
                  <View style={styles.buttonContainer}>
                    <Button 
                      title={isSubmitting ? "Cadastrando..." : "Criar minha conta"}
                      onPress={() => handleSubmit()} 
                      loading={isSubmitting}
                      variant="primary"
                      size="large"
                    />
                  </View>

                  {/* Link para login */}
                  <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Já tem uma conta?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={styles.loginLink}>Faça login</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </View>
            </ScrollView>
          );
        }}
      </Formik>
      </SafeAreaView>
    </View>
  );
};

export default CadastroScreen;

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
    height: height * 0.28,
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
    paddingTop: spacing.lg,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 26,
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
  sectionTitle: {
    ...typography.subtitle,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  tipoContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  tipoBotao: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary.main,
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
  tipoSelecionado: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  tipoTexto: {
    ...typography.subtitle,
    color: colors.primary.main,
    marginTop: spacing.xs,
  },
  tipoTextoSelecionado: {
    ...typography.subtitle,
    color: colors.neutral.white,
    marginTop: spacing.xs,
  },
  tipoDescricao: {
    ...typography.small,
    color: colors.neutral.textMuted,
    marginTop: spacing.xs,
  },
  tipoDescricaoSelecionada: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  loginText: {
    ...typography.body,
    color: colors.neutral.textSecondary,
  },
  loginLink: {
    ...typography.body,
    color: colors.primary.main,
    fontWeight: '700',
  },
});
