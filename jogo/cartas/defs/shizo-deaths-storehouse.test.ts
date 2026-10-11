import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import { createTokens, hasKw } from '../../motor/api.ts';
import type { TestGame } from '../../testes/harness.ts';

const NOME = "Shizo, Death's Storehouse";
const DINA = 'Dina, Soul Steeper'; // criatura lendária sem evasão

/** ataca Bruno com Dina e devolve quem do Bruno podia bloqueá-la */
function bloqueadoras(tg: TestGame): string[] {
  let podem: string[] = [];
  const dina = tg.bf(DINA);
  tg.script.push((d) => {
    if (d.kind !== 'blockers') return null;
    podem = d.candidates.filter((x) => x.canBlock.includes(dina)).map((x) => tg.state.objects[x.obj].def).sort();
    return { kind: 'blockers', blocks: [] };
  });
  tg.attack([[DINA, 1]]).passTo('combatDamage');
  return podem;
}

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['B']));
  it('CR 702.36b: a criatura lendária alvo ganha medo: só criaturas artefato e/ou pretas bloqueiam', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', DINA], ['Indomitable Ancients', 'Viscera Seer']] });
    tg.run(createTokens(tg.g, 1, 'Scarecrow', 1));
    tg.choose('criatura lendária alvo', [DINA]).activate(NOME, 'medo').resolve();
    expect(hasKw(tg.g, tg.bf(DINA), 'fear')).toBe(true);
    expect(bloqueadoras(tg)).toEqual(['Scarecrow', 'Viscera Seer']);
  });
  it('sem o medo, qualquer criatura bloqueia', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', DINA], ['Indomitable Ancients', 'Viscera Seer']] });
    expect(bloqueadoras(tg)).toEqual(['Indomitable Ancients', 'Viscera Seer']);
  });
  it('o medo dura até o fim do turno', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', DINA], []], library: [['Island'], ['Island']] });
    tg.choose('criatura lendária alvo', [DINA]).activate(NOME, 'medo').resolve();
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, tg.bf(DINA), 'fear')).toBe(false);
  });
  it('só mira criatura lendária', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Elvish Mystic'], []] });
    tg.settle();
    const d = tg.pending;
    expect(d?.kind === 'priority' && d.actions.some((a) => a.id.startsWith('act:') && a.obj === tg.bf(NOME))).toBe(false);
  });
});
