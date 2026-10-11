// Tri-Sentinel, Act of Vengeance
// Flying, menace, trample
// When Tri-Sentinel enters, for each opponent, Tri-Sentinel deals 3 damage to up to one target creature that player
// controls.
// Unearth {7} ({7}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of
// the next end step or if it would leave the battlefield. Unearth only as a sorcery.)
import { controllerOf, dealDamage, defineCard, etb, keywords, t, unearth } from '../../motor/api.ts';

export default defineCard({
  name: 'Tri-Sentinel, Act of Vengeance',
  faces: [{
    abilities: [
      ...keywords('flying', 'menace', 'trample'),
      etb(function* (c) {
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' ? [r.id] : []));
        if (ids.length) dealDamage(c.g, ids.map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: 3, combat: false })));
      }, {
        // "para cada oponente, até uma criatura alvo que esse jogador controla": no máximo uma por oponente
        targets: [{
          ...t.creature((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id)), 'para cada oponente, até uma criatura alvo que esse jogador controla'),
          min: 0, max: (c) => c.g.opponents(c.you).length,
          validateSet: (c, escolhidos) => {
            const donos = escolhidos.map((r) => (r.kind === 'obj' ? controllerOf(c.g, r.id) : -1));
            return new Set(donos).size === donos.length;
          },
        }],
        text: 'Quando Tri-Sentinel entra, para cada oponente, Tri-Sentinel causa 3 de dano a até uma criatura alvo que esse jogador controla.',
      }),
      // CR 702.84a
      unearth('{7}'),
    ],
  }],
  rulings: {},
});
