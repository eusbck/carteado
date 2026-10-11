// Shizo, Death's Storehouse
// {T}: Add {B}.
// {B}, {T}: Target legendary creature gains fear until end of turn. (It can't be blocked except by artifact creatures
// and/or black creatures.)
import { activated, chars, defineAbility, defineCard, hasKw, is, mana, staticAbility, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// CR 702.36b: medo — só pode ser bloqueada por criaturas artefato e/ou criaturas pretas. O motor não tem a restrição
// de bloqueio do medo, então o efeito leva junto esta regra, que vale para as criaturas afetadas por ele enquanto durar.
const MEDO = defineAbility("Shizo, Death's Storehouse:medo", staticAbility({
  rules: {
    canBeBlockedBy: (c, atacante, bloqueadora) => {
      const e = (c as unknown as { effect?: { affected?: ObjId[] } }).effect;
      if (!e?.affected?.includes(atacante) || !hasKw(c.g, atacante, 'fear')) return true;
      const b = chars(c.g, bloqueadora);
      return b.types.includes('Artifact') || b.colors.includes('B');
    },
  },
  text: 'Medo (só pode ser bloqueada por criaturas artefato e/ou criaturas pretas).',
}));

export default defineCard({
  name: "Shizo, Death's Storehouse",
  faces: [{ abilities: [
    mana('B'),
    activated('{B}, {T}', function* (c) {
      const id = tgt(c);
      if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'fear' }, { k: 'rule', id: MEDO.id! }]);
    }, {
      targets: [t.creature(is.legendary, 'criatura lendária alvo')],
      text: '{B}, {T}: A criatura lendária alvo ganha medo até o fim do turno (só pode ser bloqueada por criaturas artefato e/ou criaturas pretas).',
    }),
  ] }],
  rulings: {},
});
