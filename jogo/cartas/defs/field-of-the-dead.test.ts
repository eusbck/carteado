import { describe, expect, it } from 'vitest';
import { putOntoBattlefield } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Field of the Dead';
const zumbis = (tg: ReturnType<typeof setup>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Zombie 2/2').length;

describe(N, () => {
  it('conta ele mesmo e o terreno que entra', () => {
    // Forest, Island, Swamp, Mountain, Plains + Field = 6 nomes; jogando o Strip Mine, 7
    const tg = setup({ battlefield: [[N, 'Forest', 'Island', 'Swamp', 'Mountain', 'Plains'], []], hand: [['Strip Mine'], []] });
    tg.play('Strip Mine').resolveAll();
    expect(zumbis(tg)).toBe(1);
  });
  it('terrenos com o mesmo nome contam uma vez', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Island', 'Island', 'Swamp'], []], hand: [['Swamp'], []] });
    tg.play('Swamp').resolveAll();
    expect(zumbis(tg)).toBe(0);
  });
  it('terrenos que entram juntos disparam um cada e todos contam', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Island', 'Swamp', 'Mountain'], []], hand: [['Plains', 'Strip Mine'], []] });
    const ids = ['Plains', 'Strip Mine'].map((n) => tg.find(n, 'hand')!);
    runEffect(tg, putOntoBattlefield(tg.g, ids.map((id) => ({ id, controller: 0 })), 'effect'));
    tg.resolveAll();
    expect(zumbis(tg)).toBe(2);
  });
  it('entra virado e dá {C}', () => {
    const tg = setup({ hand: [[N], []] });
    tg.play(N);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});
