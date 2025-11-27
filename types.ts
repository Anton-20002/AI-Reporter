export enum ReportType {
  INVENTORY_BALANCE = 'INVENTORY_BALANCE',
  MOVEMENT_HISTORY = 'MOVEMENT_HISTORY',
  EXPIRY_RISK = 'EXPIRY_RISK',
  DEMAND_FORECAST = 'DEMAND_FORECAST',
  ABC_ANALYSIS = 'ABC_ANALYSIS'
}

export interface ReportConfig {
  id: ReportType;
  title: string;
  description: string;
  iconName: string;
  color: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  category: string;
  lastUpdated: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstock';
  value: number; // Monetary value
  turnoverRate?: number;
  expirationDate?: string;
}

export interface ReportData {
  generatedAt: string;
  items: InventoryItem[];
  summary: {
    totalItems: number;
    totalValue: number;
    criticalItemsCount: number;
  };
}

export interface AIAnalysisResult {
  summary: string;
  recommendations: string[];
  riskAssessment: 'Low' | 'Medium' | 'High';
}
