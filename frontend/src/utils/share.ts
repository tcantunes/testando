import { Share, Platform } from 'react-native';

interface VagaShareData {
  nome: string;
  descricao?: string;
  local?: string;
  cidade?: string;
  data_hora?: string | null;
  categoria?: string;
}

export async function shareVaga(vaga: VagaShareData): Promise<boolean> {
  try {
    const formattedDate = vaga.data_hora
      ? new Date(vaga.data_hora).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Data a definir';

    const location = vaga.local || vaga.cidade || 'Local a definir';

    const message = `🤝 *Oportunidade de Voluntariado!*

📌 *${vaga.nome}*

${vaga.descricao ? `📝 ${vaga.descricao}\n` : ''}
📍 ${location}
📅 ${formattedDate}
${vaga.categoria ? `🏷️ Categoria: ${vaga.categoria}\n` : ''}
💚 Participe dessa ação e faça a diferença!

Baixe o Voluntaí e encontre mais oportunidades de ajudar!`;

    const result = await Share.share({
      message,
      title: `Voluntariado: ${vaga.nome}`,
    });

    if (result.action === Share.sharedAction) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao compartilhar:', error);
    return false;
  }
}

