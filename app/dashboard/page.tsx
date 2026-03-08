'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
const API = 'https://retail-ai-backend-production.up.railway.app';
interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  in_stock: boolean;
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState('');
  const [form, setForm] = useState({ name: '', price: '', quantity: '' });
  const router = useRouter();

  const fetchProducts = async () => {
    const res = await axios.get(`${API}/products`);
    setProducts(res.data);
    setLoading(false);
  };

 const uploadCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    await axios.post(`${API}/products/upload-csv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    alert('Products uploaded successfully!');
    fetchProducts();
  } catch {
    alert('Upload failed. Check your CSV format.');
  }

  e.target.value = '';
};
  const addProduct = async () => {
    if (!form.name || !form.price || !form.quantity) return;
    await axios.post(`${API}/products`, {
      name: form.name,
      price: Number(form.price),
      quantity: Number(form.quantity),
    });
    setForm({ name: '', price: '', quantity: '' });
    setShowModal(false);
    fetchProducts();
  };

  const savePrice = async (id: string) => {
    await axios.patch(`${API}/products/${id}`, { price: Number(editingPrice) });
    setEditingId(null);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await axios.delete(`${API}/products/${id}`);
    fetchProducts();
  };

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    return;
  }
  fetchProducts();
}, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8eaf0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>🏪 Pricepal Admin</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', marginTop: 2 }}>Manage your store inventory</p>
        </div>
<div style={{ display: 'flex', gap: 10 }}>
  <label
    style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
  >
    📤 Upload CSV
    <input type="file" accept=".csv" onChange={uploadCSV} style={{ display: 'none' }} />
  </label>
  <button
    onClick={() => setShowModal(true)}
    style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }}
  >
    + Add Product
  </button>
  <button
    onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}
    style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
  >
    Logout
  </button>
</div>

        
      </div>

      <div style={{ padding: '32px 40px' }}>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Products', value: products.length, color: '#4f46e5', bg: '#eef2ff', icon: '📦' },
            { label: 'In Stock', value: products.filter(p => p.in_stock).length, color: '#16a34a', bg: '#f0fdf4', icon: '✅' },
            { label: 'Out of Stock', value: products.filter(p => !p.in_stock).length, color: '#dc2626', bg: '#fef2f2', icon: '⚠️' },
          ].map(stat => (
            <div key={stat.label} style={{ flex: 1, background: '#fff', border: '1px solid #e8eaf0', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{stat.icon} {stat.label}</p>
              <p style={{ margin: '6px 0 0', fontSize: 32, fontWeight: 800, color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Product Name', 'Price (₦)', 'Quantity', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: '#6b7280', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', borderBottom: '1px solid #e8eaf0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>No products yet. Click "+ Add Product" to get started.</td></tr>
              ) : products.map((product, i) => (
                <tr key={product.id} style={{ borderTop: i === 0 ? 'none' : '1px solid #f3f4f6', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#111827', fontSize: 15 }}>{product.name}</td>
                  <td style={{ padding: '16px 20px' }}>
                    {editingId === product.id ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="number"
                          value={editingPrice}
                          onChange={e => setEditingPrice(e.target.value)}
                          style={{ border: '2px solid #4f46e5', borderRadius: 8, padding: '6px 10px', color: '#111', width: 90, fontSize: 14, outline: 'none' }}
                          autoFocus
                        />
                        <button onClick={() => savePrice(product.id)} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}>✕</button>
                      </div>
                    ) : (
                      <span
                        onClick={() => { setEditingId(product.id); setEditingPrice(String(product.price)); }}
                        style={{ cursor: 'pointer', color: '#4f46e5', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}
                        title="Click to edit price"
                      >
                        ₦{Number(product.price).toLocaleString()} <span style={{ fontSize: 12, opacity: 0.6 }}>✏️</span>
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#374151', fontWeight: 500 }}>{product.quantity} units</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      background: product.in_stock ? '#dcfce7' : '#fee2e2',
                      color: product.in_stock ? '#16a34a' : '#dc2626',
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700
                    }}>
                      {product.in_stock ? '● In Stock' : '● Out of Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 36, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#111827' }}>Add New Product</h2>
            {[
              { placeholder: 'Product name e.g. Panadol', key: 'name', type: 'text' },
              { placeholder: 'Price e.g. 500', key: 'price', type: 'number' },
              { placeholder: 'Quantity e.g. 100', key: 'quantity', type: 'number' },
            ].map(field => (
              <input
                key={field.key}
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.key as keyof typeof form]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 14, marginBottom: 12, boxSizing: 'border-box', outline: 'none', color: '#111' }}
              />
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                onClick={addProduct}
                style={{ flex: 1, background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
              >
                Add Product
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, background: '#f9fafb', color: '#6b7280', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: 14, fontSize: 15, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}