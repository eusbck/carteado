import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';

const NOME = 'Kher Keep';

describe(NOME, () => {
  it('CR 605: {T}: adiciona {C}', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('{1}{R}, {T}: cria uma ficha Kobold vermelha 0/1 chamada Kobolds of Kher Keep', () => {
    const tg = setup({ battlefield: [[NOME, 'Mountain', 'Mountain'], []] });
    tg.activate(NOME, 'Kobold').resolve();
    const k = tg.bf('Kobolds of Kher Keep');
    const c = chars(tg.g, k);
    expect(tg.state.objects[k].isToken).toBe(true);
    expect([c.types, c.subtypes, c.colors]).toEqual([['Creature'], ['Kobold'], ['R']]);
    expect(tg.pt(k)).toEqual([0, 1]);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
    expect(tg.all('Mountain').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
  it('sem {R} disponível, não ativa', () => {
    const tg = setup({ battlefield: [[NOME, 'Island', 'Island'], []] });
    expect(tg.pending?.kind === 'priority' && tg.pending.actions.some((a) => a.label.includes('Kobold'))).toBe(false);
  });
  it('CR 704.5j: é lendário — com dois, um vai para o cemitério', () => {
    const tg = setup({ battlefield: [[NOME, NOME], []] });
    expect(chars(tg.g, tg.bf(NOME)).supertypes).toEqual(['Legendary']);
    expect(tg.all(NOME).length).toBe(1);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });
});
