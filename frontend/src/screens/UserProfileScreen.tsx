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
import { estatisticasVoluntario, EstatisticasVoluntario } from '../lib/backend';

interface Perfil {
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  cidade?: string;
  estado?: string;
}

const UserProfileScreen = ({ navigation }: any) => {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ nome: "", telefone: "" });
  const [stats, setStats] = useState<EstatisticasVoluntario | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await estatisticasVoluntario();
      setStats(data);
    } catch (err) {
      console.log('Erro ao buscar estatísticas:', err);
    }
  };

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
        telefone: profileData.telefone || "" 
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
        <ActivityIndicator size="large" color={colors.primary.main} />
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
            <Text style={styles.cardTitle}>Informações Pessoais</Text>
            {!isEditMode && (
              <TouchableOpacity 
                onPress={() => setIsEditMode(true)}
                style={styles.editButton}
              >
                <MaterialIcons name="edit" size={20} color={colors.primary.main} />
              </TouchableOpacity>
            )}
          </View>

          {isEditMode ? (
            <>
              <Input
                label="Nome"
                value={formData.nome}
                onChangeText={(t) => setFormData({ ...formData, nome: t })}
                icon="person"
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
                    setFormData({ nome: perfil.nome, telefone: perfil.telefone || "" });
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <View style={styles.saveButtonContainer}>
                  <Button
                    title={saving ? "Salvando..." : "Salvar"}
                    onPress={handleSaveProfile}
                    loading={saving}
                    variant="primary"
                    size="medium"
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <InfoItem 
                icon="person" 
                label="Nome" 
                value={perfil.nome} 
              />
              <InfoItem 
                icon="email" 
                label="E-mail" 
                value={perfil.email} 
              />
              <InfoItem 
                icon="phone" 
                label="Telefone" 
                value={perfil.telefone || "Não informado"} 
              />
              <InfoItem 
                icon="badge" 
                label="CPF" 
                value={perfil.cpf || "Não informado"} 
              />
              <InfoItem 
                icon="location-city" 
                label="Localização" 
                value={perfil.cidade && perfil.estado 
                  ? `${perfil.cidade}, ${perfil.estado}` 
                  : "Não informado"
                } 
              />
            </>
          )}
        </Animated.View>

        {/* Stats card */}
        <Animated.View style={[styles.statsCard, { opacity: fadeAnim }]}>
          <Text style={styles.statsTitle}>Suas Estatísticas</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialIcons name="favorite" size={24} color={colors.primary.main} />
              <Text style={styles.statValue}>{stats?.totalAcoes || 0}</Text>
              <Text style={styles.statLabel}>Ações confirmadas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialIcons name="access-time" size={24} color={colors.accent.orange} />
              <Text style={styles.statValue}>{stats?.totalHoras || 0}h</Text>
              <Text style={styles.statLabel}>Voluntariadas</Text>
            </View>
          </View>
          
          {stats && Object.keys(stats.categorias).length > 0 && (
            <View style={styles.categoriesSection}>
              <Text style={styles.categoriesTitle}>Categorias mais atuantes</Text>
              <View style={styles.categoriesList}>
                {Object.entries(stats.categorias)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([categoria, count], index) => (
                    <View key={categoria} style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{categoria}</Text>
                      <View style={styles.categoryCount}>
                        <Text style={styles.categoryCountText}>{count}</Text>
                      </View>
                    </View>
                  ))
                }
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.infoItem}>
    <View style={styles.infoIcon}>
      <MaterialIcons name={icon as any} size={20} color={colors.primary.main} />
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
    color: colors.primary.main,
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
    backgroundColor: colors.primary.main + '15',
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
  statsCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    ...colors.shadows.medium,
  },
  statsTitle: {
    ...typography.subtitle,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.title,
    color: colors.neutral.textPrimary,
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.small,
    color: colors.neutral.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.neutral.border,
  },
  categoriesSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  categoriesTitle: {
    ...typography.caption,
    color: colors.neutral.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  categoryBadgeText: {
    ...typography.small,
    color: colors.primary.main,
    fontWeight: '500',
  },
  categoryCount: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCountText: {
    ...typography.small,
    color: colors.neutral.white,
    fontWeight: '700',
    fontSize: 10,
  },
});

export default UserProfileScreen;
