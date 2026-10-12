import React from 'react';

export default function DetailModal({ item, fields, onClose, onEdit, onDelete, title }) {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-label={title||'Record details'} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title || 'Details'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {item.recordNotice&&<p>{item.recordNotice}</p>}
          {fields.map((field) => (
            <div key={field.key} className="detail-field">
              <label className="detail-label">{field.label}</label>
              <div className="detail-value">
                {field.key === 'url' && /^https?:\/\//i.test(item[field.key]||'') ? (
                  <a href={item[field.key]} target="_blank" rel="noopener noreferrer">
                    {item[field.key]}
                  </a>
                ) : (
                  item[field.key] === null || item[field.key] === undefined || item[field.key] === '' ? 'Not provided' : typeof item[field.key] === 'object' ? JSON.stringify(item[field.key]) : String(item[field.key])
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" disabled={item.canEdit===false} onClick={() => onEdit(item)}>
            Edit
          </button>
          <button className="btn btn-danger" disabled={item.canDelete===false} onClick={() => onDelete(item.id)}>
            Delete
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
