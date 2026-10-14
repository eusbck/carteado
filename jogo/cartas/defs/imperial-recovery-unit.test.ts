import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Imperial Recovery Unit';

describe(N, () => {
  it('ao atacar, devolve uma carta de criatura ou Veículo com valor de mana 2 ou menos do cemitério', () => {
    const tg = setup({ battlefield: [[N, 'Ripjaw Raptor'], []], graveyard: [["Smuggler's Copter", 'Elvish Mystic', 'Ripjaw Raptor', 'Sol Ring'], []] });
    tg.choose('Tripular:', ['Ripjaw Raptor']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    let alvos: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Veículo alvo com valor de mana 2') ? (alvos = d.items.filter((i) => !i.disabled).map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === "Smuggler's Copter")!.id] }) : null));
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(alvos.sort()).toEqual(['Elvish Mystic', "Smuggler's Copter"]);
    expect(tg.names(0, 'hand')).toEqual(["Smuggler's Copter"]);
  });
});
