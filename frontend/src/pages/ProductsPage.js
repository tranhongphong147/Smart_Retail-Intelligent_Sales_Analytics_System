import React, { useEffect, useState } from 'react';
import { Edit2, Plus, Search, Trash2, Filter, Package } from 'lucide-react';
import { getProducts, deleteProduct } from '../lib/api';
import { ErrorBlock, LoadingBlock } from '../components/ui/StateBlock';
import ProductModal from '../components/ui/ProductModal';

const categories = ['All', 'Beverage', 'Snack', 'Household', 'Electronics', 'Personal Care'];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const data = await getProducts(params);
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const handleSaveSuccess = () => {
    loadData();
    showToast(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try {
      await deleteProduct(id);
      loadData();
      showToast('Product deleted successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Product Catalog</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>Total {products.length} products in your store</p>
        </div>
        <button 
          onClick={openAddModal}
          style={{ 
          background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
          color: '#fff', 
          border: 'none', 
          padding: '10px 20px', 
          borderRadius: 12, 
          fontWeight: 600, 
          fontSize: 14,
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
        }}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Filters Section */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginBottom: 24, 
        background: '#fff', 
        padding: 16, 
        borderRadius: 16, 
        border: '1px solid #f3f4f6' 
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 12px 10px 40px', 
              borderRadius: 12, 
              border: '1px solid #e5e7eb', 
              fontSize: 14,
              outline: 'none',
              background: '#f9fafb'
            }} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={18} color="#9ca3af" />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ 
              padding: '10px 16px', 
              borderRadius: 12, 
              border: '1px solid #e5e7eb', 
              fontSize: 14,
              outline: 'none',
              background: '#f9fafb',
              cursor: 'pointer'
            }}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Data Table Section */}
      {error && <ErrorBlock message={error} />}
      
      {isLoading ? (
        <LoadingBlock height={300} />
      ) : (
        <div style={{ 
          background: '#fff', 
          borderRadius: 16, 
          border: '1px solid #f3f4f6', 
          overflow: 'hidden' 
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>Product Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Cost Price</th>
                <th style={thStyle}>Selling Price</th>
                <th style={thStyle}>Min Stock</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '60px 0', textAlign: 'center', color: '#9ca3af' }}>
                    <Package size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                    <p>No products found matching your search.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} style={trStyle}>
                    <td style={tdStyle}><span style={{ fontFamily: 'monospace', color: '#6366f1', fontWeight: 600 }}>{product.sku}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 500, color: '#1f2937' }}>{product.name}</td>
                    <td style={tdStyle}>
                      <span style={{ 
                        background: '#f3f4f6', 
                        padding: '4px 10px', 
                        borderRadius: 999, 
                        fontSize: 12, 
                        color: '#4b5563' 
                      }}>{product.category}</span>
                    </td>
                    <td style={tdStyle}>{Number(product.cost_price).toLocaleString()}đ</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#10b981' }}>{Number(product.selling_price).toLocaleString()}đ</td>
                    <td style={tdStyle}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 8, 
                        background: '#fff7ed', 
                        color: '#ea580c', 
                        fontSize: 12, 
                        fontWeight: 600,
                        border: '1px solid #ffedd5'
                      }}>{product.min_stock_level} unit</span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button 
                          onClick={() => openEditModal(product)}
                          style={actionBtnStyle} 
                          title="Edit Item"
                        >
                          <Edit2 size={16} color="#6366f1" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          style={{ ...actionBtnStyle, background: '#fef2f2' }} 
                          title="Delete Item"
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={editingProduct} 
        onSave={handleSaveSuccess}
      />

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          padding: '12px 20px',
          borderRadius: 12,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 2000,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <div style={{ width: 20, height: 20, borderRadius: 999, background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
            {toast.type === 'error' ? '!' : '✓'}
          </div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '16px 20px',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: 0.5
};

const tdStyle = {
  padding: '16px 20px',
  fontSize: 14,
  color: '#4b5563',
  borderBottom: '1px solid #f3f4f6'
};

const trStyle = {
  transition: 'background 0.2s'
};

const actionBtnStyle = {
  border: 'none',
  background: '#eef2ff',
  padding: 8,
  borderRadius: 10,
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
  transition: 'transform 0.1s'
};
