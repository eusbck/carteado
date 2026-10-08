import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup, entraVirado } from '../../testes/padroes.ts';

const NOME = "Spectacle Summit";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["R","U"]));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('{2}{U}{R}, {T}: vigiar 1', () => {
    const tg = setup({ battlefield: [[NOME, 'Island', 'Mountain', 'Sol Ring'], []], library: [['Forest', 'Island'], []] });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'graveyard'])), order: d.items.map((i) => i.id) } : null));
    tg.activate(NOME, 'Vigiar').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
  });
});
