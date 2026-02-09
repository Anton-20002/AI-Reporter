import React, { useMemo, useState } from 'react';
import { discoverIstioRoutes } from './services/istioApi';

interface RouteItem {
  namespace: string;
  service: string;
  host: string;
  port: number;
  protocol: string;
  gateway: string;
  path: string;
  source: string;
  internal: boolean;
}

const App: React.FC = () => {
  const [namespace, setNamespace] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routes, setRoutes] = useState<RouteItem[]>([]);

  const externalRoutes = useMemo(() => routes.filter((route) => !route.internal), [routes]);
  const internalRoutes = useMemo(() => routes.filter((route) => route.internal), [routes]);

  const handleDiscover = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await discoverIstioRoutes(namespace.trim() || undefined);
      setRoutes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось определить роуты');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24, fontFamily: 'Inter, Arial, sans-serif' }}>
      <h1 style={{ marginBottom: 8 }}>Istio Route Detector</h1>
      <p style={{ marginTop: 0, color: '#475569' }}>
        Приложение определяет роуты сервисов, запущенных в Kubernetes + Istio, через данные из <code>kubectl</code>.
      </p>

      <section style={{ ...panelStyle, marginBottom: 16 }}>
        <form onSubmit={handleDiscover} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
          <label style={labelStyle}>
            Namespace (необязательно)
            <input
              value={namespace}
              onChange={(event) => setNamespace(event.target.value)}
              placeholder="Например: default"
              style={inputStyle}
            />
          </label>
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Сканирование...' : 'Определить роуты'}
          </button>
        </form>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard title="Всего роутов" value={String(routes.length)} />
        <StatCard title="Внешние" value={String(externalRoutes.length)} />
        <StatCard title="Внутренние" value={String(internalRoutes.length)} />
      </section>

      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

      <section style={panelStyle}>
        <h3 style={{ marginTop: 0 }}>Обнаруженные маршруты</h3>
        {!routes.length && !loading && <p style={{ color: '#64748b' }}>Роуты пока не загружены.</p>}

        {!!routes.length && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Namespace', 'Service', 'Host', 'Path', 'Gateway', 'Port', 'Protocol', 'Тип', 'Источник'].map((head) => (
                  <th key={head} style={thStyle}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routes.map((route, index) => (
                <tr key={`${route.namespace}-${route.service}-${route.host}-${route.path}-${index}`}>
                  <td style={tdStyle}>{route.namespace}</td>
                  <td style={tdStyle}>{route.service}</td>
                  <td style={tdStyle}>{route.host}</td>
                  <td style={tdStyle}>{route.path}</td>
                  <td style={tdStyle}>{route.gateway}</td>
                  <td style={tdStyle}>{route.port}</td>
                  <td style={tdStyle}>{route.protocol}</td>
                  <td style={tdStyle}>{route.internal ? 'Internal' : 'External'}</td>
                  <td style={tdStyle}>{route.source}</td>
                </tr>
              ))}
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

const panelStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 14,
  background: '#fff'
};

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 6,
  fontSize: 14
};

const inputStyle: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '8px 10px'
};

const buttonStyle: React.CSSProperties = {
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  borderRadius: 8,
  padding: '10px 16px',
  cursor: 'pointer'
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
