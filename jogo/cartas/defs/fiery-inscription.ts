// Fiery Inscription
// When this enchantment enters, the Ring tempts you.
// Whenever you cast an instant or sorcery spell, this enchantment deals 2 damage to each opponent.
import { dealDamage, defineCard, etb, is, on, ringTempts, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Fiery Inscription',
  faces: [{
    abilities: [
      // CR 701.54a
      etb(function* (c) { yield* ringTempts(c.g, c.you); }, { text: 'Quando este encantamento entra, o Anel tenta você.' }),
      // ruling 1: resolve antes da mágica que o disparou
      triggered(on.youCast(is.instantOrSorcery), function* (c) {
        dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 2, combat: false })));
      }, { text: 'Sempre que você conjura uma mágica instantânea ou de feitiço, este encantamento causa 2 de dano a cada oponente.' }),
    ],
  }],
  rulings: {
    1: 'teste: causa 2 de dano a cada oponente quando você conjura uma instantânea ou feitiço',
    2: 'regra geral: CR 701.54c — você recebe o emblema do Anel se ainda não tem, e ele ganha a próxima habilidade (motor/criaturas.ts ringTempts)',
    3: 'regra geral: CR 701.54a — o Anel tenta você mesmo sem criatura (motor/criaturas.ts ringTempts)',
    4: 'regra geral: CR 701.54a — escolher de novo o mesmo Portador do Anel conta como escolher (motor/criaturas.ts ringTempts)',
    5: 'regra geral: CR 701.54c — o Anel ganha as habilidades em ordem e as mantém (motor/criaturas.ts ringTempts)',
    6: 'regra geral: CR 701.54a — com criatura no campo, escolher é obrigatório (motor/criaturas.ts ringTempts)',
    7: 'regra geral: CR 701.54a — um emblema e um Portador do Anel por jogador (motor/criaturas.ts ringTempts)',
    8: 'não se aplica: nenhuma das habilidades de Fiery Inscription tem alvo',
  },
});
