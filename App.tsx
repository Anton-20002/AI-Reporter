import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  ArrowLeft,
  Calendar,
  Download,
  Share2,
  Sparkles,
  Search,
  Box
} from 'lucide-react';

import { ReportType, ReportConfig, ReportData, InventoryItem, AIAnalysisResult } from './types';
import { analyzeReportWithGemini } from './services/geminiService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge } from './components/ui';
import { CategoryValueChart, StatusDistributionChart } from './components/DataCharts';

// --- Configuration ---

const REPORT_TYPES: ReportConfig[] = [
  {
    id: ReportType.INVENTORY_BALANCE,
    title: "Остатки на складе",
    description: "Текущее количество и стоимость запасов по всем категориям.",
    iconName: 'Package',
    color: 'bg-blue-500'
  },
  {
    id: ReportType.MOVEMENT_HISTORY,
    title: "История движения",
    description: "Анализ поступлений и отгрузок за выбранный период.",
    iconName: 'Activity',
    color: 'bg-indigo-500'
  },
  {
    id: ReportType.EXPIRY_RISK,
    title: "Сроки годности",
    description: "Товары с истекающим сроком годности и просрочка.",
    iconName: 'AlertTriangle',
    color: 'bg-orange-500'
  },
  {
    id: ReportType.DEMAND_FORECAST,
    title: "Прогноз спроса",
    description: "AI-прогноз потребности в товарах на следующий месяц.",
    iconName: 'TrendingUp',
    color: 'bg-emerald-500'
  },
];

// --- Mock Data Generator ---

const generateMockData = (type: ReportType): ReportData => {
  const categories = ['Электроника', 'Запчасти', 'Инструменты', 'Сырье', 'Упаковка'];
  const items: InventoryItem[] = Array.from({ length: 25 }).map((_, i) => {
    const qty = Math.floor(Math.random() * 500);
    let status: InventoryItem['status'] = 'In Stock';
    if (qty === 0) status = 'Out of Stock';
    else if (qty < 20) status = 'Low Stock';
    else if (qty > 400) status = 'Overstock';

    return {
      id: `ITEM-${1000 + i}`,
      name: `Товар ${i + 1} (${categories[Math.floor(Math.random() * categories.length)]})`,
      sku: `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`,
      quantity: qty,
      category: categories[Math.floor(Math.random() * categories.length)],
      lastUpdated: new Date().toISOString().split('T')[0],
      status,
      value: Math.floor(Math.random() * 1000) * qty,
    };
  });

  // Tweak data based on report type to make it realistic
  if (type === ReportType.EXPIRY_RISK) {
    items.forEach(item => {
      if (Math.random() > 0.7) item.status = 'Low Stock'; // Simulate risk
    });
  }

  return {
    generatedAt: new Date().toLocaleString('ru-RU'),
    items,
    summary: {
      totalItems: items.length,
      totalValue: items.reduce((sum, i) => sum + i.value, 0),
      criticalItemsCount: items.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length
    }
  };
};

// --- Icon Helper ---
const ReportIcon = ({ name, className = "" }: { name: string, className?: string }) => {
  switch (name) {
    case 'Package': return <Package className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'AlertTriangle': return <AlertTriangle className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    default: return <BarChart3 className={className} />;
  }
};

// --- Main App Component ---

const App: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  // Reset data when switching reports
  useEffect(() => {
    if (!selectedReport) {
      setReportData(null);
      setAiAnalysis(null);
    }
  }, [selectedReport]);

  const handleGenerateReport = useCallback(async () => {
    if (!selectedReport) return;

    setIsGenerating(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 1. Generate Mock Data
    const data = generateMockData(selectedReport.id);
    setReportData(data);

    // 2. Call Gemini for Analysis
    try {
      const analysis = await analyzeReportWithGemini(selectedReport.id, data);
      setAiAnalysis(analysis);
    } catch (err) {
      console.error("Failed to analyze", err);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedReport]);

  // --- Views ---

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Центр отчетов</h1>
          <p className="text-slate-500 mt-2">Выберите тип отчета для генерации аналитики и статистики.</p>
        </div>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Сегодня: {new Date().toLocaleDateString('ru-RU')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {REPORT_TYPES.map((report) => (
          <Card 
            key={report.id} 
            onClick={() => setSelectedReport(report)}
            className="group hover:-translate-y-1"
          >
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg ${report.color} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                <ReportIcon name={report.iconName} className="h-6 w-6" />
              </div>
              <CardTitle>{report.title}</CardTitle>
              <CardDescription className="mt-2">{report.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <span className="text-sm font-medium text-blue-600 group-hover:underline flex items-center">
                Создать отчет <ArrowLeft className="ml-1 h-3 w-3 rotate-180" />
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="rounded-xl bg-slate-100 p-8 border border-slate-200 text-center">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Не нашли нужный отчет?</h3>
        <p className="text-slate-500 mb-6">Вы можете создать пользовательский отчет или запросить новые метрики у администратора.</p>
        <Button variant="outline">Конструктор отчетов</Button>
      </div>
    </div>
  );

  const renderReportView = () => {
    if (!selectedReport) return null;

    return (
      <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
        {/* Header Navigation */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
             <div className={`p-2 rounded-md ${selectedReport.color} text-white`}>
                <ReportIcon name={selectedReport.iconName} className="h-5 w-5" />
             </div>
             <div>
                <h2 className="text-2xl font-bold">{selectedReport.title}</h2>
                <p className="text-slate-500 text-sm">Параметры генерации</p>
             </div>
          </div>
        </div>

        {/* Configuration & Action Area */}
        {!reportData ? (
          <Card className="max-w-2xl mx-auto mt-12">
            <CardHeader>
              <CardTitle>Настройки отчета</CardTitle>
              <CardDescription>Настройте фильтры перед формированием данных.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Склад</label>
                  <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950">
                    <option>Главный склад (Москва)</option>
                    <option>Склад Север (СПБ)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Категория</label>
                  <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950">
                    <option>Все категории</option>
                    <option>Электроника</option>
                    <option>Запчасти</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-start gap-2">
                <Sparkles className="h-5 w-5 shrink-0 text-blue-600" />
                <p>При генерации будет задействован <strong>Gemini 2.5 AI</strong> для анализа аномалий и составления прогноза рисков на основе полученных данных.</p>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={handleGenerateReport} loading={isGenerating} size="lg">
                {isGenerating ? 'Анализ данных...' : 'Сформировать отчет'}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-6">
            
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white">
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Всего позиций</p>
                      <h3 className="text-3xl font-bold">{reportData.summary.totalItems}</h3>
                    </div>
                    <Box className="h-8 w-8 text-slate-400" />
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Общая стоимость</p>
                      <h3 className="text-3xl font-bold text-green-600">${reportData.summary.totalValue.toLocaleString()}</h3>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </CardContent>
                </Card>
                <Card className={`${reportData.summary.criticalItemsCount > 0 ? 'bg-red-50 border-red-100' : 'bg-white'}`}>
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Требуют внимания</p>
                      <h3 className={`text-3xl font-bold ${reportData.summary.criticalItemsCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                        {reportData.summary.criticalItemsCount}
                      </h3>
                    </div>
                    <AlertTriangle className={`h-8 w-8 ${reportData.summary.criticalItemsCount > 0 ? 'text-red-500' : 'text-slate-400'}`} />
                  </CardContent>
                </Card>
            </div>

            {/* AI Insight Section */}
            {aiAnalysis && (
              <Card className="border-indigo-200 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="font-semibold">AI Аналитика Gemini</h3>
                  </div>
                  <Badge className="bg-white/20 text-white border-none">
                     Risk: {aiAnalysis.riskAssessment}
                  </Badge>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-indigo-900 mb-1">Резюме</h4>
                    <p className="text-slate-700 leading-relaxed">{aiAnalysis.summary}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-medium text-indigo-900 mb-2">Рекомендации</h4>
                      <ul className="space-y-2">
                        {aiAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start text-sm text-indigo-900">
                             <span className="mr-2">•</span> {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <Card>
                 <CardHeader>
                   <CardTitle>Структура по статусам</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <StatusDistributionChart data={reportData.items} />
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader>
                   <CardTitle>Стоимость по категориям</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <CategoryValueChart data={reportData.items} />
                 </CardContent>
               </Card>
            </div>

            {/* Data Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Детализация</CardTitle>
                  <CardDescription>Полный список позиций вошедших в отчет</CardDescription>
                </div>
                <div className="flex space-x-2">
                   <Button variant="outline" size="sm">
                     <Share2 className="mr-2 h-4 w-4" /> Поделиться
                   </Button>
                   <Button variant="outline" size="sm">
                     <Download className="mr-2 h-4 w-4" /> Экспорт CSV
                   </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                      <tr>
                        <th className="px-4 py-3">Товар</th>
                        <th className="px-4 py-3">Категория</th>
                        <th className="px-4 py-3 text-right">Количество</th>
                        <th className="px-4 py-3 text-right">Стоимость</th>
                        <th className="px-4 py-3">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            <div>{item.name}</div>
                            <div className="text-xs text-slate-400">{item.sku}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{item.category}</td>
                          <td className="px-4 py-3 text-right text-slate-900">{item.quantity} шт.</td>
                          <td className="px-4 py-3 text-right text-slate-900">${item.value}</td>
                          <td className="px-4 py-3">
                            <Badge variant={
                              item.status === 'In Stock' ? 'success' : 
                              item.status === 'Low Stock' ? 'warning' : 
                              item.status === 'Out of Stock' ? 'destructive' : 'default'
                            }>
                              {item.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Box className="h-8 w-8" />
          <span>Sklad.AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 ml-6 text-sm font-medium text-slate-600">
          <a href="#" className="text-blue-600">Отчеты</a>
          <a href="#" className="hover:text-slate-900">Товары</a>
          <a href="#" className="hover:text-slate-900">Заказы</a>
          <a href="#" className="hover:text-slate-900">Настройки</a>
        </nav>
        <div className="ml-auto flex items-center gap-4">
           <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Поиск..." 
                className="h-9 w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
           </div>
           <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
             AD
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-6 md:p-8 max-w-7xl">
        {selectedReport ? renderReportView() : renderDashboard()}
      </main>
    </div>
  );
};

export default App;
