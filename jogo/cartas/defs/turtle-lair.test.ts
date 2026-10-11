import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const NOME = 'Turtle Lair';

function podeSerBloqueada(tg: TestGame, criatura: string): boolean {
  const id = tg.bf(criatura);
  let pode = false;
  tg.script.push((d) => (d.kind === 'blockers' ? (pode = d.candidates.some((x) => x.canBlock.includes(id)), { kind: 'blockers', blocks: [] }) : null));
  tg.attack([[criatura, 1]]).passTo('main2');
  return pode;
}

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'C', 'G', 'R', 'U', 'W']));
  it('CR 106.6: a mana colorida só paga mágicas Ninja ou Turtle', () => {
    // Brainstorm ({U}) não é Ninja nem Turtle
    expect(setup({ battlefield: [[NOME], []], hand: [['Brainstorm'], []] }).canCast('Brainstorm')).toBe(false);
    // Kappa Cannoneer ({5}{U}) é uma Turtle: o {U} sai do covil
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring', 'Sol Ring'], []], hand: [['Kappa Cannoneer'], []] });
    expect(tg.canCast('Kappa Cannoneer')).toBe(true);
    tg.cast('Kappa Cannoneer').resolve();
    expect(tg.find('Kappa Cannoneer')).not.toBeNull();
  });
  it('{3}, {T}: o Ninja ou Turtle alvo não pode ser bloqueado neste turno', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [[NOME, 'Sol Ring', 'Plains', 'Kappa Cannoneer', 'Elvish Mystic'], ['Indomitable Ancients']] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Ninja ou Turtle alvo')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Kappa Cannoneer')!.id] };
    });
    tg.activate(NOME, 'bloqueado').resolve();
    expect(alvos).toEqual(['Kappa Cannoneer']);
    expect(podeSerBloqueada(tg, 'Kappa Cannoneer')).toBe(false);
  });
});
