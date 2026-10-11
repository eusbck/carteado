import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const F = 'Fact or Fiction';
const azuis = ['Island', 'Island', 'Island', 'Island'];
const topo = ['Plains', 'Swamp', 'Mountain', 'Forest', 'Wall of Omens', 'Sol Ring'];

describe(F, () => {
  it('o oponente separa as cinco do topo em duas pilhas; você escolhe a que vai para a mão', () => {
    const tg = setup({ battlefield: [azuis, []], hand: [[F], []], library: [topo, []] });
    let separou = -1;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('separe as cartas')) return null;
      separou = d.player;
      return { kind: 'select', ids: d.items.filter((i) => i.label === 'Wall of Omens' || i.label === 'Plains').map((i) => i.id) };
    });
    tg.choose('vai para a sua mão', ['Pilha 2: Swamp, Mountain, Forest']);
    tg.cast(F).resolve();
    expect(separou).toBe(1);
    expect(tg.names(0, 'hand').sort()).toEqual(['Forest', 'Mountain', 'Swamp']);
    expect(tg.names(0, 'graveyard').sort()).toEqual([F, 'Plains', 'Wall of Omens'].sort());
    expect(tg.names(0, 'library')).toEqual(['Sol Ring']);
  });
  it('uma pilha pode ficar vazia', () => {
    const tg = setup({ battlefield: [azuis, []], hand: [[F], []], library: [topo, []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('separe as cartas') ? { kind: 'select', ids: [] } : null));
    tg.choose('vai para a sua mão', ['Pilha 1: vazia']);
    tg.cast(F).resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'graveyard')).toHaveLength(6);
  });
  it('em multijogador, você escolhe o oponente que separa', () => {
    const tg = setup({ players: 3, battlefield: [azuis, [], []], hand: [[F], [], []], library: [topo, [], []] });
    let separou = -1;
    tg.choose('escolha o oponente', ['Carla']);
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('separe as cartas')) { separou = d.player; return { kind: 'select', ids: [] }; } return null; });
    tg.cast(F).resolve();
    expect(separou).toBe(2);
  });
});
