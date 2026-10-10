import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Aetherize";
describe(N, () => {
  it("devolve todos os atacantes aos donos, mas não bloqueadores ou criaturas que não atacaram", () => {

    const tg = setup({ battlefield: [['Elvish Mystic', 'Silver Myr'], ['Island', 'Island', 'Island', 'Island', 'Wall of Omens']], hand: [[], [N]] }); tg.attack([['Elvish Mystic', 1]]).passTo('declareAttackers').pass();
    tg.cast(N).resolveAll(); expect(tg.names(0, 'hand')).toContain('Elvish Mystic'); expect(tg.find('Silver Myr')).not.toBeNull(); expect(tg.find('Wall of Omens')).not.toBeNull();
  });
});
