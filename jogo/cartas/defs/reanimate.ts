// Reanimate — Put target creature card from a graveyard onto the battlefield under your control.
// You lose life equal to that card's mana value.
import { defineCard, is, loseLife, manaValue, putOntoBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Reanimate',
  faces: [{
    spell: {
      targets: [t.card('graveyard', is.creature, 'carta de criatura alvo num cemitério', 'any')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const mv = manaValue(c.g, id);
        yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'reanimate');
        loseLife(c.g, c.you, mv, c.source);
      },
    },
  }],
  rulings: {
    1: "teste: põe uma criatura de qualquer cemitério sob seu controle e você perde vida igual ao valor de mana",
    2: "teste: gatilhos de entrar resolvem depois da perda de vida",
    3: "teste: CR 800.4a: se você sai da partida, a criatura reanimada de outro dono é exilada",
    4: "não se aplica: nenhuma carta dos decks reage à perda de vida de quem a controla assim (Platinum Emperion)",
    5: "regra geral: CR 107.3g (X vale 0 fora da pilha; motor/mana.ts manaValueOf)",
  },
});
