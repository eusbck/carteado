// Angelic Arbiter
// Flying
// Each opponent who cast a spell this turn can't attack with creatures.
// Each opponent who attacked with a creature this turn can't cast spells.
import { controllerOf, defineCard, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Angelic Arbiter',
  faces: [{
    abilities: [
      keyword('flying'),
      // rulings 1-2: no turno do oponente, ele conjura mágicas ou ataca, não os dois; ruling 4: conta o que ele fez no
      // turno antes de Angelic Arbiter entrar (as contagens do turno são do jogo, não desta carta)
      staticAbility({
        rules: {
          canAttack: (c, atacante) => {
            const p = controllerOf(c.g, atacante);
            return !(c.g.isOpponent(c.you, p) && c.g.state.turnStats[p].spellsCast > 0);
          },
        },
        text: 'Cada oponente que conjurou uma mágica neste turno não pode atacar com criaturas.',
      }),
      staticAbility({
        rules: { cantCastSpells: (c, p) => c.g.isOpponent(c.you, p) && c.g.state.turnStats[p].attacked },
        text: 'Cada oponente que atacou com uma criatura neste turno não pode conjurar mágicas.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: no seu turno, você conjura mágicas e ataca normalmente',
    2: 'teste: o oponente que conjurou uma mágica neste turno não pode atacar com criaturas',
    3: 'regra geral: CR 604.2 — saindo do campo, a habilidade estática deixa de valer (motor/chars.ts activeStatics)',
    4: 'teste: o oponente que conjurou uma mágica neste turno não pode atacar com criaturas',
    5: 'teste: o oponente que atacou com uma criatura neste turno não pode conjurar mágicas',
  },
});