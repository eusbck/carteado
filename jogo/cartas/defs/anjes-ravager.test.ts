import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { discard } from '../../motor/actions.ts';

const RAV = "Anje's Ravager";
const lib = ['Plains', 'Plains', 'Plains', 'Plains'];

describe("Anje's Ravager", () => {
  it('ataca: descarta a mão e compra três; descartada durante a resolução, a carta com loucura vai para o exílio e a loucura vem depois', () => {
    const tg = setup({ battlefield: [[RAV, 'Mountain', 'Mountain'], []], hand: [['Stromkirk Occultist', 'Island'], []], library: [lib, []] });
    let maoNaHora = -1;
    let exiladaNaHora = false;
    tg.script.push((d, t) => {
      if (d.kind !== 'select' || !d.prompt.startsWith('Loucura')) return null;
      maoNaHora = t.state.zones.hand[0].length;
      exiladaNaHora = t.find('Stromkirk Occultist', 'exile') !== null;
      return { kind: 'select', ids: ['yes'] };
    });
    tg.attack([[RAV, 1]]).passTo('declareBlockers');
    // compra as três antes de decidir a loucura (ruling 11)
    expect(maoNaHora).toBe(3);
    expect(exiladaNaHora).toBe(true);
    expect(tg.find('Island', 'graveyard', 0)).not.toBeNull();
    // conjurada pela loucura, entra no campo
    expect(tg.find('Stromkirk Occultist')).not.toBeNull();
  });

  it('sem conjurar, vai para o cemitério', () => {
    const tg = setup({ battlefield: [[RAV, 'Mountain', 'Mountain'], []], hand: [['Stromkirk Occultist'], []], library: [lib, []] });
    tg.yes('Loucura', false).attack([[RAV, 1]]).passTo('declareBlockers');
    expect(tg.find('Stromkirk Occultist', 'graveyard', 0)).not.toBeNull();
    expect(tg.find('Stromkirk Occultist', 'exile')).toBeNull();
  });

  it('compra três mesmo sem cartas na mão', () => {
    const tg = setup({ battlefield: [[RAV], []], library: [lib, []] });
    tg.attack([[RAV, 1]]).passTo('declareBlockers');
    expect(tg.state.zones.hand[0].length).toBe(3);
  });

  it('ataca a cada combate se puder', () => {
    const tg = setup({ battlefield: [[RAV], []], library: [lib, []] });
    let exigida = false;
    tg.script.push((d) => { if (d.kind === 'attackers') exigida = !!d.candidates.find((c) => c.required?.length); return null; });
    tg.passTo('declareBlockers');
    expect(exigida).toBe(true);
  });

  it('conjurada pela loucura no turno de outro jogador (ignora o tempo de criatura)', () => {
    const tg = setup({ active: 1, battlefield: [['Mountain', 'Mountain'], []], hand: [[RAV], []] });
    tg.yes('Loucura', true);
    tg.run(discard(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.find(RAV)).not.toBeNull();
    expect(tg.state.turn.active).toBe(1);
  });
});
