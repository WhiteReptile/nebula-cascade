import type { Verdict } from "./types";

const empty = {
  originality: "",
  execution: "",
  appeal: "",
  competition: "",
  potential: "",
  confidence: 70,
  analyst: {
    observations: ["One-pass opinion from the submission."],
    contradictions: [] as string[],
    comparableReferences: [] as string[],
  },
};

export const MOCK_VERDICTS: Verdict[] = [
  {
    id: "example-poetry",
    category: "text",
    categoryLabel: "Poetry",
    scoreContext: "for written work",
    score: 60,
    strengths: ["Atmospheric imagery", "Clever metaphor"],
    weaknesses: ["Generic clichés", "Inconsistent line breaks"],
    ...empty,
    biggestProblem: "Generic clichés",
    biggestOpportunity: "Atmospheric imagery",
    verdict:
      "The poem has a clear atmospheric intent and uses sensory details that paint a vivid cityscape. The metaphor of the moon as an unfinished thought adds a poetic twist. However, the imagery leans heavily on clichés that feel a bit generic. The line breaks are somewhat inconsistent, disrupting the flow. Overall, it’s a decent foundation but lacks strong originality or depth.",
    steelman: {
      caseFor: ["Atmospheric imagery", "Clever metaphor"],
      caseAgainst: ["Generic clichés", "Inconsistent line breaks"],
    },
    submissionPreview: "The City After Rain The city wears the evening like a coat it cannot afford…",
    createdAt: "2026-08-18T22:39:31.899Z",
  },
  {
    id: "example-marketing",
    category: "text",
    categoryLabel: "Marketing plan",
    scoreContext: "for written work",
    score: 61,
    strengths: [
      "Enfoque local en Narvarte y Del Valle",
      "Profesores nativos",
      "Demo gratuita de 30 minutos",
      "Estrategia de publicidad en redes sociales",
      "Programa de referidos y alianzas locales",
    ],
    weaknesses: [
      "Falta análisis de competencia",
      "Presupuesto de marketing limitado",
      "Ausencia de estrategia de retención",
      "No se mencionan métricas de desempeño detalladas más allá del CPL",
      "Ausencia de plan de escalabilidad",
    ],
    ...empty,
    biggestProblem: "Falta análisis de competencia",
    biggestOpportunity: "Enfoque local en Narvarte y Del Valle",
    verdict:
      "El plan muestra una buena comprensión del mercado local y aprovecha las plataformas digitales más relevantes. La oferta de clases gratuitas y precios escalados es una táctica eficaz para reducir la barrera de entrada. Sin embargo, la propuesta carece de análisis de competencia que podría orientar la propuesta de valor. El presupuesto de publicidad es limitado y no se detalla cómo se maximizaría el retorno en cada plataforma. Además, no se menciona una estrategia de retención que garantice la lealtad de los estudiantes. En conjunto, el proyecto tiene bases sólidas pero necesita fortalecer la planificación financiera y la diferenciación.",
    steelman: {
      caseFor: [
        "Enfoque local en Narvarte y Del Valle",
        "Profesores nativos",
        "Demo gratuita de 30 minutos",
        "Estrategia de publicidad en redes sociales",
        "Programa de referidos y alianzas locales",
      ],
      caseAgainst: [
        "Falta análisis de competencia",
        "Presupuesto de marketing limitado",
        "Ausencia de estrategia de retención",
        "No se mencionan métricas de desempeño detalladas más allá del CPL",
        "Ausencia de plan de escalabilidad",
      ],
    },
    submissionPreview: "Casa Playa English Classes se posicionará como una opción local de inglés conversacional…",
    createdAt: "2026-08-18T22:39:33.892Z",
  },
  {
    id: "example-cv",
    category: "text",
    categoryLabel: "CV",
    scoreContext: "for written work",
    score: 72,
    strengths: [
      "Broad industry experience",
      "Strong sales metrics and team leadership",
      "High-value deal closure",
      "Fraud investigation and compliance knowledge",
      "Clear combination of analytical and negotiation skills",
    ],
    weaknesses: [
      "Sparse detail on fraud role outcomes",
      "No certification or education background",
      "Limited emphasis on recent achievements",
      "Lacks a cohesive narrative linking diverse roles",
    ],
    ...empty,
    biggestProblem: "Sparse detail on fraud role outcomes",
    biggestOpportunity: "Broad industry experience",
    verdict:
      "Enrique's résumé clearly shows a breadth of experience and strong sales metrics. He consistently exceeded targets, managing a large team and closing high-value B2B deals. His fraud investigation work adds a valuable compliance edge. However, the document lacks detail on the scope of the fraud role and specific results. There are no mentions of certifications or formal training to back up his skill claims. The summary also could better connect his diverse experiences into a unified narrative.",
    steelman: {
      caseFor: [
        "Broad industry experience",
        "Strong sales metrics and team leadership",
        "High-value deal closure",
        "Fraud investigation and compliance knowledge",
        "Clear combination of analytical and negotiation skills",
      ],
      caseAgainst: [
        "Sparse detail on fraud role outcomes",
        "No certification or education background",
        "Limited emphasis on recent achievements",
        "Lacks a cohesive narrative linking diverse roles",
      ],
    },
    submissionPreview: "My name is Enrique Cárdenas, and I’m a results-driven professional…",
    createdAt: "2026-08-18T22:39:35.882Z",
  },
];

export function getMockVerdict(id: string): Verdict | undefined {
  return MOCK_VERDICTS.find((v) => v.id === id);
}
