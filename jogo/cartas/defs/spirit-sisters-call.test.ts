import { describe, expect, it } from 'vitest';
import { destroy, sacrifice } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const SSC = "Spirit-Sister's Call";

describe(SSC, () => {
  it("devolve a criatura sacrificando outra, e ela é exilada em vez de morrer, mesmo sem o Spirit-Sister's Call", () => {
    const tg = setup({ step: 'main2', battlefield: [[SSC, 'Burnished Hart'], []], graveyard: [['Wall of Omens'], []], library: [['Island', 'Island'], ['Island']] });
    tg.choose('carta de permanente alvo', ['Wall of Omens']).choose("Spirit-Sister's Call: sacrificar", ['Burnished Hart']);
    tg.passTo('end');
    while (tg.state.zones.stack.length) tg.resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Burnished Hart']);
    const wall = tg.bf('Wall of Omens');
    // sem o Spirit-Sister's Call, a substituição continua
    runEffect(tg, sacrifice(tg.g, [tg.bf(SSC)]));
    runEffect(tg, destroy(tg.g, [wall]));
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.names(0, 'exile')).toEqual(['Wall of Omens']);
  });

  it('sem permanente que tenha um tipo em comum, nada acontece', () => {
    const tg = setup({ step: 'main2', battlefield: [[SSC, 'Sol Ring'], []], graveyard: [['Wall of Omens'], []], library: [['Island', 'Island'], ['Island']] });
    tg.choose('carta de permanente alvo', ['Wall of Omens']);
    tg.passTo('end');
    while (tg.state.zones.stack.length) tg.resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
});
