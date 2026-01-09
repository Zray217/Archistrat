
export interface ProjectConstraints {
  site: string;
  function: string;
  climate: string;
  brief: string;
  far?: string;
  intentImage?: string; // base64
  siteImage?: string;   // base64
}

export interface Variation {
  id: string;
  name: string;
  siteLogic: string;
  massingManipulation: string;
  pros: string[];
  cons: string[];
  renderUrl?: string;
  renderPrompt?: string;
  sketchImage?: string;
  timestamp: number;
}

export interface Scheme {
  id: string;
  title: string;
  bigIdea: {
    metaphor: string;
    theory: string;
  };
  massing: {
    strategy: string;
    verbs: string[];
  };
  organization: {
    circulation: string;
    zoning: string;
  };
  materiality: {
    materials: string[];
    atmosphere: string;
  };
  sustainability: string;
  renderUrl?: string;
  siteSpecificRenderUrl?: string;
  conceptUrl?: string;
  referenceUrls?: string[];
  variations: Variation[]; // 扁平化存储，通过 UI 实现堆叠感
  renderPrompt?: string; 
  siteRenderPrompt?: string;
  isLoading?: boolean; // 新增：方案级加载状态
}

export interface SavedProject {
  id: string;
  timestamp: number;
  constraints: ProjectConstraints;
  schemes: Scheme[];
}

export interface StrategyResponse {
  schemes: Scheme[];
}

export interface VariationResponse {
  variations: Variation[];
}
