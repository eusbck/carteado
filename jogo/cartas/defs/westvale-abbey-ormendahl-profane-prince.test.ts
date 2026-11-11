import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Westvale Abbey // Ormendahl, Profane Prince";

describe(C, () => {
  it('cria Human Clerics e, com cinco sacrificadas, transforma e desvira', () => {
    const tg = setup({ battlefield: [[C, ...Array(5).fill('Swamp'), ...Array(5).fill({ name: 'Human Cleric', token: true })], []] });
    tg.activate('Westvale Abbey', 'Transforme').resolve();
    const id = tg.state.zones.battlefield.find((x) => tg.state.objects[x].def === C)!;
    expect(tg.state.objects[id].face).toBe(1);
    expect(tg.state.objects[id].tapped).toBe(false);
    expect(hasKw(tg.g, id, 'lifelink')).toBe(true);
  });
});
