import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

const N = 'Colossal Clone Master';
const terrenos = ['Island', 'Island', 'Island', 'Forest', 'Plains', 'Swamp'];

describe(N, () => {
  it('entra como cópia de uma criatura lendária de um oponente, sem ser lendária e com força e resistência pelos terrenos de nomes diferentes', () => {
    const tg = setup({ battlefield: [terrenos, ['Captain Kirk, Boldly Going']], hand: [[N], []] });
    tg.choose('entrar como cópia', ['Captain Kirk, Boldly Going']);
    tg.cast(N).resolveAll();
    const copia = tg.state.zones.battlefield.find((id) => tg.state.objects[id].controller === 0 && chars(tg.g, id).name === 'Captain Kirk, Boldly Going')!;
    expect(copia).toBeDefined();
    expect(chars(tg.g, copia).supertypes).not.toContain('Legendary');
    // Island, Forest, Plains, Swamp: quatro nomes
    expect(tg.pt(copia)).toEqual([4, 4]);
  });
});
