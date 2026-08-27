import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, XCircle } from 'lucide-react';
import { INITIAL_PRODUCT_APPROVALS } from '../data/mockAdminData';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState(INITIAL_PRODUCT_APPROVALS);
  const product = products.find((p) => p.id === id) || products[0];

  const [selectedImg, setSelectedImg] = useState(product?.imageUrl);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[1] || product?.sizes?.[0]);

  if (!product) {
    return (
      <div className="page-container">
        <button className="btn-clear flex-align" onClick={() => navigate('/product-approvals')}>
          <ArrowLeft size={16} />
          <span>Back to Product Approvals</span>
        </button>
        <div className="empty-state">Product submission not found.</div>
      </div>
    );
  }

  const handleApprove = () => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, status: 'Approved' } : p)));
  };

  const handleReject = () => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, status: 'Rejected' } : p)));
  };

  return (
    <div className="page-container" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <button
            className="btn-clear flex-align"
            style={{ gap: 6, padding: 0, marginBottom: 8, color: 'var(--text-muted)' }}
            onClick={() => navigate('/product-approvals')}
          >
            <ArrowLeft size={16} />
            <span>Back to Product Approvals</span>
          </button>
          <h1 className="page-title">Submission Review</h1>
          <p className="page-subtitle">Inspect product imagery, drop limits, materials, and validate release.</p>
        </div>

        <span className={`status-badge status-${product.status.toLowerCase()}`} style={{ fontSize: 13, padding: '6px 16px' }}>
          {product.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 24 }}>
        {/* Left Side: Images */}
        <div className="card-box">
          <div className="product-hero-wrap" style={{ height: 320 }}>
            <img src={selectedImg || product.imageUrl} alt={product.title} className="product-hero-img" />
          </div>

          {product.thumbnails && product.thumbnails.length > 0 && (
            <div className="thumbnails-row" style={{ justifyContent: 'center' }}>
              {product.thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  className={`thumb-btn ${selectedImg === thumb ? 'active' : ''}`}
                  onClick={() => setSelectedImg(thumb)}
                >
                  <img src={thumb} alt={`Preview ${idx}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details & Actions */}
        <div className="card-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="product-info-head">
              <div>
                <h2 className="product-main-title" style={{ fontSize: 22 }}>{product.title}</h2>
                <span className="product-artist-by" style={{ fontSize: 14 }}>by {product.artist}</span>
              </div>
              <div className="product-main-price" style={{ fontSize: 22 }}>${product.price.toFixed(2)}</div>
            </div>

            {/* Marketplace Target */}
            <div className="detail-section">
              <label className="detail-label">Marketplace Target</label>
              <div className="target-pill-row">
                <span className="category-badge">{product.category}</span>
                <span className="limit-text">Drop Limit: {product.dropLimit} items</span>
              </div>
            </div>

            {/* Material Description */}
            <div className="detail-section">
              <label className="detail-label">Material Description</label>
              <p className="detail-statement">"{product.materialDescription}"</p>
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="detail-section">
                <label className="detail-label">Sizes</label>
                <div className="size-pills">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      className={`size-btn ${selectedSize === sz ? 'active' : ''}`}
                      onClick={() => setSelectedSize(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="detail-section">
                <label className="detail-label">Colors</label>
                <div className="color-swatches">
                  {product.colors.map((c, idx) => (
                    <span
                      key={idx}
                      className="color-swatch"
                      style={{ backgroundColor: c }}
                      title={c}
                    ></span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="modal-actions" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <button className="btn-approve" onClick={handleApprove}>
              <Check size={16} />
              <span>Approve Release</span>
            </button>

            <button className="btn-reject" onClick={handleReject}>
              <XCircle size={16} />
              <span>Reject Drop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
