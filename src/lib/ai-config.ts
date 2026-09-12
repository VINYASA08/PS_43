export interface AiGlobalConfig {
  confidenceThreshold: number;
  minThreshold: number;
  maxThreshold: number;
  lastUpdated: string;
}

const globalForAiConfig = globalThis as unknown as {
  aiConfig: AiGlobalConfig | undefined;
};

export const defaultAiConfig: AiGlobalConfig = {
  confidenceThreshold: 0.85,
  minThreshold: 0.70,
  maxThreshold: 0.95,
  lastUpdated: new Date().toISOString(),
};

export function getAiConfig(): AiGlobalConfig {
  if (!globalForAiConfig.aiConfig) {
    globalForAiConfig.aiConfig = { ...defaultAiConfig };
  }
  return globalForAiConfig.aiConfig;
}

export function updateAiConfig(threshold: number): AiGlobalConfig {
  const clamped = Math.max(0.70, Math.min(0.95, Number(threshold)));
  globalForAiConfig.aiConfig = {
    confidenceThreshold: Number(clamped.toFixed(2)),
    minThreshold: 0.70,
    maxThreshold: 0.95,
    lastUpdated: new Date().toISOString(),
  };
  return globalForAiConfig.aiConfig;
}
