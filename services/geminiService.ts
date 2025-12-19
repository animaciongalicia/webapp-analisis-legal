
import { GoogleGenAI, Type } from "@google/genai";
import { UserAnswers, AIRecommendation } from "../types";

export const getLegalInsight = async (answers: UserAnswers): Promise<AIRecommendation> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Analiza esta situación legal detallada para un cliente potencial:
    - Categoría: ${answers.tipoProblema}
    - Situación: ${answers.detalle}
    - Impactos detectados: ${answers.impacto.join(', ')}
    - Acciones previas: ${answers.accionesPrevias}
    - Urgencia seleccionada: ${answers.urgencia}

    Genera una respuesta técnica pero cercana. Valida su frustración. 
    Explica por qué los impactos mencionados son críticos para su patrimonio o bienestar.
    Responde en JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "Eres un Consultor Jurídico Senior de Moreira & Fernández. Tu objetivo es dar una visión estratégica profunda. En 'nextSteps', proporciona al menos 8 recomendaciones amplias, protectoras y profesionales que un abogado daría a su cliente (ej: protocolo de preservación de pruebas, advertencias sobre comunicaciones con terceros, plazos de caducidad, protección de activos, blindaje de testimonios, etc.). En 'urgencyWarning', aunque la percepción de urgencia sea baja, advierte firmemente que en derecho los plazos no se detienen y que la inacción es una estrategia arriesgada.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING, description: "Análisis estratégico profundo del escenario." },
            riskAnalysis: { type: Type.STRING, description: "Impacto legal y personal de la inacción." },
            empathyNote: { type: Type.STRING, description: "Validación de la carga emocional/económica." },
            urgencyWarning: { type: Type.STRING, description: "Aviso crítico sobre plazos y tiempos procesales." },
            nextSteps: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Lista extensa y detallada de recomendaciones profesionales inmediatas."
            }
          },
          required: ["insight", "riskAnalysis", "empathyNote", "urgencyWarning", "nextSteps"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Error:", error);
    return {
      insight: "Su caso requiere una auditoría jurídica inmediata para blindar su posición ante posibles acciones de la contraparte.",
      riskAnalysis: "La demora en procesos de " + answers.tipoProblema + " compromete gravemente la capacidad de aportar pruebas fundamentales y puede suponer la pérdida de derechos por prescripción.",
      empathyNote: "Entendemos perfectamente que esta situación le genere incertidumbre; es una carga pesada que no debe llevar sin apoyo técnico.",
      urgencyWarning: "Aunque usted no perciba una urgencia inmediata, el calendario jurídico es inflexible. La falta de actuación hoy puede cerrar puertas mañana.",
      nextSteps: [
        "Cese inmediato de cualquier comunicación directa con la contraparte sin supervisión letrada.",
        "Preservación íntegra de pruebas digitales: no borre mensajes, emails ni historiales de llamadas.",
        "Solicitud de copia de toda la documentación original que sustenta el conflicto.",
        "No firme ningún documento, finiquito, acuerdo o renuncia, por inofensivo que parezca.",
        "Evite comentar los detalles del caso en redes sociales o con compañeros de entorno común.",
        "Inicie un registro cronológico de todos los eventos relevantes a partir de este momento.",
        "Verificación formal de plazos de caducidad y prescripción con un abogado colegiado.",
        "Agendar una consultoría técnica urgente para trazar la estrategia de defensa o reclamación."
      ]
    };
  }
};
