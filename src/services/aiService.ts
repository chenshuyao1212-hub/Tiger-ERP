
import { GoogleGenAI } from "@google/genai";
import pLimit from 'p-limit';

// 限制并发请求数量为 3，防止触发 Gemini API 的速率限制
const limit = pLimit(3);

/**
 * AI 服务类
 * 封装了 Gemini API 的调用逻辑，并集成了并发控制
 */
export class AIService {
    private static ai: GoogleGenAI | null = null;

    /**
     * 获取 GoogleGenAI 实例（延迟初始化）
     */
    private static getAIInstance(): GoogleGenAI {
        if (!this.ai) {
            const apiKey = process.env.GEMINI_API_KEY || (window as any).process?.env?.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("GEMINI_API_KEY is not defined in environment variables.");
            }
            this.ai = new GoogleGenAI({ apiKey });
        }
        return this.ai;
    }

    /**
     * 通用的内容生成接口，带并发控制
     * @param prompt 提示词
     * @param model 模型名称，默认为 gemini-3-flash-preview
     */
    static async generateContent(prompt: string, model: string = "gemini-3-flash-preview"): Promise<string> {
        return limit(async () => {
            try {
                const ai = this.getAIInstance();
                const response = await ai.models.generateContent({
                    model,
                    contents: [{ parts: [{ text: prompt }] }],
                });
                return response.text || "";
            } catch (error: any) {
                console.error("Gemini API Error:", error);
                if (error.message?.includes("429") || error.message?.includes("Quota")) {
                    throw new Error("AI 服务请求过快，请稍后再试。");
                }
                throw error;
            }
        });
    }

    /**
     * 批量处理任务，自动应用并发限制
     * @param prompts 提示词数组
     */
    static async batchGenerateContent(prompts: string[]): Promise<string[]> {
        const tasks = prompts.map(prompt => this.generateContent(prompt));
        return Promise.all(tasks);
    }
}
