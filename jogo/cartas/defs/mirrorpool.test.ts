import { describe, expect, it } from 'vitest';
import { addMana } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Mirrorpool';

describe(N, () => {
  it('copia uma instantânea ou feitiço que você controla', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Swamp', 'Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Island', 'Island', 'Plains', 'Plains'], []] });
    // a mana da Night's Whisper já na reserva (para o pagamento automático não virar a Mirrorpool)
    addMana(tg.g, 0, ['B', 'B']);
    tg.refresh().cast("Night's Whisper");
    tg.activate(N, 'Copie');
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(4);
    expect(tg.life(0)).toBe(36);
    expect(tg.find(N)).toBeNull();
  });
  it('a ficha copia a criatura impressa, sem marcadores', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Sol Ring', 'Swamp', { name: 'Tunneling Geopede', counters: { '+1/+1': 2 } }], []] });
    tg.activate(N, 'Crie').resolve();
    const geos = tg.all('Tunneling Geopede');
    expect(geos.length).toBe(2);
    const ficha = geos.find((id) => tg.state.objects[id].isToken)!;
    expect(tg.pt(ficha)).toEqual([3, 2]);
  });
});
