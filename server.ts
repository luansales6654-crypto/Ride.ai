import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Config status API
app.get('/api/config/status', (req: Request, res: Response) => {
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  res.json({
    googlePlaces: Boolean(mapsKey),
    mercadolivre: Boolean(process.env.ML_CLIENT_ID && process.env.ML_CLIENT_SECRET),
    shopee: Boolean(process.env.SHOPEE_PARTNER_ID && process.env.SHOPEE_PARTNER_KEY),
    tiktok: Boolean(process.env.TIKTOK_APP_KEY && process.env.TIKTOK_APP_SECRET),
    gemini: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Google Places Search API (New) - Real Google Maps Platform Integration
app.post('/api/places/search', async (req: Request, res: Response) => {
  const { segment, city, state, neighborhood, nameQuery, pageSize = 20 } = req.body;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      ok: false,
      error: {
        code: 'MISSING_API_KEY',
        message: 'A chave GOOGLE_MAPS_API_KEY não foi configurada nas variáveis de ambiente (Secrets). Por favor, configure a secret GOOGLE_MAPS_API_KEY no painel do AI Studio para realizar buscas reais.',
      },
    });
  }

  try {
    const textQueryParts = [nameQuery, segment, neighborhood, city, state, 'Brasil'].filter(Boolean);
    const textQuery = textQueryParts.join(' ');

    const limit = Math.min(Math.max(Number(pageSize) || 20, 1), 50);

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.googleMapsUri,places.location,places.regularOpeningHours,places.primaryType,places.primaryTypeDisplayName,places.types',
      },
      body: JSON.stringify({
        textQuery,
        languageCode: 'pt-BR',
        regionCode: 'BR',
        pageSize: limit,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.error?.message || response.statusText;
      const status = response.status;

      if (status === 400 || errorMsg.includes('INVALID_KEY') || errorMsg.includes('API key')) {
        return res.status(200).json({
          ok: false,
          error: {
            code: 'API_KEY_INVALID',
            message: 'A chave da API do Google Maps fornecida é inválida ou não possui as permissões necessárias.',
          },
        });
      }

      if (status === 403 || errorMsg.includes('BILLING_NOT_ENABLED') || errorMsg.includes('REQUEST_DENIED')) {
        return res.status(200).json({
          ok: false,
          error: {
            code: 'BILLING_OR_PERMISSIONS_ERROR',
            message: 'A API do Google Places (New) não está ativada no seu projeto Google Cloud ou o faturamento (billing) precisa ser ativado.',
          },
        });
      }

      if (status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('OVER_QUERY_LIMIT')) {
        return res.status(200).json({
          ok: false,
          error: {
            code: 'QUOTA_EXCEEDED',
            message: 'O limite de requisições ou quota da API do Google Maps foi atingido.',
          },
        });
      }

      return res.status(200).json({
        ok: false,
        error: {
          code: 'GOOGLE_MAPS_ERROR',
          message: `Erro na API do Google Maps (${status}): ${errorMsg}`,
        },
      });
    }

    const rawPlaces = data.places || [];

    if (rawPlaces.length === 0) {
      return res.json({
        ok: true,
        data: [],
        message: 'Nenhuma empresa real foi encontrada para estes critérios no Google Maps.',
      });
    }

    // Map real places returned by official Google Places API
    const results = rawPlaces.map((p: any) => {
      const siteUri = p.websiteUri || null;
      const phone = p.nationalPhoneNumber || p.internationalPhoneNumber || null;
      const cityClean = city || 'Não informado';
      const stateClean = state || 'BR';
      const neighClean = neighborhood || 'Não informado';

      return {
        id: p.id,
        place_id: p.id,
        placeId: p.id,
        nome: p.displayName?.text || 'Empresa sem nome',
        name: p.displayName?.text || 'Empresa sem nome',
        categoria: p.primaryTypeDisplayName?.text || p.primaryType || segment || 'Negócio Local',
        category: p.primaryTypeDisplayName?.text || p.primaryType || segment || 'Negócio Local',
        types: p.types || [],
        endereco: p.formattedAddress || `${cityClean}, ${stateClean}`,
        address: p.formattedAddress || `${cityClean}, ${stateClean}`,
        cidade: cityClean,
        city: cityClean,
        estado: stateClean,
        state: stateClean,
        bairro: neighClean,
        neighborhood: neighClean,
        telefone: phone,
        phone: phone || undefined,
        isPossibleWhatsapp: Boolean(phone),
        website: siteUri || undefined,
        siteStatus: siteUri ? 'found' : 'none',
        avaliacao: p.rating || null,
        rating: p.rating || undefined,
        quantidade_avaliacoes: p.userRatingCount || null,
        userRatingsTotal: p.userRatingCount || undefined,
        latitude: p.location?.latitude || null,
        longitude: p.location?.longitude || null,
        horario_funcionamento: p.regularOpeningHours?.weekdayDescriptions || [],
        openingHours: p.regularOpeningHours?.weekdayDescriptions || [],
        mapsUrl: p.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((p.displayName?.text || '') + ' ' + cityClean)}`,
        data_da_busca: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        status: 'novo',
        source: 'google_places_real',
      };
    });

    return res.json({ ok: true, data: results });
  } catch (error: any) {
    return res.status(200).json({
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Falha na conexão com a API do Google Maps. Verifique a rede do servidor e tente novamente.',
      },
    });
  }
});


// Gemini AI API setup
const aiKey = process.env.GEMINI_API_KEY;
const aiClient = aiKey ? new GoogleGenAI({ apiKey: aiKey }) : null;

// AI Message Generator API
app.post('/api/ai/message', async (req: Request, res: Response) => {
  if (!aiClient) {
    return res.status(200).json({
      ok: false,
      error: { code: 'AI_NOT_CONFIGURED', message: 'GEMINI_API_KEY não configurada.', retryable: false },
    });
  }

  const { companyName, category, city, phone, siteStatus, rating, userRatingsTotal, tone = 'direto', focus = 'site novo' } = req.body;

  const prompt = `
Você é um especialista em prospecção B2B respeitosa e direta no Brasil.
Gere 3 variações de mensagens de abordagem inicial (para WhatsApp/E-mail) para a empresa "${companyName}".

DADOS REAIS DA EMPRESA:
- Nome: ${companyName}
- Categoria: ${category}
- Cidade: ${city}
- Status do Site: ${siteStatus === 'none' ? 'Sem site informado no Google Maps' : 'Com site'}
- Avaliações Google: ${rating ? `${rating} estrelas (${userRatingsTotal} avaliações)` : 'Não informado'}

ESTRUTURA OBRIGATÓRIA DA MENSAGEM:
1) Cumprimento adequado (Bom dia / Boa tarde);
2) Nome da empresa;
3) Observação REAL sobre a presença digital (ex: "não encontrei um site no perfil do Google da ${companyName}" ou "vi que vocês têm nota ${rating} com ${userRatingsTotal} avaliações");
4) Apresentação da solução (${focus});
5) Benefício concreto;
6) Pergunta simples como CTA.

Regras:
- Máximo 500 caracteres por variação.
- Tom: ${tone}.
- NUNCA inventar fatos ou problemas técnicos não verificados.
- Responder estritamente em formato JSON com o seguinte schema:
{
  "curta": "string",
  "padrao": "string",
  "consultiva": "string"
}
`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json({ ok: true, data: parsed });
  } catch (error: any) {
    res.status(200).json({
      ok: false,
      error: { code: 'AI_ERROR', message: 'Não foi possível gerar a mensagem agora. Tente novamente.', retryable: true },
    });
  }
});

// AI Proposal Generator API
app.post('/api/ai/proposal', async (req: Request, res: Response) => {
  if (!aiClient) {
    return res.status(200).json({
      ok: false,
      error: { code: 'AI_NOT_CONFIGURED', message: 'GEMINI_API_KEY não configurada.', retryable: false },
    });
  }

  const { companyName, category, city, service, description, price, deliveryDays } = req.body;

  const prompt = `
Você é um consultor comercial sênior. Gere uma proposta comercial estruturada para a empresa "${companyName}".
Serviço: ${service}
Descrição inicial: ${description}
Investimento: R$ ${price}
Prazo: ${deliveryDays} dias

DADOS DA EMPRESA:
- Categoria: ${category}
- Cidade: ${city}

Retorne um JSON estrito com o schema:
{
  "problemIdentified": "string com o diagnóstico baseado nos dados reais",
  "proposedSolution": "string descrevendo a solução",
  "deliverables": ["string", "string", "string"],
  "benefits": ["string", "string"],
  "nextSteps": ["string", "string"],
  "paymentConditions": "string"
}
`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ ok: true, data: parsed });
  } catch (error: any) {
    res.status(200).json({
      ok: false,
      error: { code: 'AI_ERROR', message: 'Não foi possível gerar a proposta agora.', retryable: true },
    });
  }
});

// AI Site Master Prompt API
app.post('/api/ai/site-prompt', async (req: Request, res: Response) => {
  if (!aiClient) {
    return res.status(200).json({
      ok: false,
      error: { code: 'AI_NOT_CONFIGURED', message: 'GEMINI_API_KEY não configurada.', retryable: false },
    });
  }

  const { briefing } = req.body;

  const metaPrompt = `
Você é um estrategista de conversão e engenheiro de prompts sênior. Escreva um PROMPT MESTRE
completo, em português do Brasil, que será colado no Google AI Studio Build (ou outro construtor
de sites com IA) para criar um site profissional cujo objetivo é gerar contatos e vendas para a
empresa descrita nos dados abaixo.

REGRAS INEGOCIÁVEIS
1. Use SOMENTE fatos presentes nos dados de entrada. Nunca invente depoimentos, números, prêmios,
anos de experiência, preços, endereços, telefones, fotos, certificações ou garantias. O que
faltar vira [PREENCHER: o que falta] no local e entra na seção "Pendências do cliente".
2. O prompt gerado deve ser autossuficiente.
3. A página tem UM objetivo principal: ${briefing.goal || 'Receber contatos no WhatsApp'}.
4. Siga a sequência de conversão: atenção -> problema -> solução -> prova -> oferta -> ação.
5. Tom de voz: ${briefing.style || 'Moderno e profissional'}. Idioma: pt-BR.

DADOS DE ENTRADA:
${JSON.stringify(briefing, null, 2)}

FORMATO DE SAÍDA (Markdown com exatamente estas seções numeradas 1 a 15):
1. Resumo do projeto e objetivo de negócio
2. Dados reais da empresa
3. Público-alvo, dores e desejos
4. Direção visual (paleta hex, tipografia, ícones)
5. Estrutura da página, seção por seção
6. Copy completa (headlines, textos, FAQ de 6-8 perguntas)
7. Funcionalidades (botão fixo WhatsApp, formulário)
8. SEO local (title <= 60, description <= 155, keywords)
9. Responsividade
10. Performance e acessibilidade
11. Rastreamento e LGPD
12. Restrições
13. Entrega (stack, estrutura de arquivos)
14. Checklist de aceite (10-15 itens testáveis)
15. Pendências do cliente
`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: metaPrompt,
    });

    const masterPromptText = response.text || '';

    // Generate section structure JSON
    const structPrompt = `
Com base no briefing do site para "${briefing.companyName}", gere uma estrutura de seções em JSON para o editor de site.
Retorne um array de seções JSON no formato:
[
  {
    "type": "hero",
    "title": "Headline principal",
    "subtitle": "Subtítulo de apoio",
    "content": { "ctaText": "Falar no WhatsApp", "ctaUrl": "https://wa.me/..." },
    "isVisible": true,
    "order": 1
  },
  {
    "type": "services",
    "title": "Nossos Serviços",
    "content": { "items": [{ "title": "Serviço 1", "desc": "Descrição" }] },
    "isVisible": true,
    "order": 2
  },
  {
    "type": "faq",
    "title": "Dúvidas Frequentes",
    "content": { "items": [{ "question": "Pergunta?", "answer": "Resposta" }] },
    "isVisible": true,
    "order": 3
  },
  {
    "type": "cta",
    "title": "Garanta seu atendimento hoje",
    "content": { "buttonText": "Solicitar Orçamento" },
    "isVisible": true,
    "order": 4
  }
]
`;

    const structResponse = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: structPrompt,
      config: { responseMimeType: 'application/json' },
    });

    const sectionsJson = JSON.parse(structResponse.text || '[]');

    res.json({
      ok: true,
      data: {
        masterPrompt: masterPromptText,
        sections: sectionsJson,
      },
    });
  } catch (error: any) {
    res.status(200).json({
      ok: false,
      error: { code: 'AI_ERROR', message: 'Falha ao gerar o Prompt Mestre.', retryable: true },
    });
  }
});

// Mercado Livre OAuth Mock / Real Adapter status endpoint
app.get('/api/oauth/mercadolivre/auth-url', (req: Request, res: Response) => {
  const clientId = process.env.ML_CLIENT_ID;
  const redirectUri = process.env.ML_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/api/oauth/mercadolivre/callback`;

  if (!clientId) {
    return res.status(200).json({
      ok: false,
      error: { code: 'ML_NOT_CONFIGURED', message: 'Mercado Livre ainda não configurado. Configure as credenciais da integração para ativar esta função.', retryable: false },
    });
  }

  const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.json({ ok: true, data: { authUrl } });
});

// Serve frontend in production or development middleware fallback
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Vite dev server integration
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, () => {
  console.log(`[RIDE.IA Server] Servidor executando na porta ${PORT}`);
});
