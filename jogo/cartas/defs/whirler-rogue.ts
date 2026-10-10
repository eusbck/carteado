// Whirler Rogue
// When this creature enters, create two 1/1 colorless Thopter artifact creature tokens with flying.
// Tap two untapped artifacts you control: Target creature can't be blocked this turn.
import { activated, createTokens, defineCard, etb, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: "Whirler Rogue",
  faces: [{
    abilities: [
      etb(function*(c) { yield* createTokens(c.g, c.you, 'Thopter', 2); }, { text: 'Quando entra, crie dois Thopter incolores 1/1 com voar.' }),
      activated('Tap two untapped artifacts you control', function*(c) { const id = tgt(c); if (id !== null) untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:cantBeBlocked' }]); }, { targets: [t.creature()], text: 'Vire dois artefatos desvirados seus: a criatura alvo não pode ser bloqueada neste turno.' }),
    ]
  }],
  rulings: {
    "1": "CR 302.6: teste: pode virar os Thopters recém-criados; custo não usa símbolo {T}.",
    "2": "CR 509.1, 506.4: teste: ganhar esta evasão depois de bloqueada não remove os bloqueadores."
  },
});
