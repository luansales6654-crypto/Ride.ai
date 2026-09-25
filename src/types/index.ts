export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  agencyName?: string;
  agencyLogo?: string;
  whatsapp?: string;
  focus?: 'sites' | 'ecommerce' | 'both';
  role?: 'user' | 'admin' | 'support' | 'super_admin';
  buttonColor?: string;
  createdAt: string;
}

export interface UserSettings {
  dashboardYMinAxis: number;
  dashboardDefaultPeriod: 'today' | '7days' | '30days';
  prospectingMaxDailySearches: number;
  prospectingUnsubscribeLine: boolean;
  ecommerceDefaultTaxPct: number;
  ecommerceDefaultFixedFee: number;
  ecommerceMinTargetMarginPct: number;
  ecommerceDefaultShippingCost: number;
  brandName: string;
  brandLogo: string;
  showSignature: boolean;
  services: ServicePricing[];
}

export interface ServicePricing {
  id: string;
  name: string;
  description: string;
  scope: string[];
  deliveryDays: number;
  price: number;
}

export interface CompanyPlace {
  placeId: string;
  name: string;
  category: string;
  types: string[];
  address: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  phone?: string;
  isPossibleWhatsapp?: boolean;
  website?: string;
  siteStatus: 'found' | 'none' | 'unverified';
  rating?: number;
  userRatingsTotal?: number;
  openingHours?: string[];
  photoUrl?: string;
  mapsUrl?: string;
  fetchedAt: string;
  source: 'google_places' | 'demo';
}

export type LeadStatus = 'novo' | 'contatado' | 'respondeu' | 'proposta_enviada' | 'negociacao' | 'cliente' | 'perdido';

export interface Lead {
  id: string;
  companyId: string; // placeId
  companyName: string;
  category: string;
  city: string;
  state: string;
  phone?: string;
  isPossibleWhatsapp?: boolean;
  website?: string;
  siteStatus: 'found' | 'none' | 'unverified';
  status: LeadStatus;
  isFavorite?: boolean;
  isContacted?: boolean;
  estimatedValue?: number;
  followUpAt?: string | null;
  lossReason?: string;
  createdAt: string;
  updatedAt: string;
  companyData: CompanyPlace;
}

export interface LeadInteraction {
  id: string;
  leadId: string;
  type: 'note' | 'generated_message' | 'whatsapp_opened' | 'proposal_created' | 'proposal_sent' | 'proposal_accepted' | 'status_change' | 'site_created' | 'call' | 'email';
  text: string;
  meta?: Record<string, any>;
  createdAt: string;
}

export type ProposalStatus = 'rascunho' | 'enviada' | 'visualizada' | 'aceita' | 'recusada' | 'expirada';

export interface Proposal {
  id: string;
  leadId?: string;
  companyId?: string;
  companyName: string;
  service: string;
  description: string;
  scope: string[];
  deliverables: string[];
  benefits: string[];
  nextSteps: string[];
  deliveryDays: number;
  price: number;
  paymentConditions: string;
  contactName: string;
  contactPhone: string;
  status: ProposalStatus;
  theme: 'dark' | 'light';
  version: number;
  publicToken: string;
  viewsCount: number;
  sentAt?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProposalView {
  token: string;
  companyName: string;
  service: string;
  description: string;
  deliverables: string[];
  benefits: string[];
  price: number;
  deliveryDays: number;
  paymentConditions: string;
  contactPhone: string;
  createdAt: string;
  viewsCount: number;
}

export interface Website {
  id: string;
  leadId?: string;
  companyName: string;
  goal: string;
  segment: string;
  style: string;
  primaryColor: string;
  status: 'rascunho' | 'em_andamento' | 'concluido' | 'exportado' | 'publicado';
  briefing: Record<string, any>;
  masterPrompt: string;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteSection {
  id: string;
  websiteId: string;
  type: 'hero' | 'about' | 'services' | 'differentiators' | 'gallery' | 'testimonials' | 'location' | 'faq' | 'cta' | 'footer';
  title: string;
  subtitle?: string;
  content: Record<string, any>;
  isVisible: boolean;
  order: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  city: string;
  state: string;
  avgLeadTimeDays: number;
  shippingPolicy?: string;
  minOrderValue?: number;
  notes?: string;
  isDemo?: boolean;
  productCount?: number;
  createdAt: string;
}

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  gtin?: string;
  photos: { url: string; isPrimary: boolean; alt?: string; status?: 'ok' | 'quebrada' | 'gerando' }[];
  costPrice: number;
  suggestedPrice: number;
  marginPct: number;
  profit: number;
  stock: number;
  availability: 'em_estoque' | 'estoque_baixo' | 'indisponivel' | 'sob_encomenda';
  supplierId: string;
  supplierName: string;
  supplierProductUrl?: string;
  weightG: number;
  dimensionsCm: { l: number; w: number; h: number };
  shipping: { handlingDays: number; deliveryDays: number; shipsFrom: string; freeShipping: boolean };
  tags: string[];
  isDemo?: boolean;
  source: 'import' | 'api' | 'demo' | 'manual';
  createdAt: string;
  updatedAt: string;
}

export interface UserProduct extends CatalogProduct {
  catalogProductId?: string;
  customPrice?: number;
  customTitle?: string;
  userStatus: 'rascunho' | 'pronto' | 'publicado' | 'pausado';
}

export interface MarketplaceConnectionStatus {
  id: 'mercadolivre' | 'shopee' | 'tiktokshop';
  isConfigured: boolean;
  isConnected: boolean;
  accountNickname?: string;
  connectedAt?: string;
  expiresAt?: string;
}

export interface PublishedProduct {
  id: string;
  productId: string;
  productName: string;
  productPhoto: string;
  marketplace: 'mercadolivre' | 'shopee' | 'tiktokshop';
  listingId: string;
  listingUrl: string;
  status: 'rascunho' | 'publicando' | 'publicado' | 'erro' | 'pausado';
  price: number;
  stock: number;
  errorMessage?: string;
  publishedAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  marketplace: 'mercadolivre' | 'shopee' | 'tiktokshop';
  orderId: string;
  customerName: string;
  customerCity?: string;
  items: { productId: string; name: string; quantity: number; unitPrice: number }[];
  status: 'Pendente' | 'Pago' | 'Enviado' | 'Entregue' | 'Cancelado';
  totalAmount: number;
  createdAt: string;
  paidAt?: string;
}

export type SaleSource = 'site' | 'ecommerce' | 'manual';
export type SaleStatus = 'pendente' | 'confirmada' | 'cancelada' | 'estornada';

export interface Sale {
  id: string;
  source: SaleSource;
  marketplace?: 'mercadolivre' | 'shopee' | 'tiktokshop';
  orderId?: string;
  leadId?: string;
  proposalId?: string;
  websiteId?: string;
  customerName: string;
  description: string;
  amount: number;
  currency: 'BRL';
  status: SaleStatus;
  paymentMethod: 'Pix' | 'Cartão' | 'Boleto' | 'Dinheiro' | 'Outro';
  paidAt: string;
  createdAt: string;
}

export interface AutomationLog {
  id: string;
  type: 'stock_sync' | 'price_sync' | 'order_sync' | 'listing_sync' | 'photo_check' | 'followup_reminder';
  status: 'sucesso' | 'erro' | 'em_execucao';
  startedAt: string;
  endedAt?: string;
  itemsProcessed: number;
  errorsCount: number;
  details?: string;
}

export interface AppNotification {
  id: string;
  type: 'produto_publicado' | 'erro_integracao' | 'proposta_criada' | 'site_finalizado' | 'lead_salvo' | 'integracao_conectada' | 'sincronizacao_concluida' | 'nova_venda' | 'followup_hoje' | 'token_expirando';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface FileRecord {
  id: string;
  name: string;
  type: 'logo' | 'site_image' | 'product_image' | 'pdf' | 'export';
  sizeBytes: number;
  url: string;
  createdAt: string;
}

export interface IntegrationRequest {
  id: string;
  userId: string;
  userEmail: string;
  marketplaceName: string;
  requestedAt: string;
  status: 'pendente' | 'em_analise' | 'atendido';
}
