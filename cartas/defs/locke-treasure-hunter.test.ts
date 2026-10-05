import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Locke, Treasure Hunter', () => {
  it('um Tesouro só, mesmo com vários terrenos; depois de conjurar uma, a permissão acaba', () => {
    const tg = setup({
      players: 3, battlefield: [['Locke, Treasure Hunter', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Wall of Omens'], []],
      library: [['Plains', 'Island'], ["Night's Whisper", 'Island'], ['Forest', 'Island']],
    });
    let bloqueia = true;
    tg.script.push((d) => (d.kind === 'blockers' ? (bloqueia = d.candidates.some((x) => x.canBlock.length > 0), { kind: 'blockers', blocks: [] }) : null));
    tg.attack([['Locke, Treasure Hunter', 1]]).passTo('declareAttackers').resolveAll();
    expect(tg.all('Treasure').length).toBe(1);
    tg.passTo('main2');
    expect(bloqueia).toBe(true); // Wall of Omens tem força 0
    expect(tg.canCast("Night's Whisper")).toBe(true);
    tg.cast("Night's Whisper", '*').resolve();
    expect(tg.state.effects.some((e) => e.mods.some((m) => m.k === 'rule' && m.id === 'rule:mayPlay'))).toBe(false);
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false); // terrenos moídos não podem ser jogados
  });
  it('não pode ser bloqueado por criaturas com força maior', () => {
    const tg = setup({ battlefield: [['Locke, Treasure Hunter'], ['Glissa Sunslayer', 'Elvish Mystic']], library: [['Plains'], ['Island']] });
    let cands: number[] = [];
    tg.script.push((d) => (d.kind === 'blockers' ? (cands = d.candidates.filter((x) => x.canBlock.length > 0).map((x) => x.obj), { kind: 'blockers', blocks: [] }) : null));
    tg.attack([['Locke, Treasure Hunter', 1]]).passTo('main2');
    expect(cands).toEqual([tg.bf('Elvish Mystic')]);
  });
});
