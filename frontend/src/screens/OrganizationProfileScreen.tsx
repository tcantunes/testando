import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from "@expo/vector-icons";
import API from "../lib/api";
import Input from "../components/Input";
import Button from "../components/Button";
import { colors, spacing, typography, borderRadius } from '../theme/colors';

interface Perfil {
  nome: string;
  email: string;
  telefone?: string;
  cnpj?: string;
  cidade?: string;
  estado?: string;
}

const OrganizationProfileScreen = ({ navigation }: any) => {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ nome: "", telefone: "", cnpj: "" });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!loading && perfil) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, perfil]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profileRes = await API.get("/usuarios/me");
      const profileData = profileRes.data;

      setPerfil(profileData);
      setFormData({ 
        nome: profileData.nome || "", 
        telefone: profileData.telefone || "",
        cnpj: profileData.cnpj || "",
      });
    } catch (err: any) {
      Alert.alert("Erro", err?.response?.data?.error || "Não foi possível carregar o perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await API.put("/usuarios/me", formData);
      Alert.alert("Sucesso! 🎉", "Perfil atualizado com sucesso!");
      setIsEditMode(false);
      await fetchProfile();
    } catch (err: any) {
      Alert.alert("Erro", err?.response?.data?.error || "Não foi possível atualizar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary.main} />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!perfil) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color={colors.feedback.error} />
        <Text style={styles.errorText}>Não foi possível carregar o perfil.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      
      {/* Espaço para o AppHeader */}
      <View style={styles.headerSpacer} />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Informações da ONG</Text>
            {!isEditMode && (
              <TouchableOpacity 
                onPress={() => setIsEditMode(true)}
                style={styles.editButton}
              >
                <MaterialIcons name="edit" size={20} color={colors.secondary.main} />
              </TouchableOpacity>
            )}
          </View>

          {isEditMode ? (
            <>
              <Input
                label="Nome da Organização"
                value={formData.nome}
                onChangeText={(t) => setFormData({ ...formData, nome: t })}
                icon="business"
              />
              <Input
                label="CNPJ"
                value={formData.cnpj}
                onChangeText={(t) => setFormData({ ...formData, cnpj: t })}
                keyboardType="numeric"
                icon="badge"
              />
              <Input
                label="Telefone"
                value={formData.telefone}
                onChangeText={(t) => setFormData({ ...formData, telefone: t })}
                keyboardType="phone-pad"
                icon="phone"
              />
              
              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditMode(false);
                    setFormData({ 
                      nome: perfil.nome, 
                      telefone: perfil.telefone || "",
                      cnpj: perfil.cnpj || "",
                    });
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <View style={styles.saveButtonContainer}>
                  <Button
                    title={saving ? "Salvando..." : "Salvar"}
                    onPress={handleSaveProfile}
                    loading={saving}
                    variant="secondary"
                    size="medium"
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <InfoItem 
                icon="business" 
                label="Nome" 
                value={perfil.nome}
                color={colors.secondary.main}
              />
              <InfoItem 
                icon="email" 
                label="E-mail" 
                value={perfil.email}
                color={colors.secondary.main}
              />
              <InfoItem 
                icon="badge" 
                label="CNPJ" 
                value={perfil.cnpj || "Não informado"}
                color={colors.secondary.main}
              />
              <InfoItem 
                icon="phone" 
                label="Telefone" 
                value={perfil.telefone || "Não informado"}
                color={colors.secondary.main}
              />
              <InfoItem 
                icon="location-city" 
                label="Localização" 
                value={perfil.cidade && perfil.estado 
                  ? `${perfil.cidade}, ${perfil.estado}` 
                  : "Não informado"
                }
                color={colors.secondary.main}
              />
            </>
          )}
        </Animated.View>

        {/* Quick actions */}
        <Animated.View style={[styles.actionsCard, { opacity: fadeAnim }]}>
          <Text style={styles.actionsTitle}>Ações Rápidas</Text>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('CreateVaga')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primary.main + '15' }]}>
              <MaterialIcons name="add-circle" size={24} color={colors.primary.main} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>Criar nova ação</Text>
              <Text style={styles.actionDescription}>Publique uma nova oportunidade</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.neutral.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('OngReports')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary.main + '15' }]}>
              <MaterialIcons name="analytics" size={24} color={colors.secondary.main} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>Ver relatórios</Text>
              <Text style={styles.actionDescription}>Acompanhe suas métricas</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.neutral.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('MinhasVagas')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.accent.orange + '15' }]}>
              <MaterialIcons name="list-alt" size={24} color={colors.accent.orange} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>Gerenciar vagas</Text>
              <Text style={styles.actionDescription}>Veja todas as suas ações</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.neutral.textMuted} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoItem = ({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: string; 
  label: string; 
  value: string;
  color: string;
}) => (
  <View style={styles.infoItem}>
    <View style={[styles.infoIcon, { backgroundColor: color + '15' }]}>
      <MaterialIcons name={icon as any} size={20} color={color} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  headerSpacer: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral.background,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.neutral.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral.background,
    gap: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.feedback.error,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
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
    bottom: -30,
    left: -40,
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
  avatarContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...colors.shadows.medium,
  },
  userName: {
    ...typography.title,
    color: colors.neutral.white,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  badgeText: {
    ...typography.small,
    color: colors.secondary.main,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    marginTop: -spacing.lg,
  },
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...colors.shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.neutral.textPrimary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...typography.small,
    color: colors.neutral.textMuted,
  },
  infoValue: {
    ...typography.body,
    color: colors.neutral.textPrimary,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.neutral.textMuted,
    fontWeight: '600',
  },
  saveButtonContainer: {
    minWidth: 120,
  },
  actionsCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    ...colors.shadows.medium,
  },
  actionsTitle: {
    ...typography.subtitle,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.lg,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    ...typography.body,
    color: colors.neutral.textPrimary,
    fontWeight: '600',
  },
  actionDescription: {
    ...typography.small,
    color: colors.neutral.textMuted,
    marginTop: 2,
  },
});

export default OrganizationProfileScreen;
