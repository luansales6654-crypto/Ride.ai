export interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

export interface IBGECity {
  id: number;
  nome: string;
}

export const BRAZIL_STATES: IBGEState[] = [
  { id: 35, sigla: 'SP', nome: 'São Paulo' },
  { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' },
  { id: 31, sigla: 'MG', nome: 'Minas Gerais' },
  { id: 41, sigla: 'PR', nome: 'Paraná' },
  { id: 43, sigla: 'RS', nome: 'Rio Grande do Sul' },
  { id: 42, sigla: 'SC', nome: 'Santa Catarina' },
  { id: 29, sigla: 'BA', nome: 'Bahia' },
  { id: 26, sigla: 'PE', nome: 'Pernambuco' },
  { id: 23, sigla: 'CE', nome: 'Ceará' },
  { id: 52, sigla: 'GO', nome: 'Goiás' },
  { id: 53, sigla: 'DF', nome: 'Distrito Federal' },
  { id: 32, sigla: 'ES', nome: 'Espírito Santo' },
  { id: 50, sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { id: 51, sigla: 'MT', nome: 'Mato Grosso' },
  { id: 15, sigla: 'PA', nome: 'Pará' },
  { id: 13, sigla: 'AM', nome: 'Amazonas' },
  { id: 21, sigla: 'MA', nome: 'Maranhão' },
  { id: 22, sigla: 'PI', nome: 'Piauí' },
  { id: 24, sigla: 'RN', nome: 'Rio Grande do Norte' },
  { id: 25, sigla: 'PB', nome: 'Paraíba' },
  { id: 27, sigla: 'AL', nome: 'Alagoas' },
  { id: 28, sigla: 'SE', nome: 'Sergipe' },
  { id: 17, sigla: 'TO', nome: 'Tocantins' },
  { id: 11, sigla: 'RO', nome: 'Rondônia' },
  { id: 12, sigla: 'AC', nome: 'Acre' },
  { id: 14, sigla: 'RR', nome: 'Roraima' },
  { id: 16, sigla: 'AP', nome: 'Amapá' },
];

// Fallback cities for major UFs in case IBGE API is slow or offline
const UF_FALLBACK_CITIES: Record<string, string[]> = {
  SP: ['São Paulo', 'Campinas', 'Guarulhos', 'São Bernardo do Campo', 'Santo André', 'São José dos Campos', 'Osasco', 'Ribeirão Preto', 'Sorocaba', 'Santos', 'Mauá', 'São José do Rio Preto', 'Mogi das Cruzes', 'Jundiaí', 'Piracicaba', 'Bauru', 'Itaquaquecetuba', 'Vicente de Carvalho', 'Francas', 'Guarujá', 'Praia Grande', 'Taubaté', 'Limeira', 'Suzano', 'Taboão da Serra', 'Sumaré', 'Barueri', 'Embu das Artes', 'Indaiatuba', 'Cotia', 'Americana', 'Marília', 'Araraquara', 'Jacareí', 'Presidente Prudente'],
  RJ: ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'Campos dos Goytacazes', 'São João de Meriti', 'Petrópolis', 'Volta Redonda', 'Macaé', 'Magé', 'Itaboraí', 'Cabo Frio', 'Angra dos Reis', 'Nova Friburgo', 'Teresópolis', 'Resende', 'Araruama', 'Maricá'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Sete Lagoas', 'Divinópolis', 'Santa Luzia', 'Ibirité', 'Poços de Caldas', 'Patos de Minas', 'Pouso Alegre', 'Teófilo Otoni', 'Barbacena', 'Sabará'],
  PR: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá', 'Araucária', 'Toledo', 'Apucarana', 'Pinhais', 'Campo Largo', 'Arapongas'],
  RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande', 'Alvorada', 'Passo Fundo', 'Sapucaia do Sul', 'Uruguaiana', 'Santa Cruz do Sul'],
  SC: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Chapecó', 'Itajaí', 'Criciúma', 'Jaraguá do Sul', 'Palhoça', 'Lages', 'Balneário Camboriú', 'Brusque', 'Tubarao'],
  BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Itabuna', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas', 'Barreiras', 'Alagoinhas', 'Porto Seguro'],
  PE: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão'],
  CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu'],
  GO: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Formosa'],
  DF: ['Brasília', 'Ceilândia', 'Taguatinga', 'Samambaia', 'Plano Piloto', 'Águas Claras', 'Gama', 'Santa Maria'],
  ES: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus', 'Guarapari'],
  MS: ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Sidrolândia'],
  MT: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Sorriso', 'Lucas do Rio Verde'],
  PA: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal', 'Abaetetuba'],
  AM: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari'],
  MA: ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Codó'],
  PI: ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano'],
  RN: ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba'],
  PB: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux'],
  AL: ['Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'Penedo'],
  SE: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'Estância'],
  TO: ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional'],
  RO: ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal'],
  AC: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'],
  RR: ['Boa Vista', 'Rorainópolis'],
  AP: ['Macapá', 'Santana', 'Laranjal do Jari'],
};

const cityCache: Record<string, IBGECity[]> = {};

export async function fetchCitiesByUF(uf: string): Promise<IBGECity[]> {
  if (!uf) return [];
  const upperUF = uf.toUpperCase();

  if (cityCache[upperUF] && cityCache[upperUF].length > 0) {
    return cityCache[upperUF];
  }

  // Generate fallback list first
  const fallbackNames = UF_FALLBACK_CITIES[upperUF] || ['Capital e Região Metropolitana'];
  const fallbackCities: IBGECity[] = fallbackNames.map((nome, idx) => ({ id: 900000 + idx, nome }));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${upperUF}/municipios`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Falha no serviço do IBGE');
    const data: { id: number; nome: string }[] = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const cityMap = new Map<string, IBGECity>();
      data.forEach((c) => {
        if (c && c.nome) {
          cityMap.set(c.nome.trim(), { id: c.id, nome: c.nome.trim() });
        }
      });
      const sorted = Array.from(cityMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
      cityCache[upperUF] = sorted;
      return sorted;
    }
  } catch (error) {
    console.warn(`IBGE API lenta ou offline para ${upperUF}. Usando lista de cidades pré-carregadas.`, error);
  }

  // Fallback if API fails or times out
  cityCache[upperUF] = fallbackCities;
  return fallbackCities;
}

