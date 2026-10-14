import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Heartless Conscription';
const pantanos = Array(8).fill('Swamp');

describe(N, () => {
  it('exila todas as criaturas; você pode conjurar qualquer uma delas com mana de qualquer tipo; a mágica é exilada', () => {
    const tg = setup({ battlefield: [[...pantanos, 'Island', 'Island', 'Baleful Strix'], ['Elvish Mystic', 'Indomitable Ancients']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def !== 'Swamp' && tg.state.objects[id].def !== 'Island')).toEqual([]);
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([]);
    // Elvish Mystic ({G}) de Bruno com o terreno que sobrou
    const mystic = tg.find('Elvish Mystic', 'exile')!;
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(mystic)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].controller).toBe(0);
  });

  it('uma carta de terreno exilada assim se joga como terreno', () => {
    // Inkmoth Nexus animado é terreno e criatura
    const tg = setup({ battlefield: [[...pantanos, 'Swamp', 'Inkmoth Nexus'], []], hand: [[N], []] });
    tg.activate('Inkmoth Nexus', '{1}').resolveAll();
    tg.cast(N).resolveAll();
    const arbor = tg.find('Inkmoth Nexus', 'exile')!;
    const acao = tg.actionIds().find((a) => a.startsWith('play:') && a.split(':').includes(String(arbor)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.settle();
    expect(tg.state.objects[tg.bf('Inkmoth Nexus')].controller).toBe(0);
  });
});
