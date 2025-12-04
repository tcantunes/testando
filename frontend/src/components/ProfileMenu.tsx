import React, { useEffect, useState } from "react";
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParamList } from "../routes/types";
import API from "../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, typography, borderRadius } from '../theme/colors';

const ProfileMenu = () => {
  const [visible, setVisible] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState<"fisico" | "juridico" | null>(null);
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchTipo = async () => {
      try {
        const res = await API.get("/auth/me");
        const user = res.data;
        if (user?.tipo) {
          setTipoUsuario(user.tipo === "juridico" ? "juridico" : "fisico");
        }
      } catch (err) {
        console.log("Erro ao buscar tipo:", err);
      }
    };

    fetchTipo();
  }, []);

  const toggleMenu = () => {
    if (!visible) {
      setVisible(true);
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  };

  const handleLogout = async () => {
    toggleMenu();
    await AsyncStorage.removeItem("token");
    delete API.defaults.headers.common["Authorization"];

    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  const navigateTo = (screen: keyof StackParamList) => {
    toggleMenu();
    navigation.navigate(screen as any);
  };

  const menuItems = [
    {
      icon: "person" as const,
      label: "Meu Perfil",
      onPress: () => navigateTo(tipoUsuario === "juridico" ? "OrganizationProfile" : "UserProfile"),
    },
    {
      icon: tipoUsuario === "juridico" ? "work" as const : "volunteer-activism" as const,
      label: tipoUsuario === "juridico" ? "Minhas Vagas" : "Meus Cadastros",
      onPress: () => navigateTo(tipoUsuario === "juridico" ? "MinhasVagas" : "VagasVoluntariadas"),
    },
  ];

  if (tipoUsuario === "juridico") {
    menuItems.push({
      icon: "analytics" as const,
      label: "Relatórios",
      onPress: () => navigateTo("OngReports"),
    });
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={toggleMenu}
        style={styles.avatarButton}
        activeOpacity={0.8}
      >
        <MaterialIcons name="account-circle" size={36} color={colors.neutral.white} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={toggleMenu}
      >
        <Pressable style={styles.overlay} onPress={toggleMenu}>
          <Animated.View 
            style={[
              styles.menu,
              {
                transform: [
                  { scale: scaleAnim },
                  { 
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    })
                  }
                ],
                opacity: scaleAnim,
              }
            ]}
          >
            {/* Header do menu */}
            <View style={styles.menuHeader}>
              <View style={styles.avatarLarge}>
                <MaterialIcons name="person" size={32} color={colors.primary.main} />
              </View>
              <Text style={styles.menuTitle}>
                {tipoUsuario === "juridico" ? "Organização" : "Voluntário"}
              </Text>
            </View>

            {/* Itens do menu */}
            <View style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemIcon}>
                    <MaterialIcons name={item.icon} size={22} color={colors.primary.main} />
                  </View>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  <MaterialIcons name="chevron-right" size={20} color={colors.neutral.textMuted} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Botão de logout */}
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <MaterialIcons name="logout" size={20} color={colors.feedback.error} />
              <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: spacing.md,
  },
  menu: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    width: 260,
    ...colors.shadows.large,
    overflow: 'hidden',
  },
  menuHeader: {
    backgroundColor: colors.neutral.background,
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...colors.shadows.small,
  },
  menuTitle: {
    ...typography.subtitle,
    color: colors.neutral.textPrimary,
  },
  menuItems: {
    padding: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemText: {
    ...typography.body,
    color: colors.neutral.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    margin: spacing.sm,
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  logoutText: {
    ...typography.body,
    color: colors.feedback.error,
    fontWeight: '600',
  },
});

export default ProfileMenu;
