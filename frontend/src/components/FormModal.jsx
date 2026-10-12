import React, { useState, useEffect } from 'react';

export default function FormModal({ item, fields, onClose, onSave, title, saving=false, error }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (item) {
      setFormData(Object.fromEntries(fields.filter(f=>!f.readOnly).map(f=>[f.key,item[f.key]??''])));
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
      <div className="modal-content" role="dialog" aria-modal="true" aria-label={item?`Edit ${title}`:`New ${title}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? `Edit ${title}` : `New ${title}`}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {fields.filter(field=>!field.readOnly).map((field) => (
              <div key={field.key} className="form-group">
                <label htmlFor={`record-${field.key}`}>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={`record-${field.key}`} name={field.key} disabled={saving} value={formData[field.key] ?? ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    rows={3}
                    placeholder={field.placeholder || ''}
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={`record-${field.key}`} name={field.key} disabled={saving} value={formData[field.key] ?? ''}
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
                    id={`record-${field.key}`} name={field.key} disabled={saving} value={formData[field.key] ?? ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder || ''}
                  />
                )}
              </div>
            ))}
          </div>
          {error&&<div className="error-message" role="alert">{error}</div>}
          <div className="modal-actions">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving?'Saving…':item ? 'Update' : 'Create'}
            </button>
            <button type="button" disabled={saving} className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
