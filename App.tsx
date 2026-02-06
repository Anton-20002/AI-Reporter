import React, { useEffect, useMemo, useState } from 'react';
import { createItem, getItems, postMovement } from './services/warehouseApi';

export type StockStatus = 'OK' | 'LOW' | 'OUT';

export interface WarehouseItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minThreshold: number;
  location: string;
  updatedAt: string;
}

const statusLabel: Record<StockStatus, string> = {
  OK: 'В наличии',
  LOW: 'Низкий остаток',
  OUT: 'Нет в наличии'
};

const getStatus = (item: WarehouseItem): StockStatus => {
  if (item.quantity <= 0) return 'OUT';
  if (item.quantity <= item.minThreshold) return 'LOW';
  return 'OK';
};

const App: React.FC = () => {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState('');

  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    category: 'Электроника',
    quantity: 0,
    minThreshold: 10,
    location: 'A-01'
  });

  const [movement, setMovement] = useState({
    itemId: '',
    delta: 0,
    reason: 'Поступление'
  });

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getItems();
      setItems(data);
      if (data.length && !movement.itemId) {
        setMovement((prev) => ({ ...prev, itemId: data[0].id }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const text = `${item.name} ${item.sku} ${item.category}`.toLowerCase();
        return text.includes(search.toLowerCase());
      }),
    [items, search]
  );

  const totals = useMemo(() => {
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const lowCount = items.filter((item) => getStatus(item) === 'LOW').length;
    const outCount = items.filter((item) => getStatus(item) === 'OUT').length;
    return { totalQty, lowCount, outCount };
  }, [items]);

  const handleCreateItem = async (event: React.FormEvent) => {
    event.preventDefault();
    await createItem(newItem);
    setNewItem({ ...newItem, sku: '', name: '', quantity: 0 });
    await loadItems();
  };

  const handleMovement = async (event: React.FormEvent) => {
    event.preventDefault();
    await postMovement(movement);
    await loadItems();
  };

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24, fontFamily: 'Inter, Arial, sans-serif' }}>
      <h1 style={{ marginBottom: 8 }}>Складской UI (React)</h1>
      <p style={{ marginTop: 0, color: '#475569' }}>
        Пример панели управления складом для backend на Java Spring + gRPC.
      </p>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 18 }}>
        <StatCard title="Всего SKU" value={String(items.length)} />
        <StatCard title="Общий остаток" value={String(totals.totalQty)} />
        <StatCard title="Риски" value={`${totals.lowCount + totals.outCount} позиций`} />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <form onSubmit={handleCreateItem} style={panelStyle}>
          <h3>Добавить товар</h3>
          <Input label="SKU" value={newItem.sku} onChange={(value) => setNewItem({ ...newItem, sku: value })} required />
          <Input label="Название" value={newItem.name} onChange={(value) => setNewItem({ ...newItem, name: value })} required />
          <Input label="Категория" value={newItem.category} onChange={(value) => setNewItem({ ...newItem, category: value })} />
          <Input label="Локация" value={newItem.location} onChange={(value) => setNewItem({ ...newItem, location: value })} />
          <Input
            label="Мин. остаток"
            type="number"
            value={String(newItem.minThreshold)}
            onChange={(value) => setNewItem({ ...newItem, minThreshold: Number(value) })}
          />
          <Input
            label="Начальный остаток"
            type="number"
            value={String(newItem.quantity)}
            onChange={(value) => setNewItem({ ...newItem, quantity: Number(value) })}
          />
          <button type="submit">Создать</button>
        </form>

        <form onSubmit={handleMovement} style={panelStyle}>
          <h3>Движение товара</h3>
          <label style={labelStyle}>
            Товар
            <select
              value={movement.itemId}
              onChange={(event) => setMovement({ ...movement, itemId: event.target.value })}
              style={inputStyle}
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.sku})
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Изменение (+/-)"
            type="number"
            value={String(movement.delta)}
            onChange={(value) => setMovement({ ...movement, delta: Number(value) })}
          />
          <Input label="Причина" value={movement.reason} onChange={(value) => setMovement({ ...movement, reason: value })} />
          <button type="submit">Применить</button>
        </form>
      </section>

      <section style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Остатки</h3>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по SKU/названию"
            style={{ ...inputStyle, width: 260 }}
          />
        </div>

        {loading && <p>Загрузка...</p>}
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

        {!loading && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['SKU', 'Наименование', 'Категория', 'Локация', 'Остаток', 'Статус', 'Обновлено'].map((head) => (
                  <th key={head} style={thStyle}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const status = getStatus(item);
                return (
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.sku}</td>
                    <td style={tdStyle}>{item.name}</td>
                    <td style={tdStyle}>{item.category}</td>
                    <td style={tdStyle}>{item.location}</td>
                    <td style={tdStyle}>{item.quantity}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: '2px 8px', borderRadius: 8, background: status === 'OK' ? '#dcfce7' : status === 'LOW' ? '#fef3c7' : '#fee2e2' }}>
                        {statusLabel[status]}
                      </span>
                    </td>
                    <td style={tdStyle}>{new Date(item.updatedAt).toLocaleString('ru-RU')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
};

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <article style={{ ...panelStyle, padding: 16 }}>
    <div style={{ color: '#64748b', fontSize: 13 }}>{title}</div>
    <div style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
  </article>
);

const Input = ({ label, value, onChange, required, type = 'text' }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) => (
  <label style={labelStyle}>
    {label}
    <input type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} style={inputStyle} />
  </label>
);

const panelStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 14,
  background: '#fff'
};

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 5,
  marginBottom: 10,
  fontSize: 14
};

const inputStyle: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '8px 10px'
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  fontWeight: 600,
  color: '#334155',
  borderBottom: '1px solid #e2e8f0',
  padding: 8,
  fontSize: 13
};

const tdStyle: React.CSSProperties = {
  borderBottom: '1px solid #f1f5f9',
  padding: 8,
  fontSize: 14
};

export default App;
