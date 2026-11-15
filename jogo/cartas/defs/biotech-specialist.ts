// Biotech Specialist
// When this creature enters, create a Lander token. (It's an artifact with "{2}, {T}, Sacrifice this token:
// Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.")
// Whenever you sacrifice an artifact, this creature deals 2 damage to target opponent.
import { createTokens, dealDamage, defineCard, etb, lkiChars, on, t, tgtPlayer, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Biotech Specialist',
  faces: [{ abilities: [
    etb(function* (c) {
      yield* createTokens(c.g, c.you, 'Lander', 1);
    }, { text: 'Quando esta criatura entra, crie uma ficha de artefato Lander.' }),
    // CR 603.10, 608.2h: o tipo do artefato e a fonte que saiu usam a última informação conhecida.
    triggered(on.custom((e, c) => e.type === 'sacrifice' && e.player === c.you && !!lkiChars(c.g, e.old)?.types.includes('Artifact')), function* (c) {
      const p = tgtPlayer(c);
      if (p !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: p }, amount: 2, combat: false }]);
    }, { targets: [t.opponent()], text: 'Sempre que você sacrifica um artefato, esta criatura causa 2 de dano ao oponente alvo.' }),
  ] }],
  rulings: {},
});
