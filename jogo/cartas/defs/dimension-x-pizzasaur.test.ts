import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Dimension X Pizzasaur';

describe(N, () => {
  it('ao entrar põe dois marcadores na criatura alvo e, ao fazer isso, destrói até uma criatura de valor de mana baixo', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Swamp'), 'Silver Myr'], ['Elvish Mystic', 'Serra Angel']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Silver Myr']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('valor de mana até')) return null;
      // dois marcadores: o Serra Angel (valor 5) não é alvo
      expect(d.items.map((i) => i.label)).not.toContain('Serra Angel');
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Elvish Mystic')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([3, 3]);
    expect(tg.find('Elvish Mystic')).toBeNull();
  });

  it('{2}, {T}, sacrifique: você ganha 3 de vida e cada oponente perde 3', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp'], []] });
    const [eu, ele] = [tg.life(0), tg.life(1)];
    tg.activate(N).resolveAll();
    expect(tg.find(N)).toBeNull();
    expect([tg.life(0), tg.life(1)]).toEqual([eu + 3, ele - 3]);
  });
});