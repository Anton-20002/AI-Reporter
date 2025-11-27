import { GoogleGenAI } from "@google/genai";
import { ReportData, AIAnalysisResult, ReportType } from '../types';

const getSystemInstruction = () => `
Ты - эксперт-аналитик по складской логистике и управлению запасами.
Твоя задача - проанализировать предоставленные данные отчета и выдать краткое, профессиональное резюме на русском языке.
Сосредоточься на выявлении рисков, неэффективности и возможностей для оптимизации.
Формат ответа должен быть JSON.
`;

export const analyzeReportWithGemini = async (
  reportType: ReportType,
  data: ReportData
): Promise<AIAnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Convert data to a summarized string to save tokens, focusing on key metrics
    const dataSummary = JSON.stringify({
      reportType,
      summaryMetrics: data.summary,
      topItems: data.items.slice(0, 10).map(i => ({ name: i.name, qty: i.quantity, status: i.status, value: i.value })),
      totalItemsCount: data.items.length
    });

    const prompt = `
      Проанализируй следующие данные складского отчета типа "${reportType}".
      Данные: ${dataSummary}

      Верни JSON с полями:
      1. "summary": Краткое текстовое резюме ситуации (2-3 предложения).
      2. "recommendations": Массив строк (3-5 конкретных действий для менеджера склада).
      3. "riskAssessment": Одно из значений ["Low", "Medium", "High"] в зависимости от наличия критических проблем (дефицит, затоваривание, истечение сроков).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(),
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as AIAnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Не удалось получить анализ от ИИ. Проверьте соединение или API ключ.",
      recommendations: ["Проверьте данные вручную", "Обратитесь к администратору системы"],
      riskAssessment: "Medium"
    };
  }
};
