import React, { useState } from 'react';
import { X, Check, XCircle } from 'lucide-react';
import type { ProductApproval } from '../../types';

interface ProductDetailModalProps {
  product: ProductApproval | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!product) return null;

  const [selectedImg, setSelectedImg] = useState(product.imageUrl);
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] || product.sizes[0]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">Submission Review</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Hero Image */}
        <div className="product-hero-wrap">
          <img src={selectedImg || product.imageUrl} alt={product.title} className="product-hero-img" />
        </div>

        {/* Thumbnails Row */}
        {product.thumbnails && product.thumbnails.length > 0 && (
          <div className="thumbnails-row">
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

        {/* Product Info Row */}
        <div className="product-info-head">
          <div>
            <h3 className="product-main-title">{product.title}</h3>
            <span className="product-artist-by">by {product.artist}</span>
          </div>
          <div className="product-main-price">${product.price.toFixed(2)}</div>
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

        {/* Action Buttons */}
        <div className="modal-actions">
          <button
            className="btn-approve"
            onClick={() => {
              onApprove(product.id);
              onClose();
            }}
          >
            <Check size={16} />
            <span>Approve Release</span>
          </button>

          <button
            className="btn-reject"
            onClick={() => {
              onReject(product.id);
              onClose();
            }}
          >
            <XCircle size={16} />
            <span>Reject Drop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
