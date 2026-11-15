import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const N = 'Cryptic Caves';
const ativacoes = (tg: ReturnType<typeof setup>) => tg.actionIds().filter((acao) => acao.startsWith('act:') && tg.all(N).some((id) => acao.startsWith(`act:${id}:`)));

describe(N, () => {
  it('sempre pode produzir mana incolor', () => {
    expect(alternativasDeMana(N)).toEqual(['C']);
  });

  it('não ativa a compra com quatro terrenos, mesmo que o oponente tenha terrenos', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest'], ['Forest', 'Forest']], library: [['Island'], []] });
    expect(ativacoes(tg)).toEqual([]);
  });

  it('conta a si mesmo entre os cinco terrenos e compra depois do sacrifício', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Forest'], []], library: [['Island'], []] });
    tg.activate(N, 'Compre');
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'battlefield')).toHaveLength(4);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('com duas Caves e outros três terrenos, só uma pode ser sacrificada', () => {
    const tg = setup({ battlefield: [[N, N, 'Forest', 'Forest', 'Forest'], []], library: [['Island'], []] });
    expect(ativacoes(tg)).toHaveLength(2);
    tg.activate(N, 'Compre');
    expect(tg.all(N)).toHaveLength(1);
    expect(ativacoes(tg)).toEqual([]);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
