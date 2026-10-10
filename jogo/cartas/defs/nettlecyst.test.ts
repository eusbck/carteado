import { describe, expect, it } from 'vitest';
import { addEffect, attach } from '../../motor/api.ts';
import { removeCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Nettlecyst";
describe(N, () => {
  it("arma viva salva Germe das ações de estado e reequipar o faz morrer", () => {

    const tg = setup({ battlefield: [['Sol Ring', 'Island', 'Elvish Mystic'], []], hand: [[N], []] }); tg.cast(N).resolveAll(); const germ = tg.bf('Phyrexian Germ'); expect(tg.pt(germ)).toEqual([2, 2]); expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(germ);
    tg.state.objects[tg.bf('Sol Ring')].tapped = false; tg.g.bump(); tg.refresh(); tg.choose('criatura alvo que você controla', ['Elvish Mystic']).activate(N, 'Equipar').resolveAll(); expect(tg.find('Phyrexian Germ')).toBeNull(); expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 3]);
  });

  it("artefato encantamento conta uma vez e destruir criatura preserva Equipamento", () => {

    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Elvish Mystic'], []] }); const ring = tg.bf('Sol Ring'); addEffect(tg.g, { source: ring, sourceDef: '', controller: 0, duration: { kind: 'permanent' }, affected: [ring], mods: [{ k: 'addTypes', types: ['Enchantment'] }] }); attach(tg.g, tg.bf(N), tg.bf('Elvish Mystic')); expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 3]); removeCard(tg, tg.bf('Elvish Mystic')); expect(tg.find(N)).not.toBeNull();
  });
});
