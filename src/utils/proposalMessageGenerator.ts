export type MessageStyle = 'direto' | 'amigavel' | 'profissional' | 'curto' | 'personalizado';

export interface ProposalMessageParams {
  companyName: string;
  contactName?: string;
  category?: string;
  city?: string;
  service?: string;
  price?: number;
  deliveryDays?: number;
  publicUrl?: string;
  notes?: string;
}

export interface GeneratedProposalMessages {
  direto: string;
  amigavel: string;
  profissional: string;
  curto: string;
  personalizado: string;
}

/**
 * Generates local fallback proposal messages for all 5 styles per requirements 4.1 to 4.5.
 */
export function generateLocalProposalMessages(params: ProposalMessageParams): GeneratedProposalMessages {
  const company = params.companyName?.trim() || 'Sua Empresa';
  const contact = params.contactName?.trim() || company;
  const location = params.city?.trim() ? ` em ${params.city.trim()}` : '';
  const segment = params.category?.trim() ? ` (${params.category.trim()})` : '';
  const svc = params.service?.trim() || 'Presença Digital e Site de Alta Conversão';
  const priceFormatted = params.price ? `R$ ${params.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '';
  const days = params.deliveryDays ? `${params.deliveryDays} dias úteis` : 'poucos dias';
  const link = params.publicUrl?.trim() ? `\n\n📄 Proposta Completa e Interativa:\n${params.publicUrl.trim()}` : '';
  const userNotes = params.notes?.trim() ? `\n\n📌 Observações do Projeto:\n${params.notes.trim()}` : '';

  // Style 1 — Direto (Direct)
  const direto = `Olá ${contact}! Tudo bem?

Preparei uma proposta comercial objetiva para o projeto de *${svc}* da *${company}*${location}.

O objetivo é posicionar a empresa de forma profissional no Google, atraindo mais clientes e facilitando o atendimento pelo WhatsApp.

• Investimento: ${priceFormatted || 'sob consulta'}
• Prazo de Entrega: ${days}${link}

Podemos agendar uma breve conversa para alinhar os detalhes?`;

  // Style 2 — Amigável (Friendly)
  const amigavel = `Olá ${contact}, como você está? Espero que ótimo! 😊

Estive analisando o perfil da *${company}*${location}${segment} e vi uma excelente oportunidade para acelerar os agendamentos e vendas de vocês na região.

Montei uma apresentação bem prática e humanizada para o projeto de *${svc}*.${link}

Dá uma olhada sem compromisso quando puder e me fala o que achou. Fico à disposição no WhatsApp para conversarmos com toda tranquilidade!`;

  // Style 3 — Profissional (Professional)
  const profissional = `Prezado(a) ${contact},

Apresento a proposta comercial referente aos serviços de *${svc}* elaborada especialmente para a *${company}*${location}.

O projeto contempla diagnóstico da presença digital, estruturação visual de alto impacto e otimização para geração de novas oportunidades de negócios.

• Proposta e Escopo Técnico:${link}
• Previsão de Entrega: ${days}
• Investimento Previsto: ${priceFormatted}${userNotes}

Permanecemos à disposição para prestar quaisquer esclarecimentos necessários e dar prosseguimento ao projeto.

Atenciosamente,`;

  // Style 4 — Curto e Objetivo (Short & Objective)
  const curto = `Olá ${contact}! Segue o link da proposta comercial de *${svc}* para a *${company}*:${link}

Podemos alinhar os próximos passos ainda hoje?`;

  // Style 5 — Personalizado (Personalized)
  const personalizado = `Olá ${contact}!

Com base nas informações da *${company}*${location}${segment} e na necessidade de fortalecer a presença digital e atração de clientes na região, desenvolvi a proposta para *${svc}*.

A solução foi configurada com prazo de entrega de ${days} e investimento de ${priceFormatted || 'condições especiais'}.${link}${userNotes}

Fico à disposição para esclarecer dúvidas e dar início ao projeto. O que acha de iniciarmos nesta semana?`;

  return {
    direto: direto.trim(),
    amigavel: amigavel.trim(),
    profissional: profissional.trim(),
    curto: curto.trim(),
    personalizado: personalizado.trim(),
  };
}

/**
 * Calls AI endpoint with local fallback for generating all 5 proposal message styles.
 */
export async function fetchAIProposalMessages(params: ProposalMessageParams): Promise<GeneratedProposalMessages> {
  const localFallback = generateLocalProposalMessages(params);

  try {
    const res = await fetch('/api/ai/proposal-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) return localFallback;

    const json = await res.json();
    if (json.ok && json.data) {
      return {
        direto: json.data.direto || localFallback.direto,
        amigavel: json.data.amigavel || localFallback.amigavel,
        profissional: json.data.profissional || localFallback.profissional,
        curto: json.data.curto || localFallback.curto,
        personalizado: json.data.personalizado || localFallback.personalizado,
      };
    }
  } catch (err) {
    // Return pristine local template fallback on network/server error
  }

  return localFallback;
}
