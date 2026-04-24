import React from 'react';

export default function DetailModal({ item, fields, onClose, onEdit, onDelete, title }) {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title || 'Details'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {fields.map((field) => (
            <div key={field.key} className="detail-field">
              <label className="detail-label">{field.label}</label>
              <div className="detail-value">
                {field.key === 'url' && item[field.key] ? (
                  <a href={item[field.key]} target="_blank" rel="noopener noreferrer">
                    {item[field.key]}
                  </a>
                ) : (
                  item[field.key] || 'N/A'
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={() => onEdit(item)}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={() => onDelete(item.id)}>
            Delete
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
