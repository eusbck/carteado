// Aetherflux Reservoir
// Whenever you cast a spell, you gain 1 life for each spell you've cast this turn.
// Pay 50 life: This artifact deals 50 damage to any target.
import { activated, dealDamage, defineCard, gainLife, on, t, tgtRef, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Aetherflux Reservoir',
  faces: [{
    abilities: [
      // rulings 1-3: conta na resolução todas as mágicas que você conjurou no turno, anuladas ou não, mesmo as de antes
      // de o Reservoir entrar; ruling 4: ele mesmo, sendo conjurado, ainda não está no campo para disparar
      triggered(on.youCast(), function* (c) {
        gainLife(c.g, c.you, c.g.state.turnStats[c.you].spellsCast, c.source);
      }, { text: 'Sempre que você conjura uma mágica, você ganha 1 de vida para cada mágica que conjurou neste turno.' }),
      activated('Pay 50 life', function* (c) {
        const alvo = tgtRef(c);
        if (alvo) dealDamage(c.g, [{ source: c.source, target: alvo, amount: 50, combat: false }]);
      }, { targets: [t.any()], text: 'Pague 50 de vida: Este artefato causa 50 de dano a qualquer alvo.' }),
    ],
  }],
  rulings: {
    1: 'teste: a segunda mágica do turno dá 2 de vida, contando a que disparou',
    2: 'regra geral: CR 601.2i — conta as mágicas conjuradas no turno, anuladas ou não, inclusive antes de o Reservoir entrar (turnStats.spellsCast)',
    3: 'teste: a segunda mágica do turno dá 2 de vida, contando a que disparou',
    4: 'teste: conjurar o próprio Aetherflux Reservoir não dispara',
  },
});