
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectConstraints, StrategyResponse, Scheme, VariationResponse, Variation } from "../types";

const SYSTEM_INSTRUCTION = `
你是一家国际顶级建筑事务所（类似 gmp, Foster + Partners, KPF, HENN）的设计总监/合伙人。
你的设计哲学：理性几何、结构表现主义、商业价值驱动。

输出规则：
1. 语言风格：必须采用“中英结合”的方式描述所有关键技术点。例如：“设计逻辑 (Design Logic)”、“体量操纵 (Massing Manipulation)”。
2. 尊重输入：极度尊重用户提供的“场地体块图”和“手绘修改意图”。方案必须是这些输入的理性延续。
3. 建构品质：推荐高科技建构材料，注重细节。
`;

export const checkApiKey = async (): Promise<boolean> => {
  if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return true;
};

export const openApiKeySelector = async () => {
  if (typeof (window as any).aistudio?.openSelectKey === 'function') {
    await (window as any).aistudio.openSelectKey();
  } else {
    alert("请在支持的环境中配置 API Key。");
  }
};

const extractBase64 = (dataUrl: string) => dataUrl.split(',')[1];

export const generateArchitecturalStrategies = async (constraints: ProjectConstraints): Promise<StrategyResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const textPrompt = `
    作为设计总监，请针对以下约束生成 3 套中英结合的理性设计方案。
    场地 (Site)：${constraints.site}
    功能 (Function)：${constraints.function}
    项目简报 (Brief)：${constraints.brief}

    输出必须为严格的 JSON 格式，包含 title, bigIdea(metaphor, theory), massing(strategy, verbs), organization(circulation, zoning), materiality(materials, atmosphere), sustainability, 以及对应的生成提示词。
    注意：bigIdea.theory 等长段文字请务必采用中英对照或中英混排。
  `;

  const contentsParts: any[] = [{ text: textPrompt }];
  if (constraints.siteImage) contentsParts.push({ inlineData: { mimeType: "image/jpeg", data: extractBase64(constraints.siteImage) } });
  if (constraints.intentImage) contentsParts.push({ inlineData: { mimeType: "image/jpeg", data: extractBase64(constraints.intentImage) } });

  const textResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: contentsParts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          schemes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                bigIdea: { type: Type.OBJECT, properties: { metaphor: { type: Type.STRING }, theory: { type: Type.STRING } }, required: ["metaphor", "theory"] },
                massing: { type: Type.OBJECT, properties: { strategy: { type: Type.STRING }, verbs: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["strategy", "verbs"] },
                organization: { type: Type.OBJECT, properties: { circulation: { type: Type.STRING }, zoning: { type: Type.STRING } }, required: ["circulation", "zoning"] },
                materiality: { type: Type.OBJECT, properties: { materials: { type: Type.ARRAY, items: { type: Type.STRING } }, atmosphere: { type: Type.STRING } }, required: ["materials", "atmosphere"] },
                sustainability: { type: Type.STRING },
                renderPrompt: { type: Type.STRING },
                siteRenderPrompt: { type: Type.STRING }
              },
              required: ["title", "bigIdea", "massing", "organization", "materiality", "sustainability", "renderPrompt", "siteRenderPrompt"]
            }
          }
        },
        required: ["schemes"]
      }
    }
  });

  const baseResult = JSON.parse(textResponse.text.trim());
  const rawSchemes = baseResult.schemes || [];
  const schemesWithImages: Scheme[] = [];

  for (const s of rawSchemes) {
    const finalScheme: Scheme = { 
      ...s, 
      id: Math.random().toString(36).substr(2, 9), 
      variations: [],
      // Ensure defaults for safety
      bigIdea: s.bigIdea || { metaphor: "", theory: "" },
      massing: s.massing || { strategy: "", verbs: [] },
      organization: s.organization || { circulation: "", zoning: "" },
      materiality: s.materiality || { materials: [], atmosphere: "" }
    };
    
    try {
      const renderRes = await ai.models.generateContent({ 
        model: 'gemini-3-pro-image-preview', 
        contents: s.renderPrompt, 
        config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } } 
      });
      const p = renderRes.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (p?.inlineData) finalScheme.renderUrl = `data:image/png;base64,${p.inlineData.data}`;
    } catch (e) {
      console.warn("Main image generation failed", e);
    }

    if (constraints.siteImage) {
      try {
        const siteRes = await ai.models.generateContent({ 
          model: 'gemini-3-pro-image-preview', 
          contents: { parts: [{ inlineData: { mimeType: "image/jpeg", data: extractBase64(constraints.siteImage) } }, { text: `Apply architectural design in same angle: ${s.siteRenderPrompt || s.renderPrompt}` }] }, 
          config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } } 
        });
        const p = siteRes.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (p?.inlineData) finalScheme.siteSpecificRenderUrl = `data:image/png;base64,${p.inlineData.data}`;
      } catch (e) {
        console.warn("Site image generation failed", e);
      }
    }
    schemesWithImages.push(finalScheme);
  }
  return { schemes: schemesWithImages };
};

export const generateSchemeVariations = async (
  scheme: Scheme, 
  constraints: ProjectConstraints, 
  userPrompt: string, 
  deepenIntentImage?: string,
  parentVariation?: Variation,
  sketchImage?: string
): Promise<VariationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const phasePrompt = `
    # [DESIGN ITERATION]
    项目：${scheme.title}
    意图：${userPrompt}
    ${parentVariation ? `基于变体 ${parentVariation.name} 进行迭代。` : ""}

    指令：生成 3 个中英结合的选址策略/形态原型。如果提供了手绘 (Sketch)，必须将其视为最优先的形态修正。
  `;

  const contentsParts: any[] = [{ text: phasePrompt }];
  if (constraints.siteImage) contentsParts.push({ inlineData: { mimeType: "image/jpeg", data: extractBase64(constraints.siteImage) } });
  if (deepenIntentImage) contentsParts.push({ inlineData: { mimeType: "image/jpeg", data: extractBase64(deepenIntentImage) } });
  if (sketchImage) contentsParts.push({ inlineData: { mimeType: "image/png", data: extractBase64(sketchImage) } });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: contentsParts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          variations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                siteLogic: { type: Type.STRING },
                massingManipulation: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                renderPrompt: { type: Type.STRING }
              },
              required: ["name", "siteLogic", "massingManipulation", "pros", "cons", "renderPrompt"]
            }
          }
        },
        required: ["variations"]
      }
    }
  });

  const result = JSON.parse(response.text.trim());
  const rawVariations = result.variations || [];
  const variationsWithImages: Variation[] = [];

  for (const v of rawVariations) {
    const finalV: Variation = { 
      ...v, 
      id: Math.random().toString(36).substr(2, 9), 
      sketchImage, 
      timestamp: Date.now() 
    };
    try {
      const vContents: any[] = [];
      if (constraints.siteImage) vContents.push({ inlineData: { mimeType: "image/jpeg", data: extractBase64(constraints.siteImage) } });
      if (sketchImage) vContents.push({ inlineData: { mimeType: "image/png", data: extractBase64(sketchImage) } });
      vContents.push({ text: `Architectural render 16:9: ${v.renderPrompt}. Combine original design DNA with the specific instructions in the sketch/text.` });

      const renderRes = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: vContents },
        config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
      });
      const part = renderRes.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) finalV.renderUrl = `data:image/png;base64,${part.inlineData.data}`;
    } catch (e) {
      console.warn("Variation image generation failed", e);
    }
    variationsWithImages.push(finalV);
  }

  return { variations: variationsWithImages };
};
