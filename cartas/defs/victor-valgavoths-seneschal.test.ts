import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

describe("Victor, Valgavoth's Seneschal", () => {
  it('primeira: vigiar 2; segunda: oponentes descartam; terceira: criatura de um cemitério; da quarta em diante, nada; dois juntos disparam duas vezes', () => {
    const tg = setup({
      battlefield: [["Victor, Valgavoth's Seneschal"], []], hand: [['Ghostly Prison', 'Spirit Mantle', 'Sentinel\'s Eyes', 'Ethereal Armor'], ['Plains', 'Island']],
      graveyard: [[], ['Glissa Sunslayer']], library: [['Island', 'Island', 'Island'], ['Island']],
    });
    let vigias = 0;
    tg.script.push((d) => (d.kind === 'arrange' ? (vigias++, { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'top'])), order: d.items.map((i) => i.id) }) : null));
    const [prison, mantle] = tg.state.zones.hand[0];
    // dois encantamentos entram juntos: primeira e segunda vez
    tg.run(putOntoBattlefield(tg.g, [{ id: prison, controller: 0 }, { id: mantle, controller: 0, attachTo: tg.bf("Victor, Valgavoth's Seneschal") }], 'effect'));
    tg.choose('Descarte', ['Plains']);
    tg.resolveAll();
    expect(vigias).toBe(1);
    expect(tg.names(1, 'hand')).toEqual(['Island']);
    const [eyes, armor] = tg.state.zones.hand[0];
    tg.run(putOntoBattlefield(tg.g, [{ id: eyes, controller: 0, attachTo: tg.bf("Victor, Valgavoth's Seneschal") }], 'effect'));
    tg.resolveAll();
    expect(tg.find('Glissa Sunslayer')).not.toBeNull();
    tg.run(putOntoBattlefield(tg.g, [{ id: armor, controller: 0, attachTo: tg.bf("Victor, Valgavoth's Seneschal") }], 'effect'));
    tg.resolveAll();
    expect([vigias, tg.names(1, 'hand')]).toEqual([1, ['Island']]);
  });
});
