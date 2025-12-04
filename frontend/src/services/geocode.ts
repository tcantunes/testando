export async function geocodeEndereco(rua: string, cidade: string, estado: string) {
  try {
    const query = encodeURIComponent(`${rua}, ${cidade}, ${estado}, Brasil`);

    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VoluntariadoApp/1.0 (TCC Project)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log("Erro na resposta da API:", response.status);
      return null;
    }

    const text = await response.text();
    
    // Verificar se é JSON válido
    if (!text || text.startsWith('<')) {
      console.log("Resposta inválida da API de geocodificação");
      return null;
    }

    const data = JSON.parse(text);

    if (data.length > 0) {
      return {
        latitude: Number(data[0].lat),
        longitude: Number(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.log("Erro ao geocodificar endereço:", error);
    return null;
  }
}
