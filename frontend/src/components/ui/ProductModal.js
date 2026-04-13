import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { createProduct, updateProduct } from '../../lib/api';

export default function ProductModal({ isOpen, onClose, product, onSave }) {
  const isEdit = !!product?.id;
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Beverage',
    cost_price: 0,
    selling_price: 0,
    min_stock_level: 5,
    initial_quantity: 0
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        initial_quantity: product.current_quantity || 0
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        category: 'Beverage',
        cost_price: 0,
        selling_price: 0,
        min_stock_level: 5,
        initial_quantity: 0
      });
    }
    setError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    if (!formData.sku || !formData.name) return 'SKU and Name are required.';
    if (formData.cost_price < 0 || formData.selling_price < 0) return 'Prices cannot be negative.';
    if (formData.cost_price > formData.selling_price) return 'Warning: Cost price is higher than selling price.';
    if (formData.min_stock_level < 0) return 'Min stock level cannot be negative.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError && !validationError.startsWith('Warning')) {
      setError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      if (isEdit) {
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        {/* Modal Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          {error && (
            <div style={errorContainerStyle}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={gridStyle}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Product Name</label>
              <input 
                style={inputStyle} 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Coca Cola 330ml"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>SKU / Barcode</label>
              <input 
                style={inputStyle} 
                value={formData.sku} 
                onChange={e => setFormData({...formData, sku: e.target.value})}
                placeholder="SKU-XXXX"
                disabled={isEdit}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Category</label>
              <select 
                style={inputStyle} 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Beverage">Beverage</option>
                <option value="Snack">Snack</option>
                <option value="Household">Household</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Cost Price (đ)</label>
              <input 
                type="number"
                style={inputStyle} 
                value={formData.cost_price} 
                onChange={e => setFormData({...formData, cost_price: Number(e.target.value)})}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Selling Price (đ)</label>
              <input 
                type="number"
                style={inputStyle} 
                value={formData.selling_price} 
                onChange={e => setFormData({...formData, selling_price: Number(e.target.value)})}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Min Stock Level</label>
              <input 
                type="number"
                style={inputStyle} 
                value={formData.min_stock_level} 
                onChange={e => setFormData({...formData, min_stock_level: Number(e.target.value)})}
              />
            </div>

            {!isEdit && (
              <div>
                <label style={labelStyle}>Initial Stock</label>
                <input 
                  type="number"
                  style={inputStyle} 
                  value={formData.initial_quantity} 
                  onChange={e => setFormData({...formData, initial_quantity: Number(e.target.value)})}
                />
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div style={footerStyle}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={isSaving} style={saveBtnStyle}>
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Styles
const backdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(4px)',
  display: 'grid',
  placeItems: 'center',
  zIndex: 1000,
  padding: 20
};

const modalStyle = {
  background: '#fff',
  width: '100%',
  maxWidth: 550,
  borderRadius: 20,
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  overflow: 'hidden',
  animation: 'modalSlideIn 0.3s ease-out'
};

const headerStyle = {
  padding: '20px 24px',
  borderBottom: '1px solid #f3f4f6',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const footerStyle = {
  marginTop: 32,
  paddingTop: 20,
  borderTop: '1px solid #f3f4f6',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 12
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px 20px'
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s',
  background: '#f9fafb'
};

const saveBtnStyle = {
  padding: '10px 24px',
  borderRadius: 12,
  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
  color: '#fff',
  border: 'none',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)'
};

const cancelBtnStyle = {
  padding: '10px 24px',
  borderRadius: 12,
  background: '#f3f4f6',
  color: '#4b5563',
  border: 'none',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer'
};

const closeBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#9ca3af',
  cursor: 'pointer',
  padding: 4,
  display: 'grid',
  placeItems: 'center',
  borderRadius: 8,
  transition: 'background 0.2s'
};

const errorContainerStyle = {
  background: '#fef2f2',
  color: '#dc2626',
  padding: '12px 16px',
  borderRadius: 12,
  marginBottom: 20,
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  border: '1px solid #fee2e2'
};
