import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CatalogProduct, Supplier } from '../types';
import { generate1000DemoProducts, generateDemoSuppliers, DEMO_CATEGORIES } from '../database/demoCatalogSeed';
import { formatBRL } from '../utils/formatters';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import {
  Grid,
  List,
  Search,
  CheckCircle,
  Filter,
  Truck,
  ExternalLink,
  Plus,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

export const CatalogoPage: React.FC = () => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Multi-selection bar state per section 14.6
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  // Details Modal
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load or generate demo catalog
  const handleLoadDemoCatalog = () => {
    setLoading(true);
    setTimeout(() => {
      const sups = generateDemoSuppliers();
      const prods = generate1000DemoProducts(sups);
      setSuppliers(sups);
      setProducts(prods);
      setLoading(false);
      showToast({
        type: 'success',
        title: 'Catálogo de Demonstração carregado!',
        message: '1.000 produtos com fotos, fornecedores e margens ativados.',
      });
    }, 300);
  };

  useEffect(() => {
    // Auto load demo catalog if empty
    handleLoadDemoCatalog();
  }, []);

  const handleToggleSelectProduct = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q)
      );
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-sora text-xl font-bold text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#3D8BFF]" />
            Catálogo de Produtos ({products.length} itens)
          </h2>
          <p className="text-xs text-[#8B8B95] mt-1">
            Vitrine global para seleção e cadastro de produtos em marketplaces
          </p>
        </div>

        <div className="flex items-center gap-3">
          {products.length === 0 && (
            <button onClick={handleLoadDemoCatalog} className="btn-primary text-xs font-semibold">
              <RefreshCw className="w-4 h-4" /> Carregar Catálogo DEMO (1.000 produtos)
            </button>
          )}

          <button onClick={() => navigate('/app/catalogo/importar')} className="btn-secondary text-xs">
            Importar Planilha CSV
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="card-surface p-4 rounded-2xl border border-[#26262B] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8B8B95] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do produto, SKU ou fornecedor..."
            className="w-full bg-[#18181B] border border-[#26262B] text-white text-xs rounded-xl p-2.5 pl-9 outline-none focus:border-[#3D8BFF]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#18181B] border border-[#26262B] text-white text-xs rounded-xl p-2.5 outline-none focus:border-[#3D8BFF] w-full md:w-64"
        >
          <option value="all">Todas as Categorias ({products.length})</option>
          {DEMO_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredProducts.slice(0, 48).map((product) => {
            const isSelected = selectedProductIds.has(product.id);

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`card-surface p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isSelected ? 'card-selected bg-[#0A1F4D]/20' : 'border-[#26262B] hover:border-[#3D8BFF]/40'
                }`}
              >
                {/* DEMO Pill Badge */}
                {product.isDemo && (
                  <span className="absolute top-2 left-2 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded border border-dashed border-[#3D8BFF] text-[#8DBBFF] bg-[#0A0A0B]/80">
                    DEMO
                  </span>
                )}

                {/* Product Photo */}
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#18181B] mb-3 relative">
                  <img
                    src={product.photos[0]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1 right-1 text-[9px] bg-[#2FBF71]/20 text-[#2FBF71] font-bold px-1.5 py-0.5 rounded border border-[#2FBF71]/30">
                    Margem {product.marginPct}%
                  </span>
                </div>

                <div>
                  <h4 className="font-sora font-bold text-xs text-white line-clamp-2 mb-1 leading-snug">
                    {product.name}
                  </h4>
                  <p className="text-[10px] text-[#8B8B95] mb-2">{product.category}</p>

                  <div className="flex items-baseline justify-between pt-2 border-t border-[#26262B]">
                    <span className="font-sora text-sm font-extrabold text-white">
                      {formatBRL(product.suggestedPrice)}
                    </span>
                    <span className="text-[10px] text-[#8B8B95]">Custo: {formatBRL(product.costPrice)}</span>
                  </div>
                </div>

                {/* Selection Action Button */}
                <div className="pt-3 mt-2 border-t border-[#26262B]">
                  <button
                    onClick={(e) => handleToggleSelectProduct(product.id, e)}
                    className={`w-full h-8 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-[#1769FF] text-white'
                        : 'bg-[#18181B] text-[#8DBBFF] hover:bg-[#26262B]'
                    }`}
                  >
                    {isSelected ? <CheckCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {isSelected ? 'Selecionado ✓' : 'Selecionar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Grid}
          title="Nenhum produto encontrado"
          description="Tente ajustar sua busca ou filtro de categoria."
        />
      )}

      {/* Floating Selection Bar per section 14.6 */}
      {selectedProductIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#111113] border border-[#3D8BFF]/50 p-4 rounded-2xl shadow-2xl flex items-center gap-4 text-xs max-w-xl w-full mx-4 backdrop-blur-md">
          <span className="font-sora font-bold text-white">
            {selectedProductIds.size} selecionado(s)
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                showToast({
                  type: 'info',
                  title: 'Produtos DEMO não podem ser publicados',
                  message: 'Importe seus produtos reais por CSV/API para publicar no Mercado Livre.',
                });
              }}
              className="btn-primary h-9 px-4 text-xs font-semibold"
            >
              Cadastrar no Mercado Livre
            </button>
            <button
              onClick={() => setSelectedProductIds(new Set())}
              className="btn-ghost h-9 px-3 text-xs text-[#8B8B95]"
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <Modal
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          description={`SKU: ${selectedProduct.sku} • Categoria: ${selectedProduct.category}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-square bg-[#18181B] rounded-2xl overflow-hidden border border-[#26262B]">
                <img
                  src={selectedProduct.photos[0]?.url}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#18181B] rounded-xl border border-[#26262B] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#8B8B95]">Preço Sugerido:</span>
                    <span className="font-sora font-bold text-white text-base">{formatBRL(selectedProduct.suggestedPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B8B95]">Custo do Fornecedor:</span>
                    <span className="text-white font-medium">{formatBRL(selectedProduct.costPrice)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#26262B] pt-2">
                    <span className="text-[#8B8B95]">Margem Estimada:</span>
                    <span className="text-[#2FBF71] font-bold text-sm">{selectedProduct.marginPct}%</span>
                  </div>
                </div>

                {/* Supplier card */}
                <div className="p-4 bg-[#18181B] rounded-xl border border-[#26262B] space-y-1">
                  <span className="text-[10px] font-bold text-[#3D8BFF] uppercase">Fornecedor Vinculado</span>
                  <p className="font-sora font-bold text-white">{selectedProduct.supplierName}</p>
                  <p className="text-[#8B8B95]">Prazo de postagem: {selectedProduct.shipping.handlingDays} dia útil</p>
                </div>
              </div>
            </div>

            <p className="text-[#C9C9CF] leading-relaxed bg-[#18181B] p-4 rounded-xl border border-[#26262B]">
              {selectedProduct.description}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
