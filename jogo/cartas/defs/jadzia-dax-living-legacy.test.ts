import { describe, expect, it } from 'vitest';
import { destroy, exile } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Jadzia Dax, Living Legacy';
const verdes = (tg: ReturnType<typeof setup>) => tg.state.players[0].manaPool.map((mana) => mana.type);

describe(N, () => {
  it('CR 505.1a: cresce e produz mana só na sua primeira fase principal', () => {
    const tg = setup({ step: 'upkeep', battlefield: [[N], []], library: [['Forest', 'Forest', 'Forest'], ['Island', 'Island', 'Island']] });
    tg.passUntil((jogo) => jogo.state.turn.step === 'main1' && jogo.state.zones.stack.length > 0);
    // CR 605.1b: a habilidade não é uma habilidade de mana; pode receber respostas na pilha.
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1'] ?? 0).toBe(0);
    expect(verdes(tg)).toEqual([]);
    tg.resolve();
    expect(tg.pt(tg.bf(N))).toEqual([1, 2]);
    expect(verdes(tg)).toEqual(['G']);
    tg.passTo('main2', 0);
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
    expect(verdes(tg)).toEqual([]);
    tg.passTo('main1', 1);
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
    expect(verdes(tg)).toEqual([]);
    tg.passTo('main1', 0);
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(2);
    expect(verdes(tg)).toEqual(['G', 'G']);
  });

  it('conta todos os marcadores, incluindo o que acabou de colocar', () => {
    const tg = setup({ step: 'upkeep', battlefield: [[{ name: N, counters: { '+1/+1': 2, charge: 2, reach: 1 } }], []], library: [['Forest'], []] });
    tg.passTo('main1');
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(3);
    expect(verdes(tg)).toEqual(Array(6).fill('G'));
  });

  it('CR 608.2h: se sair em resposta, usa os marcadores da última informação conhecida', () => {
    const tg = setup({ step: 'upkeep', battlefield: [[{ name: N, counters: { '+1/+1': 2, charge: 1 } }], []], library: [['Forest'], []] });
    tg.passUntil((jogo) => jogo.state.turn.step === 'main1' && jogo.state.zones.stack.length > 0);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolve();
    expect(tg.find(N)).toBeNull();
    expect(tg.state.objects[tg.find(N, 'graveyard')!].counters).toEqual({});
    expect(verdes(tg)).toEqual(['G', 'G', 'G']);
  });

  it('descarta da mão como custo e põe dois marcadores na criatura alvo de qualquer jogador', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).activate(N, 'Transferir simbionte');
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
    tg.resolve();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([4, 12]);
  });

  it('não transfere o simbionte do campo nem do cemitério', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest'], ['Indomitable Ancients']], graveyard: [[N], []] });
    expect(tg.actionIds().filter((acao) => acao.startsWith('act:'))).toEqual([]);
  });

  it('com a criatura alvo ilegal, o descarte continua pago e não há marcadores', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).activate(N, 'Transferir simbionte');
    tg.run(exile(tg.g, [tg.bf('Indomitable Ancients')]));
    tg.resolve();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    expect(tg.state.objects[tg.find('Indomitable Ancients', 'exile')!].counters).toEqual({});
  });
});
