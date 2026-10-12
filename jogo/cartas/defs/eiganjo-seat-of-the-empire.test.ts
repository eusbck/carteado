import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Eiganjo, Seat of the Empire';

describe(N, () => {
  it('{T}: adiciona {W}', () => {
    const tg = setup({ battlefield: [[N], []] });
    activateMana(tg, N, 'W');
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['W']);
  });

  it('canalizar descarta a carta como custo e causa 4 de dano a uma atacante ou bloqueadora; custa {1} a menos por criatura lendária sua', () => {
    // com Skithiryx (lendária) o custo cai para {1}{W}
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Skithiryx, the Blight Dragon'], ['Serra Angel']], hand: [[N], []] });
    tg.attack([['Skithiryx, the Blight Dragon', 1]]).block([['Serra Angel', 'Skithiryx, the Blight Dragon']]).passTo('declareBlockers', 0);
    tg.script.push((d) => { const i = d.kind === 'select' ? d.items.find((x) => x.label === 'Serra Angel') : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.activate(N, 'Canalizar').resolveAll();
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});