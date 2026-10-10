import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Foundry of the Consuls";
describe(N, () => {
  it("gera mana ou sacrifica para dois Thopters", () => {

    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Sol Ring', 'Island'], []] }); tg.activate(N, 'crie').resolveAll(); expect(tg.all('Thopter')).toHaveLength(2); expect(tg.find(N, 'graveyard')).not.toBeNull();
  });
});
