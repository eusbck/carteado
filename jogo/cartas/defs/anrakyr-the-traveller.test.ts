import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Anrakyr the Traveller';

describe(N, () => {
  it('atacando, conjura um artefato da mão ou do cemitério pagando vida igual ao valor de mana', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Elvish Mystic'], []], graveyard: [['Canoptek Spyder', 'Serra Angel'], []] });
    const vida = tg.life(0);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Anrakyr')) return null;
      expect(d.items).toHaveLength(1);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.find('Canoptek Spyder')).not.toBeNull();
    expect(tg.life(0)).toBe(vida - 5);
  });
});