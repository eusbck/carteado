import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mistblade Shinobi';

describe(N, () => {
  it('com dano de combate, devolve uma criatura do jogador atingido', () => {
    const tg = setup({ players: 3, battlefield: [[N], ['Indomitable Ancients'], ['Wall of Omens']] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('esse jogador controla')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.yes('devolver', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(opcoes).toEqual(['Indomitable Ancients']);
    expect(tg.find('Indomitable Ancients', 'hand', 1)).not.toBeNull();
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
});
