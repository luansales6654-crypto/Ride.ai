import { CatalogProduct, Supplier } from '../types';

export const DEMO_CATEGORIES = [
  'Casa e Cozinha',
  'Organização e Decoração',
  'Cama, Mesa e Banho',
  'Beleza e Cuidados Pessoais',
  'Saúde e Bem-estar',
  'Eletrônicos e Acessórios',
  'Celulares e Acessórios',
  'Informática e Games',
  'Moda Feminina',
  'Moda Masculina',
  'Calçados',
  'Bolsas e Mochilas',
  'Fitness e Esportes',
  'Pet Shop',
  'Bebê e Infantil',
  'Brinquedos',
  'Automotivo',
  'Ferramentas e Construção',
  'Papelaria e Escritório',
  'Jardim e Ar Livre',
];

export function generateDemoSuppliers(): Supplier[] {
  const suppliers: Supplier[] = [];
  const cities = [
    { city: 'São Paulo', state: 'SP' },
    { city: 'Campinas', state: 'SP' },
    { city: 'Curitiba', state: 'PR' },
    { city: 'Belo Horizonte', state: 'MG' },
    { city: 'Blumenau', state: 'SC' },
    { city: 'Goiânia', state: 'GO' },
    { city: 'Porto Alegre', state: 'RS' },
    { city: 'Recife', state: 'PE' },
  ];

  for (let i = 1; i <= 40; i++) {
    const loc = cities[(i - 1) % cities.length];
    suppliers.push({
      id: `demo-sup-${i.toString().padStart(2, '0')}`,
      name: `Fornecedor DEMO ${i.toString().padStart(2, '0')}`,
      contactName: `Atendimento ${i}`,
      phone: `1198${(7000000 + i * 1111).toString().slice(0, 7)}`,
      whatsapp: `1198${(7000000 + i * 1111).toString().slice(0, 7)}`,
      email: `fornecedor.demo${i}@ride.ia.demo`,
      website: `https://fornecedordemo${i}.com.br`,
      city: loc.city,
      state: loc.state,
      avgLeadTimeDays: Math.floor(Math.random() * 3) + 1,
      shippingPolicy: 'Postagem em até 24h úteis para pedidos confirmados.',
      minOrderValue: 100,
      notes: 'Fornecedor de demonstração para testes do catálogo RIDE.IA.',
      isDemo: true,
      productCount: 25,
      createdAt: new Date().toISOString(),
    });
  }

  return suppliers;
}

// Category base products generator (5 items per category x 10 variations = 50 per category)
const CATEGORY_PRODUCTS_BASE: Record<string, { name: string; cost: number; price: number; iconSvg: string }[]> = {
  'Casa e Cozinha': [
    { name: 'Jogo de Panelas Antiaderente Ceramic', cost: 120, price: 249.90, iconSvg: 'pan' },
    { name: 'Air Fryer Digital 4.5L Inox', cost: 180, price: 389.90, iconSvg: 'appliance' },
    { name: 'Kit 6 Copos de Vidro Lapidado 350ml', cost: 25, price: 59.90, iconSvg: 'glass' },
    { name: 'Cafeteira Elétrica Programável 1.2L', cost: 85, price: 179.90, iconSvg: 'coffee' },
    { name: 'Conjunto Faca e Tábua de Bambu', cost: 35, price: 79.90, iconSvg: 'knife' },
  ],
  'Organização e Decoração': [
    { name: 'Kit 4 Caixas Organizadoras Dobráveis', cost: 30, price: 69.90, iconSvg: 'box' },
    { name: 'Luminária de Mesa LED Articulada Recarregável', cost: 22, price: 54.90, iconSvg: 'lamp' },
    { name: 'Espelho Adstringente Redondo 50cm Moldura Metal', cost: 45, price: 119.90, iconSvg: 'mirror' },
    { name: 'Nicho Organizador MDF Kit 3 Peças', cost: 40, price: 89.90, iconSvg: 'shelf' },
    { name: 'Cabide de Madeira Inox Kit 10 Unidades', cost: 28, price: 59.90, iconSvg: 'hanger' },
  ],
  'Cama, Mesa e Banho': [
    { name: 'Jogo de Cama Casal 100% Algodão 200 Fios', cost: 65, price: 149.90, iconSvg: 'bed' },
    { name: 'Toalha de Banho Gigante Algodão Egípcio 500g', cost: 24, price: 52.90, iconSvg: 'towel' },
    { name: 'Travesseiro NASA Viscoelástico Antissufocante', cost: 32, price: 74.90, iconSvg: 'pillow' },
    { name: 'Protetor de Colchão Impermeável Matelassê', cost: 38, price: 89.90, iconSvg: 'protector' },
    { name: 'Mesa de Cabeceira com Toalha Trançada Boho', cost: 22, price: 49.90, iconSvg: 'mat' },
  ],
  'Beleza e Cuidados Pessoais': [
    { name: 'Secador de Cabelo Profissional Iônico 2200W', cost: 75, price: 169.90, iconSvg: 'hairdryer' },
    { name: 'Kit Sérum Facial Ácido Hialurônico + Vitamina C', cost: 28, price: 69.90, iconSvg: 'serum' },
    { name: 'Escova Secadora Modeladora Oval 1200W', cost: 58, price: 129.90, iconSvg: 'brush' },
    { name: 'Aparador de Barba e Cabelo Bateria Lítio', cost: 34, price: 79.90, iconSvg: 'trimmer' },
    { name: 'Espelho Cosmético com Luz LED Touch', cost: 25, price: 59.90, iconSvg: 'mirror' },
  ],
  'Saúde e Bem-estar': [
    { name: 'Aparelho de Pressão Digital de Pulso Automático', cost: 45, price: 99.90, iconSvg: 'health' },
    { name: 'Umidificador de Ar Ultrassônico 3L com LED', cost: 52, price: 119.90, iconSvg: 'humidifier' },
    { name: 'Massageador Corporal Infravermelho 8 Cabeças', cost: 48, price: 109.90, iconSvg: 'massage' },
    { name: 'Termômetro Digital Infravermelho Sem Contato', cost: 22, price: 49.90, iconSvg: 'thermometer' },
    { name: 'Balança Digital de Bioimpedância Bluetooth App', cost: 38, price: 84.90, iconSvg: 'scale' },
  ],
  'Eletrônicos e Acessórios': [
    { name: 'Fone de Ouvido Bluetooth TWS Cancelamento Ruído', cost: 42, price: 99.90, iconSvg: 'headphones' },
    { name: 'Caixa de Som Portátil Bluetooth Prova D\'água 12W', cost: 55, price: 129.90, iconSvg: 'speaker' },
    { name: 'Power Bank Carregador Portátil 20000mAh Indução', cost: 48, price: 109.90, iconSvg: 'powerbank' },
    { name: 'Ring Light LED 10 Polegadas com Tripé 2.1m', cost: 35, price: 79.90, iconSvg: 'ringlight' },
    { name: 'Câmera de Segurança Wi-Fi Full HD 360° Visão Noturna', cost: 65, price: 149.90, iconSvg: 'camera' },
  ],
  'Celulares e Acessórios': [
    { name: 'Suporte Veicular Magnético com Carregador Magsafe', cost: 22, price: 49.90, iconSvg: 'holder' },
    { name: 'Cabo USB-C para Lightning Trançado Nylon 2m', cost: 12, price: 29.90, iconSvg: 'cable' },
    { name: 'Capa Anti-Impacto Magsafe com Proteção de Câmera', cost: 10, price: 24.90, iconSvg: 'case' },
    { name: 'Película de Vidro 3D Cobertura Total Kit 2x', cost: 8, price: 19.90, iconSvg: 'glass' },
    { name: 'Smartwatch Esportivo Tela AMOLED Medidor Cardíaco', cost: 85, price: 189.90, iconSvg: 'watch' },
  ],
  'Informática e Games': [
    { name: 'Mouse Gamer Ergonômico RGB 7200 DPI', cost: 28, price: 64.90, iconSvg: 'mouse' },
    { name: 'Teclado Mecânico RGB Switch Blue Switch Anti-Ghosting', cost: 78, price: 169.90, iconSvg: 'keyboard' },
    { name: 'Headset Gamer Som Surround 7.1 Microfone Noise Cancelling', cost: 68, price: 149.90, iconSvg: 'headset' },
    { name: 'Mousepad Gamer Extra Grande 800x300mm Borda Costurada', cost: 18, price: 42.90, iconSvg: 'pad' },
    { name: 'Suporte Articulado para 2 Monitores com Pistão a Gás', cost: 110, price: 239.90, iconSvg: 'mount' },
  ],
  'Moda Feminina': [
    { name: 'Vestido Midi Canelado Manga Curta Casual', cost: 32, price: 79.90, iconSvg: 'dress' },
    { name: 'Blazer Alfaiataria Feminino Estruturado Forrado', cost: 58, price: 139.90, iconSvg: 'blazer' },
    { name: 'Calça Jeans Wide Leg Cintura Alta Premium', cost: 52, price: 119.90, iconSvg: 'pants' },
    { name: 'Conjunto Blusa e Calça Moletinho Confort', cost: 45, price: 99.90, iconSvg: 'set' },
    { name: 'Cardigan Tricô Alongado Oversized', cost: 38, price: 89.90, iconSvg: 'sweater' },
  ],
  'Moda Masculina': [
    { name: 'Camiseta Básica 100% Algodão Pima Kit 3 Unidades', cost: 42, price: 99.90, iconSvg: 'tshirt' },
    { name: 'Calça Jogger Sarja MASCULINA com Elastano', cost: 48, price: 109.90, iconSvg: 'pants' },
    { name: 'Camisa Polo Piquet Algodão Clássica', cost: 32, price: 74.90, iconSvg: 'polo' },
    { name: 'Bermuda Sarja Casual com Cordão', cost: 35, price: 79.90, iconSvg: 'shorts' },
    { name: 'Jaqueta Corta Vento Impermeável com Capuz', cost: 62, price: 139.90, iconSvg: 'jacket' },
  ],
  'Calçados': [
    { name: 'Tênis Esportivo Casual Leve Confortável Caminhada', cost: 48, price: 109.90, iconSvg: 'shoe' },
    { name: 'Sapatênis Couro Legítimo Masculino Solado Antiderrapante', cost: 65, price: 149.90, iconSvg: 'leather_shoe' },
    { name: 'Sandália Rasteira Feminina Pedraria Minimalista', cost: 28, price: 64.90, iconSvg: 'sandal' },
    { name: 'Mocassim Couro Trançado Unissex', cost: 58, price: 129.90, iconSvg: 'mocassin' },
    { name: 'Bota Coturno Tratorada Couro Sintético', cost: 72, price: 159.90, iconSvg: 'boot' },
  ],
  'Bolsas e Mochilas': [
    { name: 'Mochila Notebook Impermeável Trava Antifurto USB', cost: 55, price: 129.90, iconSvg: 'backpack' },
    { name: 'Bolsa Feminina Transversal Couro PU Elegante', cost: 38, price: 89.90, iconSvg: 'bag' },
    { name: 'Mala de Viagem Bordo Rodinhas 360° ABS Rígida', cost: 95, price: 219.90, iconSvg: 'suitcase' },
    { name: 'Pochete Esportiva Corrida Impermeável Saída Fone', cost: 15, price: 34.90, iconSvg: 'pouch' },
    { name: 'Bolsa Maternidade Térmica Multifuncional Kit 3 Peças', cost: 68, price: 149.90, iconSvg: 'diaper_bag' },
  ],
  'Fitness e Esportes': [
    { name: 'Kit 5 Faixas Elásticas Mini Bands Exercício Pilates', cost: 18, price: 42.90, iconSvg: 'band' },
    { name: 'Corda de Pular com Contador Digital e Rolamento', cost: 16, price: 39.90, iconSvg: 'rope' },
    { name: 'Tapete de Yoga Mat EVA 10mm Antiderrapante Alça', cost: 32, price: 74.90, iconSvg: 'mat' },
    { name: 'Rolo de Liberação Miofascial Foam Roller 33cm', cost: 28, price: 64.90, iconSvg: 'roller' },
    { name: 'Garrafa Térmica Inox 1 Litro Gelada 24h Esportiva', cost: 38, price: 89.90, iconSvg: 'bottle' },
  ],
  'Pet Shop': [
    { name: 'Cama Pet Quadrada Lavável Cachorro e Gato P/M/G', cost: 38, price: 89.90, iconSvg: 'pet_bed' },
    { name: 'Fonte de Água Bivolt para Gatos Filtro Carvão 2L', cost: 42, price: 99.90, iconSvg: 'fountain' },
    { name: 'Arranhador para Gatos Torre com Brinquedo Trançado', cost: 35, price: 79.90, iconSvg: 'scratcher' },
    { name: 'Coleira Peitoral Guia Amortecedora Cães Médio Porte', cost: 22, price: 49.90, iconSvg: 'leash' },
    { name: 'Comedouro Duplo Automático Elevado com Tigela Inox', cost: 28, price: 64.90, iconSvg: 'feeder' },
  ],
  'Bebê e Infantil': [
    { name: 'Kit 3 Bodies Bebê Manga Longa Suedine 100% Algodão', cost: 28, price: 64.90, iconSvg: 'baby_body' },
    { name: 'Ninho Redutor de Berço com Travesseiro Dupla Face', cost: 45, price: 99.90, iconSvg: 'baby_nest' },
    { name: 'Cadeirinha de Balanço Bebê com Músicas e Vibração', cost: 110, price: 239.90, iconSvg: 'baby_swing' },
    { name: 'Esterilizador de Mamadeiras Micro-ondas Livre BPA', cost: 32, price: 74.90, iconSvg: 'sterilizer' },
    { name: 'Bolsa Térmica Maternidade com Trocador Impermeável', cost: 58, price: 129.90, iconSvg: 'baby_bag' },
  ],
  'Brinquedos': [
    { name: 'Blocos de Construção Educativo Kit 250 Peças', cost: 35, price: 79.90, iconSvg: 'blocks' },
    { name: 'Carrinho de Controle Remoto Recarregável 4x4 Off-Road', cost: 52, price: 119.90, iconSvg: 'car' },
    { name: 'Lousa Mágica Digital LCD 10 Polegadas para Desenho', cost: 18, price: 42.90, iconSvg: 'tablet' },
    { name: 'Jogo de Tabuleiro Estratégia Família Completo', cost: 42, price: 94.90, iconSvg: 'board_game' },
    { name: 'Kit Cozinha Infantil Panelinhas e Utensílios 15 Pçs', cost: 30, price: 69.90, iconSvg: 'kitchen_toy' },
  ],
  'Automotivo': [
    { name: 'Compressor de Ar Portátil Digital para Pneus 12V', cost: 58, price: 129.90, iconSvg: 'compressor' },
    { name: 'Aspirador de Pó Automotivo Portátil Sem Fio High Power', cost: 45, price: 99.90, iconSvg: 'vacuum' },
    { name: 'Kit Cera Cristalizadora + Cera Líquida + Microfibra', cost: 28, price: 64.90, iconSvg: 'car_care' },
    { name: 'Suporte Celular Carro Saída de Ar Gravidade Metal', cost: 16, price: 39.90, iconSvg: 'car_holder' },
    { name: 'Capa Protetora de Banco Impermeável Transporte Pet', cost: 35, price: 79.90, iconSvg: 'seat_cover' },
  ],
  'Ferramentas e Construção': [
    { name: 'Parafusadeira e Furadeira Bateria Lítio 12V Kit 24 Peças', cost: 85, price: 189.90, iconSvg: 'drill' },
    { name: 'Jogo de Chave de Fenda e Torx de Precisão 115 em 1', cost: 32, price: 74.90, iconSvg: 'tools' },
    { name: 'Trena Laser Digital Medidor de Distância 40 Metros', cost: 48, price: 109.90, iconSvg: 'laser' },
    { name: 'Nível a Laser Verde 3D 12 Linhas Autonivelante', cost: 125, price: 269.90, iconSvg: 'laser_level' },
    { name: 'Kit Alicates Profissionais 3 Peças Universal/Corte/Bico', cost: 38, price: 84.90, iconSvg: 'pliers' },
  ],
  'Papelaria e Escritório': [
    { name: 'Kit 12 Canetas Gel Ponta Fina Fofas Coloridas', cost: 16, price: 39.90, iconSvg: 'pens' },
    { name: 'Caderno Inteligente Universitário Argolado Reposicionável', cost: 35, price: 79.90, iconSvg: 'notebook' },
    { name: 'Organizador de Mesa Escritório Aço Aramado 4 Divisórias', cost: 22, price: 49.90, iconSvg: 'desk_organizer' },
    { name: 'Calculadora Científica 240 Funções Display Duplo', cost: 25, price: 54.90, iconSvg: 'calculator' },
    { name: 'Mochila Pasta Executiva Couro Sintético Unissex', cost: 65, price: 149.90, iconSvg: 'briefcase' },
  ],
  'Jardim e Ar Livre': [
    { name: 'Mangueira Mágica Expansível 30 Metros com Esguicho 7 Jatos', cost: 38, price: 89.90, iconSvg: 'hose' },
    { name: 'Luminária Solar de Jardim LED Balizador Kit 4 Peças', cost: 28, price: 64.90, iconSvg: 'solar_light' },
    { name: 'Kit Ferramentas para Jardinagem Aço Inox 5 Peças Maleta', cost: 42, price: 94.90, iconSvg: 'garden_tools' },
    { name: 'Rede de Descanso Casal Tecido Algodão com Varanda', cost: 55, price: 119.90, iconSvg: 'hammock' },
    { name: 'Lavadora de Alta Pressão Portátil Sem Fio Bateria Lítio', cost: 115, price: 249.90, iconSvg: 'pressure_washer' },
  ],
};

const VARIATIONS = [
  'Preto / P',
  'Preto / M',
  'Preto / G',
  'Branco / P',
  'Branco / M',
  'Branco / G',
  'Azul Elétrico / Padrão',
  'Prata / Kit Premium',
  'Dourado / Luxo',
  'Cinza Grafite / Edição Especial',
];

// Helper to generate SVG placeholder data URI for product category
function getProductSvgImage(categoryName: string, productName: string, sku: string): string {
  const bgColors: Record<string, string> = {
    'Casa e Cozinha': '%230A1F4D',
    'Organização e Decoração': '%23111113',
    'Eletrônicos e Acessórios': '%230D347A',
    'Informática e Games': '%23020817',
    'Moda Feminina': '%231255C8',
    'Fitness e Esportes': '%2306112A',
  };
  const bg = bgColors[categoryName] || '%23111113';
  const cleanName = encodeURIComponent(productName.slice(0, 24));
  const cleanCat = encodeURIComponent(categoryName);

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="100%" height="100%" fill="${bg}"/><rect x="30" y="30" width="540" height="540" rx="24" fill="none" stroke="%233D8BFF" stroke-width="2" stroke-dasharray="8 8"/><text x="300" y="240" font-family="sans-serif" font-size="22" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">${cleanName}</text><text x="300" y="280" font-family="sans-serif" font-size="16" fill="%238DBBFF" text-anchor="middle">${cleanCat}</text><text x="300" y="330" font-family="sans-serif" font-size="14" fill="%238B8B95" text-anchor="middle">SKU: ${sku}</text><rect x="220" y="370" width="160" height="36" rx="8" fill="%231769FF"/><text x="300" y="393" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">IMAGEM DEMO</text></svg>`;
}

export function generate1000DemoProducts(suppliers: Supplier[]): CatalogProduct[] {
  const products: CatalogProduct[] = [];
  let globalCount = 1;

  DEMO_CATEGORIES.forEach((cat, catIdx) => {
    const bases = CATEGORY_PRODUCTS_BASE[cat] || CATEGORY_PRODUCTS_BASE['Casa e Cozinha'];

    bases.forEach((base, baseIdx) => {
      VARIATIONS.forEach((varName, varIdx) => {
        const skuNumber = globalCount.toString().padStart(4, '0');
        const sku = `RIDE-D-${skuNumber}`;
        const supplier = suppliers[(globalCount - 1) % suppliers.length];

        // Variation price adjustment
        const priceFactor = 1 + (varIdx * 0.02);
        const costPrice = Math.round(base.cost * priceFactor * 100) / 100;
        const suggestedPrice = Math.round(base.price * priceFactor * 100) / 100;
        const marginPct = Math.round(((suggestedPrice - costPrice) / suggestedPrice) * 100 * 10) / 10;
        const profit = Math.round((suggestedPrice - costPrice) * 100) / 100;

        const fullName = `${base.name} - ${varName}`;
        const photoUrl = getProductSvgImage(cat, fullName, sku);

        products.push({
          id: `demo-prod-${skuNumber}`,
          sku,
          name: fullName,
          description: `${base.name} de alta qualidade, modelo ${varName}. Ideal para vendas online em marketplaces. Produto com nota fiscal e garantia do fornecedor ${supplier.name}.`,
          category: cat,
          subcategory: 'Geral',
          brand: 'RIDE.IA Brand',
          photos: [
            { url: photoUrl, isPrimary: true, alt: fullName, status: 'ok' }
          ],
          costPrice,
          suggestedPrice,
          marginPct,
          profit,
          stock: 50 + ((globalCount * 7) % 200),
          availability: 'em_estoque',
          supplierId: supplier.id,
          supplierName: supplier.name,
          supplierProductUrl: supplier.website,
          weightG: 300 + (globalCount % 1200),
          dimensionsCm: { l: 20, w: 15, h: 10 },
          shipping: { handlingDays: 1, deliveryDays: 3, shipsFrom: `${supplier.city}/${supplier.state}`, freeShipping: suggestedPrice > 120 },
          tags: [cat.toLowerCase(), 'demo', 'marketplace'],
          isDemo: true,
          source: 'demo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        globalCount++;
      });
    });
  });

  return products;
}
