import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, XCircle } from 'lucide-react';
import { fetchWithAuth } from '../services/apiClient';
import { formatImageUrl } from '../utils/imageUrl';
import type { ProductApproval } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductApproval | null>(null);
  const [selectedImg, setSelectedImg] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProduct = React.useCallback(() => {
    setLoading(true);
    setLoadError(null);

    fetchWithAuth(`/products/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 403) throw new Error("You don't have permission to view this product.");
          if (res.status === 404) throw new Error('This product no longer exists.');
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Server returned ${res.status}.`);
        }
        return res.json();
      })
      .then((p) => {
        const rawImgs: string[] = Array.isArray(p.imageUrls) && p.imageUrls.length > 0
          ? p.imageUrls
          : [p.imageUrl || '/images/admin_avatar.png'];
        const formattedImgs = rawImgs.map((imgUrl) => formatImageUrl(imgUrl));

        const apiProduct: ProductApproval = {
          id: String(p.id),
          title: p.name || p.title || 'Product',
          artist: p.sellerName || p.seller?.fullName || p.seller?.username || p.artistName || p.artist?.fullName || p.artist?.username || 'Artist',
          category: p.productType || p.category || 'CLOTHING',
          price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
          imageUrl: formattedImgs[0],
          thumbnails: formattedImgs,
          status: p.status === 'APPROVED' ? 'Approved' : p.status === 'REJECTED' ? 'Rejected' : 'Pending',
          appliedDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '—',
          marketplaceTarget: 'Drop Store',
          dropLimit: p.stockQuantity ?? 0,
          materialDescription: p.description || 'No description provided.',
          sizes: p.sizeStock && Object.keys(p.sizeStock).length > 0 ? Object.keys(p.sizeStock) : (p.sizes || []),
          colors: Array.isArray(p.availableColors) && p.availableColors.length > 0 ? p.availableColors : (p.colors || []),
          sizeStock: p.sizeStock || {},
        };
        setProduct(apiProduct);
        setSelectedImg(apiProduct.imageUrl);
      })
      .catch((err: Error) => {
        setProduct(null);
        setLoadError(err.message || 'Could not reach the backend server.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!product) return;
    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(`/products/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      if (res.ok) {
        setProduct((prev) => (prev ? { ...prev, status: 'Approved' } : null));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to approve product: ${err.message || 'Server error'}`);
      }
    } catch (e) {
      alert('Error connecting to backend server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = () => {
    setRejectError('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectError('Rejection reason is mandatory before rejecting a product submission.');
      return;
    }
    setRejectError('');
    setIsSubmitting(true);

    try {
      const res = await fetchWithAuth(`/products/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'REJECTED', rejectionReason: rejectionReason.trim() }),
      });
      if (res.ok) {
        setShowRejectModal(false);
        setProduct((prev) => (prev ? { ...prev, status: 'Rejected' } : null));
      } else {
        const err = await res.json().catch(() => ({}));
        setRejectError(err.message || 'Failed to reject product.');
      }
    } catch (e) {
      setRejectError('Error connecting to backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) {
    return (
      <div className="page-container" style={{ maxWidth: 960 }}>
        <button
          className="btn-clear flex-align"
          style={{ gap: 6, padding: 0, marginBottom: 16, color: 'var(--text-muted)' }}
          onClick={() => navigate('/product-approvals')}
        >
          <ArrowLeft size={16} />
          <span>Back to Product Approvals</span>
        </button>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
            Loading product details...
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              padding: '14px 18px',
              borderRadius: 8,
              fontSize: 13,
              border: '1px solid #FCA5A5',
            }}
          >
            <span>⚠️ {loadError || 'Product details are unavailable.'}</span>
            <button
              onClick={loadProduct}
              style={{
                background: '#DC2626',
                color: '#FFF',
                border: 'none',
                borderRadius: 6,
                padding: '4px 12px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 12,
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

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

        <span className={`status-badge status-${(product?.status || 'Pending').toLowerCase()}`} style={{ fontSize: 13, padding: '6px 16px' }}>
          {product?.status || 'Pending'}
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

            {/* Sizes & Items per Size */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="detail-section">
                <label className="detail-label">Submitted Size & Quantity Breakdown</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {product.sizes.map((sz) => {
                    const qty = product.sizeStock ? product.sizeStock[sz] : undefined;
                    return (
                      <div
                        key={sz}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 10,
                          border: '1px solid #E5E7EB',
                          background: selectedSize === sz ? '#7126D0' : '#FFFFFF',
                          color: selectedSize === sz ? '#FFFFFF' : '#111827',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 13,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}
                        onClick={() => setSelectedSize(sz)}
                      >
                        <span style={{ fontWeight: 700 }}>Size {sz}</span>
                        <span
                          style={{
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 12,
                            background: selectedSize === sz ? 'rgba(255,255,255,0.25)' : '#EEF2FF',
                            color: selectedSize === sz ? '#FFFFFF' : '#4F46E5',
                            fontWeight: 700,
                          }}
                        >
                          {qty !== undefined ? `${qty} items` : '0 items'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="detail-section">
                <label className="detail-label">Available Colors</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {product.colors.map((c, idx) => {
                    const COLOR_NAME_MAP: Record<string, string> = {
                      '#000000': 'Black',
                      '#FFFFFF': 'White',
                      '#FF0000': 'Red',
                      '#0000FF': 'Blue',
                      '#008000': 'Green',
                      '#800080': 'Purple',
                      '#FFD700': 'Gold',
                      '#C0C0C0': 'Silver',
                      '#FFC0CB': 'Pink',
                      'BLACK': 'Black',
                      'WHITE': 'White',
                      'RED': 'Red',
                      'BLUE': 'Blue',
                      'GREEN': 'Green',
                      'PURPLE': 'Purple',
                      'GOLD': 'Gold',
                      'SILVER': 'Silver',
                      'PINK': 'Pink',
                    };
                    const upper = (c || '').toUpperCase();
                    const colorName = COLOR_NAME_MAP[upper] || c;
                    const colorHex = upper.startsWith('#')
                      ? upper
                      : upper === 'BLACK' ? '#000000'
                      : upper === 'WHITE' ? '#FFFFFF'
                      : upper === 'RED' ? '#EF4444'
                      : upper === 'BLUE' ? '#3B82F6'
                      : upper === 'GREEN' ? '#10B981'
                      : upper === 'PURPLE' ? '#8B5CF6'
                      : upper === 'GOLD' ? '#F59E0B'
                      : upper === 'SILVER' ? '#9CA3AF'
                      : upper === 'PINK' ? '#EC4899'
                      : '#6B7280';

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 20,
                          border: '1px solid #E5E7EB',
                          background: '#FFFFFF',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#111827',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}
                      >
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            backgroundColor: colorHex,
                            border: colorHex.toLowerCase() === '#ffffff' ? '1px solid #D1D5DB' : 'none',
                            display: 'inline-block',
                          }}
                        />
                        <span>{colorName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons / Status Banner */}
          <div className="modal-actions" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            {product.status === 'Approved' || (product.status as string) === 'APPROVED' ? (
              <div style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 10,
                backgroundColor: '#ECFDF5',
                border: '1px solid #10B981',
                color: '#065F46',
                fontWeight: 700,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
                <Check size={18} color="#10B981" />
                <span>Product Approved & Published to Shop</span>
              </div>
            ) : product.status === 'Rejected' || (product.status as string) === 'REJECTED' ? (
              <div style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 10,
                backgroundColor: '#FEF2F2',
                border: '1px solid #EF4444',
                color: '#991B1B',
                fontWeight: 700,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
                <XCircle size={18} color="#EF4444" />
                <span>Product Submission Rejected</span>
              </div>
            ) : (
              <>
                <button className="btn-approve" onClick={handleApprove} disabled={isSubmitting}>
                  <Check size={16} />
                  <span>{isSubmitting ? 'Approving...' : 'Approve Release'}</span>
                </button>

                <button className="btn-reject" onClick={handleRejectClick} disabled={isSubmitting}>
                  <XCircle size={16} />
                  <span>Reject Drop</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Rejection Reason Modal */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            width: '100%',
            maxWidth: 500,
            padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
              Reject Product Submission
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
              Please state the exact reason for rejecting <strong>"{product.title}"</strong>. This note will be sent directly to the creator.
            </p>

            <textarea
              rows={4}
              placeholder="e.g. Image resolution is too low, missing explicit size breakdown details..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 10,
                border: '1px solid #D1D5DB',
                fontSize: 14,
                color: '#111827',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />

            {rejectError && (
              <p style={{ fontSize: 12, color: '#DC2626', marginTop: 8, fontWeight: 600 }}>
                ⚠️ {rejectError}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReject}
                disabled={isSubmitting}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Declining...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
