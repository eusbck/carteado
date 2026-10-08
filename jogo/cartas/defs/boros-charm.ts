// Boros Charm
// Choose one —
// • Boros Charm deals 4 damage to target player or planeswalker.
// • Permanents you control gain indestructible until end of turn.
// • Target creature gains double strike until end of turn.
import { controlledBy, dealDamage, defineCard, modal, t, tgt, tgtRef, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Boros Charm',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Causa 4 de dano ao jogador ou planeswalker alvo', targets: [t.playerOrPlaneswalker()],
          *effect(c) { const r = tgtRef(c); if (r) dealDamage(c.g, [{ source: c.source, target: r, amount: 4, combat: false }]); },
        },
        {
          text: 'Permanentes que você controla ganham indestrutível até o fim do turno',
          // CR 611.2c: só os permanentes que você controla na resolução
          *effect(c) { untilEndOfTurn(c, controlledBy(c.g, c.you), [{ k: 'addKeyword', kw: 'indestructible' }]); },
        },
        {
          text: 'A criatura alvo ganha golpe duplo até o fim do turno', targets: [t.creature()],
          *effect(c) { const id = tgt(c); if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'double strike' }]); },
        },
      ]),
    },
  }],
  rulings: {
    1: 'regra geral: CR 120.3c e 704.5i — dano tira lealdade e planeswalker sem lealdade vai ao cemitério sem ser destruído (testes/motor: 704.5i)',
    2: 'teste: indestrutível só para os permanentes que você controla na resolução',
  },
});
