import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Nevinyrral's Disk";
describe(N, () => {
  it("entra virado; destrói a si mesmo na resolução e preserva indestrutíveis e terrenos comuns", () => {

    const entering = setup({ battlefield: [['Sol Ring', 'Sol Ring'], []], hand: [[N], []] }); entering.cast(N).resolveAll(); expect(entering.state.objects[entering.bf(N)].tapped).toBe(true);
    const tg = setup({ battlefield: [[N, 'Island', 'Darksteel Citadel'], ['Zetalpa, Primal Dawn', 'Propaganda', 'Elvish Mystic']] }); tg.activate(N); expect(tg.find(N)).not.toBeNull(); tg.resolveAll();
    expect(tg.find(N, 'graveyard')).not.toBeNull(); expect(tg.find('Propaganda')).toBeNull(); expect(tg.find('Elvish Mystic')).toBeNull(); expect(tg.find('Island')).not.toBeNull(); expect(tg.find('Darksteel Citadel')).not.toBeNull(); expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
  });
});
