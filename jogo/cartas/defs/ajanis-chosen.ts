// Ajani's Chosen
// Whenever an enchantment you control enters, create a 2/2 white Cat creature token. If that enchantment is an Aura,
// you may attach it to the token.
import { and, attach, controllerOf, createTokens, defineCard, enchantCandidates, is, isSubtype, on, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: "Ajani's Chosen",
  faces: [{
    abilities: [triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && and(is.enchantment, is.yours)(c, e.obj) ? { encantamento: e.obj } : false), function* (c) {
      const [gato] = yield* createTokens(c.g, c.you, 'Cat', 1);
      const aura = c.event.encantamento as ObjId;
      const o = c.g.state.objects[aura];
      // ruling 3: os dois precisam estar no campo; ruling 1: só se a Aura puder encantar a ficha
      if (gato === undefined || !o || o.zone !== 'battlefield' || !isSubtype(c.g, aura, 'Aura') || controllerOf(c.g, aura) !== c.you) return;
      if (!enchantCandidates(c.g, o.copyOf?.def ?? o.def, 0, c.you).includes(gato)) return;
      if (yield* yesNo(c.g, c.you, "Ajani's Chosen: anexar a Aura à ficha de Cat?")) attach(c.g, aura, gato);
    }, { text: 'Sempre que um encantamento que você controla entra, crie uma ficha de criatura Cat branca 2/2. Se esse encantamento for uma Aura, você pode anexá-la à ficha.' })],
  }],
  rulings: {
    1: 'teste: só anexa se a Aura puder encantar a ficha',
    2: 'regra geral: CR 303.4e — quem conjura a Aura a controla, mesmo encantando algo de um oponente',
    3: 'regra geral: CR 608.2b — a Aura e a ficha precisam estar no campo na resolução (conferido no efeito)',
    4: 'regra geral: CR 603.2 — só dispara quando o encantamento entra',
  },
});
