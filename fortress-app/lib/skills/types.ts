export type SkillCategory =
  | 'nse-technical'
  | 'invest-fundamental'
  | 'invest-technical'
  | 'invest-research';

export type SkillParamType = 'string' | 'number' | 'boolean' | 'array' | 'enum';

export interface SkillParam {
  name: string;
  type: SkillParamType;
  required: boolean;
  description: string;
  options?: string[]; // for enum type
}

export interface SkillResult {
  skillName: string;
  success: boolean;
  results: Record<string, any>;
  summary: string;
  visualization?: {
    type: 'chart' | 'table' | 'gauge' | 'list' | 'text';
    data: any;
  };
  metadata?: {
    executionTimeMs: number;
    dataSourcesUsed: string[];
  };
}

export interface SkillManifest {
  name: string;
  displayName: string;
  description: string;
  category: SkillCategory;
  icon: string; // emoji
  params: SkillParam[];
  visualizationType: 'chart' | 'table' | 'gauge' | 'list' | 'text';
  estimatedExecutionTimeMs: number;
}

export interface SkillExecutionRequest {
  skillName: string;
  allocationId?: string;
  selectedStocks?: string[];
  userContext?: {
    userId: string;
    riskAppetite: number;
    horizon: string;
    experience: string;
  };
  params?: Record<string, any>;
}

export interface SkillRegistry {
  [skillName: string]: SkillManifest;
}
