import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Excalibur, Sword of Eden';

describe(N, () => {
  it('custa {X} a menos, X = valor de mana total das suas permanentes históricas; equipa só criatura lendária: +10/+0 e vigilância', () => {
    // Necron Monolith (7) e Skithiryx (5) somam 12: sai de graça; Plains para o equipar
    const tg = setup({ battlefield: [['Necron Monolith', 'Skithiryx, the Blight Dragon', 'Serra Angel', 'Plains', 'Plains'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(false);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura lendária alvo')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Skithiryx, the Blight Dragon']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N, 'Equipar').resolveAll();
    const dragao = tg.bf('Skithiryx, the Blight Dragon');
    expect(tg.pt(dragao)).toEqual([14, 4]);
    expect(hasKw(tg.g, dragao, 'vigilance')).toBe(true);
    const caro = setup({ battlefield: [['Serra Angel', 'Plains', 'Plains'], []], hand: [[N], []] });
    expect(caro.canCast(N)).toBe(false);
  });
});