export interface Endereco {
    cidade?: string;
    estado?: string;
    rua?: string;
  }
  
  export const buscarEndereco = async (cep: string): Promise<Endereco> => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
  
        return {
          cidade: data.localidade,
          estado: data.uf,
          rua: data.logradouro,
        };
      } catch (error) {
        console.error('Erro ao buscar endereço', error);
        return {};
      }
    }
  
    return {};
  };
  