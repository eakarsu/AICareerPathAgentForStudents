import React, { useState, useEffect } from 'react';

export default function FormModal({ item, fields, onClose, onSave, title }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      const empty = {};
      fields.forEach(f => { empty[f.key] = ''; });
      setFormData(empty);
    }
  }, [item, fields]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? `Edit ${title}` : `New ${title}`}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {fields.map((field) => (
              <div key={field.key} className="form-group">
                <label>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    rows={3}
                    placeholder={field.placeholder || ''}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder || ''}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              {item ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
