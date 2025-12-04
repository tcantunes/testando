import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { StackParamList } from '../routes/types';
import { mensagensDaVaga, enviarMensagem, ChatMessage, getUsuarioAtual } from '../lib/backend';
import { colors, spacing, typography, borderRadius } from '../theme/colors';

type ChatScreenRouteProp = RouteProp<StackParamList, 'Chat'>;

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ChatScreenRouteProp>();
  const { vagaId, vagaNome } = route.params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const fetchCurrentUser = async () => {
    try {
      const user = await getUsuarioAtual();
      setCurrentUserId(user.id);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await mensagensDaVaga(vagaId);
      setMessages(data.reverse());
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await enviarMensagem(vagaId, newMessage);
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar a mensagem.');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    // Comparar com o ID do usuário logado
    const isMine = currentUserId !== null && item.usuarioId === currentUserId;

    return (
      <View style={[
        styles.messageWrapper,
        isMine ? styles.myMessageWrapper : styles.otherMessageWrapper
      ]}>
        {!isMine && (
          <View style={styles.avatarSmall}>
            <MaterialIcons name="person" size={16} color={colors.primary.main} />
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isMine ? styles.myMessage : styles.otherMessage
        ]}>
          {isMine ? (
            <Text style={styles.messageUserMine}>Você</Text>
          ) : (
            <Text style={styles.messageUser}>{item.usuario?.nome || 'Usuário'}</Text>
          )}
          <Text style={[
            styles.messageText,
            isMine && styles.myMessageText
          ]}>
            {item.mensagem}
          </Text>
          <Text style={[
            styles.messageTime,
            isMine && styles.myMessageTime
          ]}>
            {new Date(item.createdAt).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {isMine && (
          <View style={styles.avatarSmallRight}>
            <MaterialIcons name="person" size={16} color={colors.neutral.white} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      
      {/* Espaço para o AppHeader */}
      <View style={styles.headerSpacer} />

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.loadingText}>Carregando mensagens...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderMessage}
            inverted
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="chat-bubble-outline" size={48} color={colors.neutral.border} />
                <Text style={styles.emptyText}>
                  Nenhuma mensagem ainda.{'\n'}Seja o primeiro a enviar!
                </Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Digite sua mensagem..."
              placeholderTextColor={colors.neutral.textMuted}
              multiline
              maxLength={500}
            />
          </View>
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!newMessage.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                newMessage.trim() && !sending
                  ? colors.gradients.primary as [string, string]
                  : [colors.neutral.disabled, colors.neutral.disabled]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButtonGradient}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.neutral.white} />
              ) : (
                <MaterialIcons name="send" size={22} color={colors.neutral.white} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  headerSpacer: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.neutral.white,
    fontWeight: '700',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  onlineText: {
    ...typography.small,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.neutral.textMuted,
  },
  messageList: {
    padding: spacing.md,
    flexGrow: 1,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    alignItems: 'flex-end',
  },
  myMessageWrapper: {
    justifyContent: 'flex-end',
  },
  otherMessageWrapper: {
    justifyContent: 'flex-start',
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.main + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  avatarSmallRight: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  myMessage: {
    backgroundColor: colors.primary.main,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: colors.neutral.white,
    borderBottomLeftRadius: 4,
    ...colors.shadows.small,
  },
  messageUser: {
    ...typography.small,
    color: colors.primary.main,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  messageUserMine: {
    ...typography.small,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  messageText: {
    ...typography.body,
    color: colors.neutral.textPrimary,
  },
  myMessageText: {
    color: colors.neutral.white,
  },
  messageTime: {
    ...typography.small,
    color: colors.neutral.textMuted,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 120,
  },
  textInput: {
    ...typography.body,
    color: colors.neutral.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
