
export type LegalCategory = 'laboral' | 'familia' | 'extranjeria' | 'penal' | 'otros';
export type UrgencyLevel = 'baja' | 'media' | 'grave';
export type DecisionPower = 'si' | 'comparte' | 'no';
export type ProblemImpact = 'economico' | 'emocional' | 'profesional' | 'familiar';

export interface UserAnswers {
  nombre: string;
  email: string;
  telefono: string;
  horario: string;
  tipoProblema: LegalCategory;
  detalle: string;
  impacto: ProblemImpact[];
  accionesPrevias: string;
  urgencia: UrgencyLevel;
  puedeDecidir: DecisionPower;
}

export interface AIRecommendation {
  insight: string;
  riskAnalysis: string;
  empathyNote: string;
  urgencyWarning: string;
  nextSteps: string[];
}
