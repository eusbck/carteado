import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup, entraVirado } from '../../testes/padroes.ts';

const NOME = "Silverquill Campus";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","W"]));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('{4}, {T}: vidência 1', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring'], []], library: [['Forest', 'Island'], []] });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'bottom'])), order: d.items.map((i) => i.id) } : null));
    tg.activate(NOME, 'Vidência').resolve();
    expect(tg.names(0, 'library')).toEqual(['Island', 'Forest']);
  });
});
