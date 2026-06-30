import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, FolderOpen, ExternalLink, Search } from 'lucide-react';

interface CategoryNode {
  id: string;
  name: string;
  nameAr?: string;
  icon?: string;
  description?: string;
  sourceUrl?: string;
  children?: CategoryNode[];
  topics?: string[];
}

function CategoryItem({ node, depth = 0 }: { node: CategoryNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const navigate = useNavigate();
  const hasChildren = node.children && node.children.length > 0;
  const hasTopics = node.topics && node.topics.length > 0;

  return (
    <div style={{ marginLeft: depth > 0 ? '16px' : 0 }}>
      <div
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          else if (node.id) navigate(`/books?category=${encodeURIComponent(node.name)}`);
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
          background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)',
          marginBottom: '6px', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  : <ChevronRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        ) : (
          <FolderOpen size={16} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: depth === 0 ? '15px' : '14px', fontWeight: depth === 0 ? 700 : 500, color: 'var(--color-text-primary)' }}>
            {node.name}
          </div>
          {node.description && (
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {node.description}
            </div>
          )}
        </div>
        {hasChildren && (
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', background: 'var(--color-bg-card)', padding: '2px 8px', borderRadius: '100px' }}>
            {node.children!.length}
          </span>
        )}
        {hasTopics && !hasChildren && (
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', background: 'var(--color-bg-card)', padding: '2px 8px', borderRadius: '100px' }}>
            {node.topics!.length} тем
          </span>
        )}
      </div>

      {/* Topics */}
      {expanded && hasTopics && (
        <div style={{ marginLeft: '16px', marginBottom: '6px' }}>
          {node.topics!.map((topic, i) => (
            <div
              key={i}
              onClick={() => navigate(`/books?q=${encodeURIComponent(topic)}`)}
              style={{
                padding: '8px 12px', fontSize: '13px', color: 'var(--color-text-secondary)',
                cursor: 'pointer', borderRadius: '8px', transition: 'background 0.15s',
                borderBottom: i < node.topics!.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {topic}
            </div>
          ))}
        </div>
      )}

      {/* Children */}
      {expanded && hasChildren && (
        <div style={{ marginTop: '4px' }}>
          {node.children!.map(child => (
            <CategoryItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTreePage() {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('./data/category-tree.json')
      .then(r => r.json())
      .then(data => setTree(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return tree;
    const q = search.toLowerCase();
    return tree.filter(node =>
      node.name.toLowerCase().includes(q) ||
      node.description?.toLowerCase().includes(q) ||
      node.children?.some(c => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
    );
  }, [tree, search]);

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
          📚 Категории
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Древовидная структура разделов библиотеки
        </p>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
        background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
        borderRadius: '10px', padding: '8px 14px',
      }}>
        <Search size={15} style={{ color: 'var(--color-text-muted)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по категориям..."
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '14px' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Ничего не найдено</div>
      ) : (
        <div>
          {filtered.map(node => (
            <CategoryItem key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}
