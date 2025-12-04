import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import type { StackParamList } from "./types";
import LoginScreen from "../screens/LoginScreen";
import CadastroScreen from "../screens/CadastroScreen";
import HomeScreen from "../screens/HomeScreen";
import DashboardVagasScreen from "../screens/DashboardVagasScreen";
import OngAcoesScreen from "../screens/OngAcoesScreen";
import EditarVagaScreen from "../screens/EditarVagaScreen";
import UserProfile from "../screens/UserProfileScreen";
import OrganizationProfile from "../screens/OrganizationProfileScreen";
import AppHeader from "../components/AppHeader";
import ChatScreen from "../screens/ChatScreen";
import MinhasVagasScreen from "../screens/MinhasVagasScreen";
import VagasVoluntariadasScreen from "../screens/VagasVoluntariadasScreen";
import OngReportsScreen from "../screens/OngReportsScreen";
import CreateVagaScreen from "../screens/CreateVagaScreen";
import GerenciarInscritosScreen from "../screens/GerenciarInscritosScreen";

const Stack = createStackNavigator<StackParamList>();

const Routes = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />

        {/* Telas que usarão o AppHeader */}
        <Stack.Screen
          name="DashboardVagas"
          component={DashboardVagasScreen}
          options={{
            headerTransparent: true,
            header: () => <AppHeader />,
          }}
        />

        <Stack.Screen
          name="OngAcoes"
          component={OngAcoesScreen}
          options={{
            headerTransparent: true,
            header: () => <AppHeader />,
          }}
        />

        <Stack.Screen
          name="EditarVaga"
          component={EditarVagaScreen}
          options={{
            headerTransparent: true,
            header: () => <AppHeader />,
          }}
        />

        <Stack.Screen
          name="UserProfile"
          component={UserProfile}
          options={{
            headerTransparent: true,
            header: () => <AppHeader />,
          }}
        />

        <Stack.Screen
          name="OrganizationProfile"
          component={OrganizationProfile}
          options={{
            headerTransparent: true,
            header: () => <AppHeader />,
          }}
        />
        <Stack.Screen
          name="VagasVoluntariadas"
          component={VagasVoluntariadasScreen}
          options={{
            title: "Meus Cadastros",
            header: () => <AppHeader />,
          }}
        />

        <Stack.Screen
          name="MinhasVagas"
          component={MinhasVagasScreen}
          options={{
            title: "Minhas Vagas",
            header: () => <AppHeader />,
          }}
        />

        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            title: "Chat da Vaga",
            header: () => <AppHeader />,
          }}
        />

        <Stack.Screen
          name="OngReports"
          component={OngReportsScreen}
          options={{
            headerTransparent: true,
            header: () => <AppHeader />,
          }}
        />
        <Stack.Screen
          name="CreateVaga"
          component={CreateVagaScreen}
          options={{
            title: "Criar Vaga",
            headerTransparent: true,
            header: () => <AppHeader />,
          }}
        />
        <Stack.Screen
          name="GerenciarInscritos"
          component={GerenciarInscritosScreen}
          options={{
            title: "Gerenciar Inscritos",
            headerTransparent: true,
            header: () => <AppHeader />,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
