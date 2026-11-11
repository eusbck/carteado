// "[criatura] bloqueia [atacante] neste combate se puder" (exigência de bloqueio, CR 509.1c; Fighter Class)
import { describe, expect, it } from 'vitest';
import { addEffect } from '../motor/api.ts';
import { blockCandidates, forcedBlocks, validateBlocks } from '../motor/combat.ts';
import { defaultAnswer } from '../motor/ask.ts';
import { setup } from './harness.ts';

describe('bloqueio obrigatório (CR 509.1c)', () => {
  it('quem precisa bloquear e pode, precisa bloquear a atacante exigida; a resposta padrão já cumpre', () => {
    const tg = setup({ battlefield: [[{ name: 'Elvish Mystic', ready: true }, { name: 'Dina, Essence Brewer', ready: true }], ['Wall of Omens', 'Indomitable Ancients']], step: 'main1' });
    tg.attack([['Elvish Mystic', 1], ['Dina, Essence Brewer', 1]]).passTo('declareBlockers');
    const elfo = tg.bf('Elvish Mystic'), dina = tg.bf('Dina, Essence Brewer'), wall = tg.bf('Wall of Omens');
    addEffect(tg.g, { source: elfo, sourceDef: '', controller: 0, affected: [wall], duration: { kind: 'endOfTurn' }, mods: [{ k: 'rule', id: 'rule:blocksIfAble', params: { attacker: elfo } }] });
    expect(forcedBlocks(tg.g, blockCandidates(tg.g, 1))).toEqual([[wall, [elfo]]]);
    expect(validateBlocks(tg.g, 1, [])).not.toBeNull();
    expect(validateBlocks(tg.g, 1, [[wall, dina]])).not.toBeNull();
    expect(validateBlocks(tg.g, 1, [[wall, elfo]])).toBeNull();
    const d = { kind: 'blockers', player: 1, prompt: '', candidates: blockCandidates(tg.g, 1), attackers: [elfo, dina], forced: forcedBlocks(tg.g, blockCandidates(tg.g, 1)) } as never;
    expect(validateBlocks(tg.g, 1, (defaultAnswer(d) as { blocks: [number, number][] }).blocks)).toBeNull();
  });
  it('criatura virada não precisa bloquear', () => {
    const tg = setup({ battlefield: [[{ name: 'Elvish Mystic', ready: true }], [{ name: 'Wall of Omens', tapped: true }]], step: 'main1' });
    tg.attack([['Elvish Mystic', 1]]).passTo('declareBlockers');
    const elfo = tg.bf('Elvish Mystic'), wall = tg.bf('Wall of Omens');
    addEffect(tg.g, { source: elfo, sourceDef: '', controller: 0, affected: [wall], duration: { kind: 'endOfTurn' }, mods: [{ k: 'rule', id: 'rule:blocksIfAble', params: { attacker: elfo } }] });
    expect(validateBlocks(tg.g, 1, [])).toBeNull();
  });
});
