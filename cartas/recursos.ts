// Objetos auxiliares de cards.json que não são fichas: representam recursos de regra.
// A cobertura considera cada um implementado quando o motor tem o recurso e um teste o exercita.

export const RECURSOS_DE_REGRA: Record<string, { implementado: boolean; teste: string | null; regra: string }> = {
  'Poison Counter': { implementado: true, teste: 'testes/cenarios.test.ts: Q44', regra: '704.5c' },
  'The Monarch': { implementado: true, teste: 'cartas/defs/grave-venerations.test.ts', regra: '725' },
  "City's Blessing": { implementado: false, teste: null, regra: '702.131' },
  Copy: { implementado: false, teste: null, regra: '707' },
  Manifest: { implementado: false, teste: null, regra: '701.40' },
};
