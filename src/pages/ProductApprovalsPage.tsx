import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Filter, Calendar, LayoutGrid, List } from 'lucide-react';
import { INITIAL_PRODUCT_APPROVALS } from '../data/mockAdminData';
import type { ProductApproval } from '../types';

export const ProductApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductApproval[]>(INITIAL_PRODUCT_APPROVALS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiProducts: ProductApproval[] = data.map((p: any) => ({
            id: String(p.id),
            title: p.name || p.title || 'Product',
            artist: p.artistName || p.artist?.fullName || 'Artist',
            category: p.productType || p.category || 'CLOTHING',
            price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
            imageUrl: Array.isArray(p.imageUrls) && p.imageUrls.length > 0 ? p.imageUrls[0] : '/images/admin_avatar.png',
            thumbnails: Array.isArray(p.imageUrls) && p.imageUrls.length > 0 ? p.imageUrls : ['/images/admin_avatar.png'],
            status: p.status === 'APPROVED' ? 'Approved' : p.status === 'REJECTED' ? 'Rejected' : 'Pending',
            appliedDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '2026-01-01',
            marketplaceTarget: 'Drop Store',
            dropLimit: p.stockQuantity || 100,
            materialDescription: p.description || 'Premium material',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['#000000', '#FFFFFF'],
          }));
          setProducts(apiProducts);
        }
      })
      .catch(() => {
        // Fallback to initial mock data
      });
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">Category: All</option>
              <option value="CLOTHING">Clothing</option>
              <option value="MUSIC">Music</option>
              <option value="AUCTION">Auction</option>
              <option value="MERCH">Merch</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="select-wrap">
            <Calendar size={14} />
            <select defaultValue="All Time">
              <option>Joined: All Time</option>
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

      {/* Grid View (Image 5) */}
      {viewMode === 'grid' ? (
        <div className="product-grid">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">No products found matching filters.</div>
          ) : (
            filteredProducts.map((prod) => (
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
            filteredProducts.map((prod) => (
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
    </div>
  );
};
