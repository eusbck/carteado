import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

const NOME = 'Ashling, Rekindled // Ashling, Rimebound';

describe(NOME, () => {
  it('ao entrar, pode descartar uma carta para comprar uma', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], []], hand: [[NOME, 'Plains'], []], library: [['Island'], []] });
    tg.yes('descartar uma carta', true).choose('escarte', ['Plains']).cast(NOME).resolve().resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('no campo, só valem as características da face para cima: pagando {U}, transforma e o verso dá duas manas de uma cor', () => {
    const tg = setup({ step: 'draw', battlefield: [[NOME, 'Island'], []], library: [['Plains'], []] });
    expect(chars(tg.g, tg.bf(NOME)).name).toBe('Ashling, Rekindled');
    tg.yes('Pagar {U}', true).choose('cor das duas manas', ['vermelho']);
    tg.passUntil((x) => x.state.turn.step === 'main1' && x.state.zones.stack.length === 1).resolve();
    tg.resolveAll();
    const id = tg.bf('Ashling, Rimebound');
    expect(chars(tg.g, id).name).toBe('Ashling, Rimebound');
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['R', 'R']);
    expect(tg.state.players[0].manaPool.every((m) => m.restriction)).toBe(true);
  });
  it('CR 701.28f: se já transformou, pagar não transforma de novo', () => {
    const tg = setup({ step: 'draw', battlefield: [[NOME, 'Island'], []], library: [['Plains'], []] });
    tg.passUntil((x) => x.state.turn.step === 'main1' && x.state.zones.stack.length === 1);
    tg.state.objects[tg.bf('Ashling, Rekindled')].face = 1; // transformou por outro meio enquanto o gatilho esperava
    tg.yes('Pagar {U}', true);
    tg.resolve();
    expect(tg.state.objects[tg.bf('Ashling, Rimebound')].face).toBe(1);
    expect(tg.state.players[0].manaPool.length).toBe(0); // não pagou
  });
});
