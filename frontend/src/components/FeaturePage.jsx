import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DetailModal from './DetailModal';
import FormModal from './FormModal';
import AIResponseDisplay from './AIResponseDisplay';

export default function FeaturePage({
  title,
  icon,
  apiEndpoint,
  fields,
  displayFields,
  cardTitleField,
  cardSubtitleField,
  cardDescField,
  aiFeature,
}) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiFormData, setAiFormData] = useState({});
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await axios.get(`/api/${apiEndpoint}`, { headers });
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
    setLoading(false);
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowDetail(false);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/api/${apiEndpoint}/${id}`, { headers });
      setItems(items.filter((i) => i.id !== id));
      setShowDetail(false);
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (formData.id) {
        const { data } = await axios.put(`/api/${apiEndpoint}/${formData.id}`, formData, { headers });
        setItems(items.map((i) => (i.id === data.id ? data : i)));
      } else {
        const { data } = await axios.post(`/api/${apiEndpoint}`, formData, { headers });
        setItems([data, ...items]);
      }
      setShowForm(false);
      setEditItem(null);
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  const handleAiSubmit = async () => {
    setAiLoading(true);
    setAiResponse('');
    try {
      const { data } = await axios.post(`/api/${apiEndpoint}/${aiFeature.endpoint}`, aiFormData, { headers });
      const responseKey = Object.keys(data)[0];
      setAiResponse(data[responseKey]);
    } catch (err) {
      setAiResponse('Error: ' + (err.response?.data?.error || 'Failed to get AI response'));
    }
    setAiLoading(false);
  };

  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return Object.values(item).some(
      (val) => typeof val === 'string' && val.toLowerCase().includes(search)
    );
  });

  return (
    <div className="feature-page">
      <div className="page-header">
        <div className="page-title">
          <span className="page-icon">{icon}</span>
          <div>
            <h1>{title}</h1>
            <p>{filteredItems.length} items</p>
          </div>
        </div>
        <div className="page-actions">
          {aiFeature && (
            <button className="btn btn-ai" onClick={() => setShowAiPanel(!showAiPanel)}>
              🤖 AI {aiFeature.label}
            </button>
          )}
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
            + New Item
          </button>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showAiPanel && aiFeature && (
        <div className="ai-panel">
          <div className="ai-panel-header">
            <h3>🤖 {aiFeature.label}</h3>
            <button className="btn-close" onClick={() => setShowAiPanel(false)}>&times;</button>
          </div>
          <div className="ai-panel-body">
            {aiFeature.fields.map((field) => (
              <div key={field.key} className="form-group">
                <label>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={aiFormData[field.key] || ''}
                    onChange={(e) => setAiFormData({ ...aiFormData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    rows={2}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={aiFormData[field.key] || ''}
                    onChange={(e) => setAiFormData({ ...aiFormData, [field.key]: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={aiFormData[field.key] || ''}
                    onChange={(e) => setAiFormData({ ...aiFormData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
            <button className="btn btn-ai" onClick={handleAiSubmit} disabled={aiLoading}>
              {aiLoading ? (
                <span className="loading-dots">Analyzing<span>.</span><span>.</span><span>.</span></span>
              ) : (
                `🤖 Get AI ${aiFeature.label}`
              )}
            </button>
          </div>
          {aiResponse && <AIResponseDisplay content={aiResponse} title={`AI ${aiFeature.label}`} />}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">{icon}</span>
          <h3>No items found</h3>
          <p>Get started by adding a new item or adjusting your search.</p>
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
            + Add First Item
          </button>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                {displayFields.map((f) => (
                  <th key={f.key}>{f.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => (
                <tr key={item.id} onClick={() => handleRowClick(item)} className="table-row-clickable">
                  <td>{idx + 1}</td>
                  {displayFields.map((f) => (
                    <td key={f.key}>
                      <span className={f.badge ? 'badge badge-' + (item[f.key]?.toLowerCase().replace(/\s+/g, '-') || 'default') : ''}>
                        {item[f.key]?.length > 80 ? item[f.key].substring(0, 80) + '...' : item[f.key] || 'N/A'}
                      </span>
                    </td>
                  ))}
                  <td>
                    <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(item)} title="Edit">✏️</button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(item.id)} title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDetail && selectedItem && (
        <DetailModal
          item={selectedItem}
          fields={fields}
          onClose={() => setShowDetail(false)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          title={selectedItem[cardTitleField] || title}
        />
      )}

      {showForm && (
        <FormModal
          item={editItem}
          fields={fields}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSave={handleSave}
          title={title}
        />
      )}
    </div>
  );
}
