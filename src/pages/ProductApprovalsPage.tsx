import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Filter, Calendar, LayoutGrid, List } from 'lucide-react';
import type { ProductApproval } from '../types';
import { fetchWithAuth } from '../services/apiClient';
import { formatImageUrl } from '../utils/imageUrl';

export const ProductApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductApproval[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadProducts = () => {
    setLoading(true);
    setError(null);
    fetchWithAuth('/products')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const apiProducts: ProductApproval[] = data.map((p: any) => {
            const rawImgs: string[] = Array.isArray(p.imageUrls) && p.imageUrls.length > 0
              ? p.imageUrls
              : [p.imageUrl || '/images/admin_avatar.png'];
            const formattedImgs = rawImgs.map((imgUrl) => formatImageUrl(imgUrl));

            return {
              id: String(p.id),
              title: p.name || p.title || 'Product',
              artist: p.sellerName || p.seller?.fullName || p.seller?.username || p.artistName || p.artist?.fullName || p.artist?.username || 'Artist',
              category: p.productType || p.category || 'CLOTHING',
              price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
              imageUrl: formattedImgs[0],
              thumbnails: formattedImgs,
              status: p.status === 'APPROVED' ? 'Approved' : p.status === 'REJECTED' ? 'Rejected' : 'Pending',
              appliedDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '2026-01-01',
              marketplaceTarget: 'Drop Store',
              dropLimit: p.stockQuantity || 100,
              materialDescription: p.description || 'Premium material',
              sizes: p.sizeStock && Object.keys(p.sizeStock).length > 0 ? Object.keys(p.sizeStock) : (p.sizes || ['S', 'M', 'L', 'XL']),
              colors: Array.isArray(p.availableColors) && p.availableColors.length > 0 ? p.availableColors : (p.colors || ['Black', 'White']),
              sizeStock: p.sizeStock || {},
            };
          });
          setProducts(apiProducts);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Could not load products:', err);
        setError('Could not connect to products service. Backend may be waking up.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="page-container">
      {/* Header Row */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Content & Merchandise Validation</h1>
          <p className="page-subtitle">Approve physical clothing drops, merchandise, or soundpacks submitted by creators.</p>
        </div>
        <button className="btn-primary">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      {/* Filter Card */}
      <div className="table-filter-card">
        <div className="filter-left">
          <div className="filter-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search products by name, creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-right">
          {/* Category Dropdown */}
          <div className="select-wrap">
            <Filter size={14} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">Category: All</option>
              <option value="CLOTHING">Clothing & Drops</option>
              <option value="MUSIC">Music & Audio</option>
              <option value="AUCTION">Auction Items</option>
              <option value="MERCH">Merchandise</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="select-wrap">
            <Calendar size={14} />
            <select defaultValue="All Time">
              <option>Submitted: All Time</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="view-toggle-wrap">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

          <button className="btn-clear" onClick={() => { setSearchQuery(''); setCategoryFilter('All'); }}>
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            border: '1px solid #FCD34D',
          }}
        >
          <span>⚠️ {error}</span>
          <button
            onClick={loadProducts}
            style={{
              background: '#D97706',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 12px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '12px',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="page-container flex-center" style={{ minHeight: 250, flexDirection: 'column', gap: 12 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #E5E7EB', borderTopColor: '#7126D0', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading products from backend...</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="product-grid">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">No products found matching filters.</div>
          ) : (
            paginatedProducts.map((prod) => (
              <div
                key={prod.id}
                className="product-card"
                onClick={() => navigate(`/product-approvals/${prod.id}`)}
              >
                <div className="card-thumb-wrap">
                  <img src={prod.imageUrl} alt={prod.title} className="card-thumb" />
                  <span className="card-cat-badge">{prod.category}</span>
                </div>
                <div className="card-body">
                  <div className="card-title-row">
                    <h4 className="card-prod-title">{prod.title}</h4>
                    <span className="card-prod-price">${prod.price.toFixed(2)}</span>
                  </div>
                  <div className="card-prod-artist">by {prod.artist}</div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* List View (Image 6) */
        <div className="product-list">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">No products found matching filters.</div>
          ) : (
            paginatedProducts.map((prod) => (
              <div
                key={prod.id}
                className="product-list-row"
                onClick={() => navigate(`/product-approvals/${prod.id}`)}
              >
                <img src={prod.imageUrl} alt={prod.title} className="list-row-thumb" />
                <div className="list-row-info">
                  <h4 className="list-row-title">{prod.title}</h4>
                  <span className="list-row-artist">by {prod.artist}</span>
                </div>
                <div className="list-row-price">${prod.price.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Dynamic Pagination Footer */}
      {filteredProducts.length > 0 && (
        <div className="table-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', marginTop: 20, background: '#fff', borderRadius: 12 }}>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} items
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              className="btn-page-nav"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </button>
            <div className="page-numbers" style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`page-num ${pageNum === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid #e5e7eb',
                    background: pageNum === currentPage ? '#7126D0' : '#fff',
                    color: pageNum === currentPage ? '#fff' : '#374151',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: pageNum === currentPage ? 600 : 400,
                  }}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              className="btn-page-nav"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
