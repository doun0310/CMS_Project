import React, { useState, useRef, useEffect } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconSearch, IconX } from './Icons';

interface TagSearchFilterProps {
  allLabels: string[];
  labelCounts: Record<string, number>;
}

export const TagSearchFilter: React.FC<TagSearchFilterProps> = ({ allLabels, labelCounts }) => {
  const { selectedLabels, toggleSelectedLabel, t } = useAether();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredLabels = allLabels.filter(lbl =>
    lbl.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="tag-search-filter-container" ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div className="tag-search-input-wrapper flex-center gap-1" style={{ position: 'relative' }}>
        <IconSearch size={14} color="var(--text-secondary)" style={{ position: 'absolute', left: '8px', pointerEvents: 'none' }} />
        <input
          type="text"
          className="tag-search-input"
          placeholder={`${t('filterByTag')}...`}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          style={{
            background: 'var(--bg-secondary, rgba(255, 255, 255, 0.05))',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '4px 10px 4px 26px',
            fontSize: '0.78rem',
            color: 'var(--text-primary)',
            outline: 'none',
            width: '130px',
            transition: 'all 0.2s ease',
          }}
        />
        {query && (
          <button
            className="btn-icon-xs"
            onClick={() => setQuery('')}
            style={{ position: 'absolute', right: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <IconX size={12} />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="tag-search-popover glass-modal animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            width: '200px',
            maxHeight: '220px',
            overflowY: 'auto',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          }}
        >
          {filteredLabels.length === 0 ? (
            <div style={{ padding: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {t('none')}
            </div>
          ) : (
            filteredLabels.map(lbl => {
              const isSelected = selectedLabels.includes(lbl);
              const count = labelCounts[lbl] || 0;
              return (
                <div
                  key={lbl}
                  className={`tag-search-item flex-between ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    toggleSelectedLabel(lbl);
                  }}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: isSelected ? 'var(--color-in-progress, #6366f1)' : 'var(--text-primary)',
                    fontWeight: isSelected ? 600 : 400,
                    marginBottom: '2px',
                  }}
                >
                  <span>#{lbl}</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>({count})</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
