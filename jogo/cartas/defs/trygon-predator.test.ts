import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Trygon Predator';

describe(N, () => {
  it('com dano de combate, pode destruir um artefato ou encantamento do jogador atingido', () => {
    const tg = setup({ players: 3, battlefield: [[N], ['Sol Ring', 'Indomitable Ancients'], ['Prismatic Lens']] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('artefato ou encantamento alvo')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.yes('destruir', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    // só os do jogador que tomou o dano
    expect(opcoes).toEqual(['Sol Ring']);
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Prismatic Lens')).not.toBeNull();
    expect(tg.life(1)).toBe(38);
  });
  it('você pode não destruir', () => {
    const tg = setup({ battlefield: [[N], ['Sol Ring']] });
    tg.yes('destruir', false);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
});
