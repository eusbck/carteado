import { describe, expect, it } from 'vitest';
import { removeCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Chief of the Foundry";
describe(N, () => {
  it("outros artefatos recebem bônus; ao sair, dano antes não letal pode matar", () => {

    const tg = setup({ battlefield: [[N, { name: 'Silver Myr', damage: 1 }, 'Elvish Mystic'], []] }); expect(tg.pt(tg.bf(N))).toEqual([2, 3]); expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 2]);
    removeCard(tg, tg.bf(N)); tg.settle(); expect(tg.find('Silver Myr', 'graveyard')).not.toBeNull(); expect(tg.find('Elvish Mystic')).not.toBeNull();
  });
});
