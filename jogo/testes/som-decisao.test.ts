// O som de decisão (cliente/src/somDecisao.ts): a buzina toca SEMPRE que uma decisão sua aparece (pedido de 13/11),
// sem repetir na mesma decisão e sem duas buzinas uma em cima da outra.
import { describe, expect, it } from 'vitest';
import { INTERVALO_MINIMO, deveTocarDecisao, type MomentoDecisao } from '../cliente/src/somDecisao.ts';

const base: MomentoDecisao = { decisao: 7, anterior: 6, agora: 100_000, ultimoSom: -Infinity, ligado: true };
const m = (x: Partial<MomentoDecisao>) => deveTocarDecisao({ ...base, ...x });

describe('som de decisão', () => {
  it('toca em toda decisão nova sua', () => {
    expect(m({})).toBe(true);
    expect(m({ anterior: null })).toBe(true);
  });

  it('não toca sem decisão, na mesma decisão ou com a chave desligada', () => {
    expect(m({ decisao: null })).toBe(false);
    expect(m({ anterior: 7 })).toBe(false);
    expect(m({ ligado: false })).toBe(false);
  });

  it('não sobrepõe duas buzinas coladas', () => {
    expect(m({ ultimoSom: base.agora - 500 })).toBe(false);
    expect(m({ ultimoSom: base.agora - INTERVALO_MINIMO })).toBe(true);
  });
});
