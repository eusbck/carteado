import { describe, expect, it } from 'vitest';
import { registry } from '../motor/defs.ts';
import { coberturaCarta } from '../ferramentas/cobertura-dados.ts';

describe('auditoria das cartas importadas', () => {
  it('uma implementação parcial continua pendente mesmo com teste e ruling', () => {
    registry.cards.set('Auditoria parcial', { name: 'Auditoria parcial', pending: true, faces: [{}], rulings: { 1: 'CR 118' } });
    expect(coberturaCarta('Auditoria parcial', 1, new Set(['auditoria-parcial']))).toEqual({ impl: false, teste: false, rulingsOk: 1, rulingsTotal: 1 });
    registry.cards.delete('Auditoria parcial');
  });
  it('exige teste próprio e justificativas não vazias dentro do intervalo dos rulings importados', () => {
    registry.cards.set('Auditoria importada', { name: 'Auditoria importada', faces: [{}], rulings: { 1: '', 2: 'teste: resolução', 3: 'fora do intervalo' } });
    expect(coberturaCarta('Auditoria importada', 2, new Set())).toEqual({ impl: true, teste: false, rulingsOk: 1, rulingsTotal: 2 });
    registry.cards.delete('Auditoria importada');
  });
});
