import { describe, expect, it } from 'vitest';
import { addCounters, destroy, exile, untilEndOfTurn } from '../../motor/api.ts';
import { canBlock } from '../../motor/combat.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Sandman, Shifting Scoundrel';
const MANA = ['Forest', 'Forest', 'Forest', 'Forest', 'Forest'];

describe(N, () => {
  it('acompanha os terrenos que você controla, sem contar os do oponente', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Plains'], ['Forest', 'Forest']], hand: [['Forest'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    tg.play('Forest');
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    tg.run(destroy(tg.g, [tg.bf('Plains')]));
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
  });

  it('CR 604.3: a força e a resistência também são definidas fora do campo', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Plains'], []], hand: [[N], []], graveyard: [[N], []], exile: [[N], []], library: [[N], []] });
    for (const zona of ['hand', 'graveyard', 'exile', 'library'] as const) expect(tg.pt(tg.find(N, zona, 0)!)).toEqual([3, 3]);
    tg.cast(N);
    expect(tg.pt(tg.find(N, 'stack')!)).toEqual([3, 3]);
  });

  it('criaturas com força 2 não podem bloqueá-lo; com força 3 podem', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Indomitable Ancients'], ['Indomitable Ancients']] });
    const bloqueador = tg.bf('Indomitable Ancients', 1);
    expect(canBlock(tg.g, bloqueador, tg.bf(N))).toBe(false);
    expect(canBlock(tg.g, bloqueador, tg.bf('Indomitable Ancients', 0))).toBe(true);
    addCounters(tg.g, { kind: 'obj', id: bloqueador }, '+1/+1', 1, 1);
    expect(canBlock(tg.g, bloqueador, tg.bf(N))).toBe(true);
  });

  it('perder força depois da declaração não desfaz o bloqueio', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest'], [{ name: 'Indomitable Ancients', counters: { '+1/+1': 1 } }]] });
    tg.attack([[N, 1]]).block([['Indomitable Ancients', N]]);
    tg.passUntil((jogo) => jogo.state.turn.step === 'declareBlockers' && !!jogo.state.combat?.attackers[0]?.blocked);
    untilEndOfTurn({ g: tg.g, you: 0, source: tg.bf(N) }, [tg.bf('Indomitable Ancients')], [{ k: 'pt', p: -1, t: 0 }]);
    tg.refresh();
    expect(canBlock(tg.g, tg.bf('Indomitable Ancients'), tg.bf(N))).toBe(false);
    tg.passTo('main2');
    expect(tg.life(1)).toBe(40);
    expect(tg.find(N)).not.toBeNull();
  });

  it('do cemitério, devolve a si mesmo e o terreno alvo virados', () => {
    const tg = setup({ battlefield: [MANA, []], graveyard: [[N, 'Plains'], []] });
    tg.choose('carta de terreno alvo', ['Plains']).activate(N).resolve();
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
  });

  it('não ativa do campo, da mão ou sem terreno no seu cemitério', () => {
    const tg = setup({ battlefield: [[...MANA, N], []], hand: [[N], []], graveyard: [[N], ['Plains']] });
    expect(tg.actionIds().filter((acao) => acao.startsWith('act:'))).toEqual([]);
  });

  it('CR 608.2b: com o terreno alvo ilegal, Sandman não volta', () => {
    const tg = setup({ battlefield: [MANA, []], graveyard: [[N, 'Plains'], []] });
    tg.choose('carta de terreno alvo', ['Plains']).activate(N);
    tg.run(exile(tg.g, [tg.find('Plains', 'graveyard')!]));
    tg.resolve();
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });

  it('se Sandman sair do cemitério em resposta, o terreno alvo ainda volta', () => {
    const tg = setup({ battlefield: [MANA, []], graveyard: [[N, 'Plains'], []] });
    tg.choose('carta de terreno alvo', ['Plains']).activate(N);
    tg.run(exile(tg.g, [tg.find(N, 'graveyard')!]));
    tg.resolve();
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
  });
});
