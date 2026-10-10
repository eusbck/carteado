import { describe, expect, it } from 'vitest';
import { exile } from '../../motor/api.ts';
import { runEffect, fixture as setup } from '../../testes/artefatos.ts';

const N = "Launch Mishap";
describe(N, () => {
  it("anula criatura e cria Thopter, mas alvo que sai impede ambos os efeitos", () => {

    const tg = setup({ battlefield: [['Forest'], ['Island', 'Island', 'Island']], hand: [['Elvish Mystic'], [N]] }); tg.cast('Elvish Mystic').pass(); tg.choose('mágica de criatura ou planeswalker', ['Elvish Mystic']).cast(N).resolveAll(); expect(tg.find('Elvish Mystic', 'graveyard')).not.toBeNull(); expect(tg.all('Thopter')).toHaveLength(1);
    const illegal = setup({ battlefield: [['Forest'], ['Island', 'Island', 'Island']], hand: [['Elvish Mystic'], [N]] }); illegal.cast('Elvish Mystic').pass(); illegal.choose('mágica de criatura ou planeswalker', ['Elvish Mystic']).cast(N); runEffect(illegal, exile(illegal.g, [illegal.state.zones.stack[0]])); illegal.resolveAll(); expect(illegal.all('Thopter')).toHaveLength(0);
  });
});
