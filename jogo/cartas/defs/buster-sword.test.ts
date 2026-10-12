import { describe, expect, it } from 'vitest';
import { attach } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Buster Sword';

describe(N, () => {
  it('no dano de combate a um jogador, compra uma carta e pode conjurar de graça uma mágica da mão com valor de mana até o dano', () => {
    const tg = setup({ battlefield: [[N, 'Wall of Omens', 'Silver Myr'], []], hand: [['Serra Angel', 'Elvish Mystic'], []], library: [['Shard of the Void Dragon', 'Island'], ['Island']] });
    attach(tg.g, tg.bf(N), tg.bf('Silver Myr'));
    tg.refresh();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([4, 3]);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Buster Sword')) return null;
      // dano 4: Serra Angel (5) e Shard of the Void Dragon (7) não cabem
      expect(d.items.map((i) => i.label)).toEqual(['Elvish Mystic']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.yes('Elvish Mystic', true).attack([['Silver Myr', 1]]).passTo('main2', 0).resolveAll();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.names(0, 'hand').sort()).toEqual(['Serra Angel', 'Shard of the Void Dragon']);
  });
});