import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  StatusBar,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Formik } from "formik";
import * as Yup from "yup";
import Input from "../components/Input";
import Button from "../components/Button";
import TextArea from "../components/TextArea";
import DateTimeInput from "../components/DateTimeInput";
import LocationPicker from "../components/LocationPicker";
import { useNavigation } from '@react-navigation/native';

import { buscarEndereco } from "../services/api";
import { geocodeEndereco } from "../services/geocode";
import { criarVaga } from "../lib/backend";
import { colors, spacing, typography, borderRadius } from '../theme/colors';

const CATEGORIAS = [
  { key: 'Meio Ambiente', icon: 'eco', color: '#10B981' },
  { key: 'Saúde', icon: 'local-hospital', color: '#EF4444' },
  { key: 'Educação', icon: 'school', color: '#3B82F6' },
  { key: 'Animais', icon: 'pets', color: '#F59E0B' },
  { key: 'Social', icon: 'people', color: '#8B5CF6' },
  { key: 'Cultura', icon: 'palette', color: '#EC4899' },
];

const VagaSchema = Yup.object().shape({
  nome: Yup.string().required("Nome da vaga é obrigatório"),
  descricao: Yup.string().required("Descrição é obrigatória"),
  local: Yup.string().required("Local é obrigatório"),
  data_hora: Yup.date().required("Data e hora são obrigatórias").nullable(),
  vagas_disponiveis: Yup.number().min(1).required("Informe as vagas"),
  categoria: Yup.string().required("Selecione uma categoria"),
  cep: Yup.string().length(8, "CEP inválido").required("Informe o CEP"),
});

const CreateVagaScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      
      {/* Espaço para o AppHeader */}
      <View style={styles.headerSpacer} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        bounces={false}
      >
        <Formik
          initialValues={{
            nome: "",
            descricao: "",
            local: "",
            data_hora: null as Date | null,
            vagas_disponiveis: "1",
            categoria: "",
            cep: "",
            cidade: "",
            estado: "",
            latitude: null as number | null,
            longitude: null as number | null,
          }}
          validationSchema={VagaSchema}
          onSubmit={async (values) => {
            try {
              setLoading(true);

              const payload = {
                ...values,
                data_hora: values.data_hora ? values.data_hora.toISOString() : null,
                vagas_disponiveis: Number(values.vagas_disponiveis),
              };

              await criarVaga(payload);
              Alert.alert("Sucesso! 🎉", "Sua ação foi criada com sucesso!");
              navigation.goBack();
            } catch (err: any) {
              Alert.alert(
                "Erro",
                err?.response?.data?.error || "Não foi possível criar a vaga."
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ handleChange, handleSubmit, values, errors, touched, setFieldValue, setFieldError }) => {
            
            const handleCepChange = async (cep: string) => {
              const cleanCep = cep.replace(/\D/g, "").slice(0, 8);
              setFieldValue("cep", cleanCep);

              if (cleanCep.length === 8) {
                setLoadingLocation(true);
                
                try {
                  const endereco = await buscarEndereco(cleanCep);

                  if (!endereco || !endereco.rua) {
                    setFieldError("cep", "CEP não encontrado");
                    setLoadingLocation(false);
                    return;
                  }

                  setFieldValue("local", endereco.rua);
                  setFieldValue("cidade", endereco.cidade);
                  setFieldValue("estado", endereco.estado);

                  const coords = await geocodeEndereco(
                    endereco.rua || '',
                    endereco.cidade || '',
                    endereco.estado || ''
                  );

                  if (coords) {
                    setFieldValue("latitude", coords.latitude);
                    setFieldValue("longitude", coords.longitude);
                  }
                } catch (error) {
                  console.log("Erro ao buscar endereço:", error);
                } finally {
                  setLoadingLocation(false);
                }
              }
            };

            return (
              <View style={styles.form}>
                {/* Informações básicas */}
                <Text style={styles.sectionTitle}>Informações básicas</Text>
                
                <Input
                  label="Título da ação"
                  placeholder="Ex: Plantio de árvores no parque"
                  value={values.nome}
                  onChangeText={handleChange("nome")}
                  icon="title"
                  error={touched.nome && errors.nome ? errors.nome : undefined}
                />

                <View style={styles.textAreaContainer}>
                  <Text style={styles.inputLabel}>Descrição</Text>
                  <TextArea
                    placeholder="Descreva os detalhes da ação, o que os voluntários farão, materiais necessários, etc."
                    value={values.descricao}
                    onChangeText={handleChange("descricao")}
                  />
                  {touched.descricao && errors.descricao && (
                    <Text style={styles.errorText}>{errors.descricao}</Text>
                  )}
                </View>

                {/* Categoria */}
                <Text style={styles.sectionTitle}>Categoria</Text>
                <View style={styles.categoriesGrid}>
                  {CATEGORIAS.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryChip,
                        values.categoria === cat.key && { 
                          backgroundColor: cat.color,
                          borderColor: cat.color,
                        }
                      ]}
                      onPress={() => setFieldValue("categoria", cat.key)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons 
                        name={cat.icon as any} 
                        size={20} 
                        color={values.categoria === cat.key ? colors.neutral.white : cat.color} 
                      />
                      <Text style={[
                        styles.categoryChipText,
                        values.categoria === cat.key && { color: colors.neutral.white }
                      ]}>
                        {cat.key}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {touched.categoria && errors.categoria && (
                  <Text style={styles.errorText}>{errors.categoria}</Text>
                )}

                {/* Data e vagas */}
                <Text style={styles.sectionTitle}>Data e disponibilidade</Text>

                <DateTimeInput
                  label="Data e hora do evento"
                  value={values.data_hora}
                  onChange={(date) => setFieldValue("data_hora", date)}
                  minimumDate={new Date()}
                  error={touched.data_hora && errors.data_hora ? String(errors.data_hora) : undefined}
                />

                <Input
                  label="Quantidade de vagas"
                  placeholder="Ex: 10"
                  value={values.vagas_disponiveis}
                  keyboardType="numeric"
                  onChangeText={handleChange("vagas_disponiveis")}
                  icon="people"
                  error={touched.vagas_disponiveis && errors.vagas_disponiveis ? errors.vagas_disponiveis : undefined}
                />

                {/* Localização */}
                <Text style={styles.sectionTitle}>Localização</Text>

                <Input
                  label="CEP"
                  placeholder="00000-000"
                  value={values.cep}
                  onChangeText={handleCepChange}
                  keyboardType="numeric"
                  icon="location-on"
                  error={touched.cep && errors.cep ? errors.cep : undefined}
                />

                <Input
                  label="Endereço"
                  placeholder="Preenchido automaticamente"
                  value={values.local}
                  onChangeText={handleChange("local")}
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

                {/* Mapa interativo */}
                <LocationPicker
                  latitude={values.latitude}
                  longitude={values.longitude}
                  address={values.local}
                  loading={loadingLocation}
                  onLocationChange={(lat, lng) => {
                    setFieldValue("latitude", lat);
                    setFieldValue("longitude", lng);
                  }}
                />

                {/* Botão de criar */}
                <View style={styles.buttonContainer}>
                  <Button
                    title={loading ? "Criando..." : "Criar Ação"}
                    onPress={() => handleSubmit()}
                    loading={loading}
                    variant="primary"
                    size="large"
                  />
                </View>
              </View>
            );
          }}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  headerSpacer: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  headerContent: {
    alignItems: 'center',
    paddingTop: spacing.xl,
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
  },
  headerSubtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  form: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...colors.shadows.medium,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  textAreaContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  errorText: {
    ...typography.small,
    color: colors.feedback.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.white,
    gap: spacing.xs,
  },
  categoryChipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  coordsFound: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  coordsText: {
    ...typography.caption,
    color: colors.primary.main,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
});

export default CreateVagaScreen;
