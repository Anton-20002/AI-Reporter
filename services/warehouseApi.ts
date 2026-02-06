import type { WarehouseItem } from '../App';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

const seedItems: WarehouseItem[] = [
  {
    id: '1',
    sku: 'EL-1001',
    name: 'Сканер штрихкодов',
    category: 'Электроника',
    quantity: 14,
    minThreshold: 5,
    location: 'A-01',
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    sku: 'PK-2002',
    name: 'Картонная коробка M',
    category: 'Упаковка',
    quantity: 120,
    minThreshold: 40,
    location: 'B-14',
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    sku: 'SP-3003',
    name: 'Подшипник 608ZZ',
    category: 'Запчасти',
    quantity: 3,
    minThreshold: 10,
    location: 'C-07',
    updatedAt: new Date().toISOString()
  }
];

let localItems = [...seedItems];

export const getItems = async (): Promise<WarehouseItem[]> => {
  try {
    const response = await fetch(`${API_BASE}/items`);
    if (!response.ok) {
      throw new Error(`Backend error ${response.status}`);
    }
    return await response.json();
  } catch {
    return localItems;
  }
};

export const createItem = async (payload: Omit<WarehouseItem, 'id' | 'updatedAt'>): Promise<void> => {
  try {
    await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    localItems = [
      {
        ...payload,
        id: crypto.randomUUID(),
        updatedAt: new Date().toISOString()
      },
      ...localItems
    ];
  }
};

export const postMovement = async (payload: { itemId: string; delta: number; reason: string }): Promise<void> => {
  try {
    await fetch(`${API_BASE}/movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    localItems = localItems.map((item) =>
      item.id === payload.itemId
        ? { ...item, quantity: Math.max(0, item.quantity + payload.delta), updatedAt: new Date().toISOString() }
        : item
    );
  }
};
