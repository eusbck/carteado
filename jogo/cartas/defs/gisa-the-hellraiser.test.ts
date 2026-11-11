import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Gisa, the Hellraiser";

describe(C, () => {
  it('crime cria dois Zombie Rogues virados, com +1/+1 e ameaça', () => {
    const tg = setup({ battlefield: [[C, 'Thassa, Deep-Dwelling', ...Array(4).fill('Island')], ['Wall of Omens']] });
    tg.choose('outra criatura alvo', ['Wall of Omens']).activate('Thassa, Deep-Dwelling', 'Vire').resolveAll();
    const z = tg.all('Zombie Rogue');
    expect(z.length).toBe(2);
    expect(tg.state.objects[z[0]].tapped).toBe(true);
    expect(tg.pt(z[0])).toEqual([3, 3]);
    expect(hasKw(tg.g, z[0], 'menace')).toBe(true);
  });
});
