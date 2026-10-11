import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Negative Zone Portal';
const lib = Array(12).fill('Forest');

describe(N, () => {
  it('exila a carta alvo do cemitério de um oponente e compra uma carta se for de criatura', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], graveyard: [['Elvish Mystic'], ['Elvish Mystic', 'Preordain']], library: [lib, lib] });
    tg.choose('carta alvo', ['Elvish Mystic']).activate(N, '{2}, {T}').resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Elvish Mystic']);
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('carta que não é de criatura é exilada sem compra', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], graveyard: [[], ['Preordain']], library: [lib, lib] });
    tg.choose('carta alvo', ['Preordain']).activate(N, '{2}, {T}').resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Preordain']);
    expect(tg.names(0, 'hand')).toHaveLength(0);
  });

  it('com quatro criaturas exiladas, joga cara ou coroa na sua manutenção: perdendo, é sacrificado e uma carta volta para a mão do dono', () => {
    // várias sementes: em todas, ou o Portal fica e as quatro cartas continuam exiladas, ou sai e uma volta para a mão
    let ganhou = 0;
    let perdeu = 0;
    for (let i = 0; i < 12; i++) {
      const tg = setup({ seed: `portal-${i}`, active: 1, battlefield: [[N], []], graveyard: [[], Array(4).fill('Elvish Mystic')], library: [lib, lib] });
      const portal = tg.bf(N);
      const ids = [...tg.state.zones.graveyard[1]];
      tg.state.objects[portal].linked.portal = [];
      for (const id of ids) {
        const o = tg.state.objects[id];
        tg.state.zones.graveyard[1].splice(tg.state.zones.graveyard[1].indexOf(id), 1);
        o.zone = 'exile';
        tg.state.zones.exile.push(id);
        tg.state.objects[portal].linked.portal.push(id);
      }
      tg.passTo('main1', 0);
      if (tg.find(N) !== null) {
        ganhou++;
        expect(tg.names(1, 'exile')).toHaveLength(4);
      } else {
        perdeu++;
        expect(tg.names(1, 'exile')).toHaveLength(3);
        expect(tg.names(1, 'hand').filter((n) => n === 'Elvish Mystic')).toHaveLength(1);
        expect(tg.names(0, 'graveyard')).toEqual([N]);
      }
    }
    expect(ganhou).toBeGreaterThan(0);
    expect(perdeu).toBeGreaterThan(0);
  });

  it('com menos de quatro criaturas exiladas, não há cara ou coroa', () => {
    const tg = setup({ active: 1, battlefield: [[N], []], library: [lib, lib] });
    tg.passTo('main1', 0);
    expect(tg.find(N)).not.toBeNull();
  });
});
