// O som de decisão (cliente/src/somDecisao.ts): o "paam" toca quando uma decisão sua aparece, sobretudo com a mesa
// noutra aba, sem repetir na mesma decisão, sem colar no som do seu turno e sem tocar enquanto você joga.
import { describe, expect, it } from 'vitest';
import { DEPOIS_DO_TURNO, INTERVALO_MINIMO, RESPOSTA_RECENTE, deveTocarDecisao, type MomentoDecisao } from '../cliente/src/somDecisao.ts';

const base: MomentoDecisao = { decisao: 7, anterior: 6, agora: 100_000, ultimoSom: -Infinity, ultimoTurnoMeu: -Infinity, ultimaResposta: -Infinity, escondida: false, ligado: true };
const m = (x: Partial<MomentoDecisao>) => deveTocarDecisao({ ...base, ...x });

describe('som de decisão', () => {
  it('toca numa decisão nova sua', () => {
    expect(m({})).toBe(true);
    expect(m({ anterior: null })).toBe(true);
  });

  it('não toca sem decisão, na mesma decisão ou com a chave desligada', () => {
    expect(m({ decisao: null })).toBe(false);
    expect(m({ anterior: 7 })).toBe(false);
    expect(m({ ligado: false })).toBe(false);
    expect(m({ ligado: false, escondida: true })).toBe(false);
  });

  it('não cola no som do seu turno', () => {
    expect(m({ ultimoTurnoMeu: base.agora - 500 })).toBe(false);
    expect(m({ ultimoTurnoMeu: base.agora - DEPOIS_DO_TURNO })).toBe(true);
  });

  it('não toca logo depois de você responder (a pergunta seguinte da mesma jogada)', () => {
    expect(m({ ultimaResposta: base.agora - 300 })).toBe(false);
    expect(m({ ultimaResposta: base.agora - RESPOSTA_RECENTE })).toBe(true);
  });

  it('com a aba escondida toca mesmo logo depois do turno ou de uma resposta', () => {
    expect(m({ escondida: true, ultimoTurnoMeu: base.agora - 100, ultimaResposta: base.agora - 100 })).toBe(true);
  });

  it('no máximo um a cada INTERVALO_MINIMO, também com a aba escondida', () => {
    expect(m({ ultimoSom: base.agora - 1000 })).toBe(false);
    expect(m({ ultimoSom: base.agora - 1000, escondida: true })).toBe(false);
    expect(m({ ultimoSom: base.agora - INTERVALO_MINIMO })).toBe(true);
  });
});
