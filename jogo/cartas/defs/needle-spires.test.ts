import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = 'Needle Spires';

describe(NOME, () => {
  it('CR 605: produz {R} ou {W}', () => expect(alternativasDeMana(NOME)).toEqual(['R', 'W']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('vira uma criatura Elemental 2/1 vermelha e branca com golpe duplo e continua terreno; sem a habilidade é incolor', () => {
    const tg = setup({ battlefield: [[NOME, 'Mountain', 'Plains', 'Mountain', 'Plains'], []] });
    const id = tg.bf(NOME);
    expect(chars(tg.g, id).colors).toEqual([]);
    tg.activate(NOME, 'Elemental').resolve();
    const c = chars(tg.g, id);
    expect(c.types).toEqual(expect.arrayContaining(['Land', 'Creature']));
    expect(c.subtypes).toContain('Elemental');
    expect([...c.colors].sort()).toEqual(['R', 'W']);
    expect(tg.pt(id)).toEqual([2, 1]);
    expect(hasKw(tg.g, id, 'double strike')).toBe(true);
    tg.passTo('cleanup');
    expect(chars(tg.g, id).types).toEqual(['Land']);
  });
});
