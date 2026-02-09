export interface IstioRouteDto {
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

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

export async function discoverIstioRoutes(namespace?: string): Promise<IstioRouteDto[]> {
  const query = namespace ? `?namespace=${encodeURIComponent(namespace)}` : '';
  const response = await fetch(`${API_BASE}/istio/routes${query}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Ошибка запроса Istio роутов');
  }

  return response.json();
}
