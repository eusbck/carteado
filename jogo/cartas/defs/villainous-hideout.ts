// Villainous Hideout
// {T}: Add {C}.
// {T}: Add one mana of any color. Spend this mana only to cast a Villain spell or to activate an ability of a Villain
// source.
// {3}, {T}: Target Villain you control connives. Activate only as a sorcery. (Draw a card, then discard a card. If you
// discarded a nonland card, put a +1/+1 counter on that creature.)
import { activated, and, chars, connive, defineCard, defineFn, is, mana, t, tgt, type G } from '../../motor/api.ts';

const RESTRICAO = 'Villainous Hideout:villain';
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) => {
  if (purpose.obj === undefined) return false;
  const o = g.state.objects[purpose.obj];
  if (!o) return false;
  if (purpose.kind === 'spell') return chars(g, purpose.obj).subtypes.includes('Villain');
  if (purpose.kind !== 'ability') return false;
  // a habilidade pode vir como o objeto dela na pilha ou como a própria fonte
  const fonte = o.stack && o.stack.kind !== 'spell' ? o.stack.source : purpose.obj;
  if (fonte === undefined) return false;
  const ch = g.state.objects[fonte] ? chars(g, fonte) : g.state.lki[fonte]?.chars;
  return !!ch && ch.subtypes.includes('Villain');
});

export default defineCard({
  name: 'Villainous Hideout',
  faces: [{
    abilities: [
      mana('C'),
      mana('any', { restriction: RESTRICAO, text: '{T}: Adicione uma mana de qualquer cor. Gaste essa mana só para conjurar uma mágica de Villain ou ativar uma habilidade de uma fonte Villain.' }),
      activated('{3}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* connive(c.g, id);
      }, { timing: 'sorcery', targets: [t.permanent(and(is.yours, is.subtype('Villain')), 'Villain alvo que você controla')], text: '{3}, {T}: O Villain alvo que você controla trama. Ative só como feitiço.' }),
    ],
  }],
  rulings: {},
});
