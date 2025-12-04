import API, { setToken } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ========== TIPOS ==========

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: 'fisico' | 'juridico';
  telefone?: string;
  cep?: string;
  rua?: string;
  cidade?: string;
  estado?: string;
  cpf?: string;
  cnpj?: string;
  latitude?: number;
  longitude?: number;
}

export interface Vaga {
  id: number;
  nome: string;
  descricao?: string;
  local?: string;
  data_hora?: string;
  vagas_disponiveis: number;
  categoria?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  criadorId: number;
  criador?: { id: number; nome: string; email?: string };
}

export interface Inscricao {
  id: number;
  vagaId: number;
  voluntarioId: number;
  presencaConfirmada?: boolean;
  dataConfirmacao?: string;
  horasVoluntariadas?: number;
  vaga?: Vaga;
  voluntario?: Usuario;
}

export interface EstatisticasVoluntario {
  totalAcoes: number;
  totalHoras: number;
  categorias: Record<string, number>;
  inscricoes: Inscricao[];
}

export interface ChatMessage {
  id: number;
  mensagem: string;
  vagaId: number;
  usuarioId: number;
  createdAt: string;
  usuario?: { id: number; nome: string };
}

export interface CadastroPayload {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  cep?: string;
  rua?: string;
  cidade?: string;
  estado?: string;
  tipo: 'fisico' | 'juridico';
  cpf?: string | null;
  cnpj?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface VagaPayload {
  nome: string;
  descricao: string;
  local: string;
  data_hora: string | null;
  vagas_disponiveis: number;
  categoria?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  latitude?: number | null;
  longitude?: number | null;
}

// ========== AUTENTICAÇÃO ==========

export async function registrarUsuario(data: CadastroPayload): Promise<Usuario> {
  const res = await API.post('/auth/register', data);
  await setToken(res.data.token);
  return res.data.user;
}

export async function loginUsuario(email: string, senha: string): Promise<Usuario> {
  const res = await API.post('/auth/login', { email, senha });
  await setToken(res.data.token);
  return res.data.user;
}

export async function logoutUsuario(): Promise<void> {
  await setToken(null);
}

export async function getUserStorage(): Promise<string | null> {
  const token = await AsyncStorage.getItem('token');
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return token;
}

export async function getUsuarioAtual(): Promise<Usuario> {
  const res = await API.get('/auth/me');
  return res.data;
}

// ========== VAGAS ==========

export async function listarVagas(): Promise<Vaga[]> {
  const res = await API.get('/vagas');
  return res.data;
}

export async function criarVaga(data: VagaPayload): Promise<Vaga> {
  const res = await API.post('/vagas', data);
  return res.data;
}

export async function atualizarVaga(id: number, data: Partial<VagaPayload>): Promise<Vaga> {
  const res = await API.put(`/vagas/${id}`, data);
  return res.data;
}

export async function minhasVagas(): Promise<Vaga[]> {
  const res = await API.get('/vagas/me');
  return res.data;
}

export async function deletarVaga(id: number): Promise<{ ok: boolean }> {
  const res = await API.delete(`/vagas/${id}`);
  return res.data;
}

// ========== INSCRIÇÕES ==========

export async function inscreverNaVaga(vagaId: number): Promise<Inscricao> {
  const res = await API.post('/inscricoes', { vagaId });
  return res.data;
}

export async function cancelarInscricao(vagaId: number): Promise<{ message: string }> {
  const res = await API.delete('/inscricoes', { data: { vagaId } });
  return res.data;
}

export async function inscritosDaVaga(vagaId: number): Promise<Inscricao[]> {
  const res = await API.get(`/inscricoes/vaga/${vagaId}`);
  return res.data;
}

export async function minhasInscricoes(): Promise<Inscricao[]> {
  const res = await API.get('/inscricoes/me');
  return res.data;
}

export async function confirmarPresenca(inscricaoId: number, horasVoluntariadas?: number): Promise<Inscricao> {
  const res = await API.post('/inscricoes/confirmar-presenca', { inscricaoId, horasVoluntariadas });
  return res.data;
}

export async function estatisticasVoluntario(): Promise<EstatisticasVoluntario> {
  const res = await API.get('/inscricoes/estatisticas');
  return res.data;
}

// ========== CHAT ==========

export async function enviarMensagem(vagaId: number, mensagem: string): Promise<ChatMessage> {
  const res = await API.post('/chat/send', { vagaId, mensagem });
  return res.data;
}

export async function mensagensDaVaga(vagaId: number): Promise<ChatMessage[]> {
  const res = await API.get(`/chat/vaga/${vagaId}`);
  return res.data;
}
