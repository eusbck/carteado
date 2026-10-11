// Archangel of Strife
// Flying
// As this creature enters, each player chooses war or peace.
// Creatures controlled by players who chose war get +3/+0.
// Creatures controlled by players who chose peace get +0/+3.
import { asEnters, chooseOne, controllerOf, defineCard, is, keyword, staticAbility } from '../../motor/api.ts';

type Escolha = 'war' | 'peace';

export default defineCard({
  name: 'Archangel of Strife',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: o jogador ativo escolhe primeiro e os outros veem as escolhas anteriores (o registro mostra cada uma)
      asEnters(function* (c, ev) {
        const escolhas: Record<number, Escolha> = {};
        for (const p of c.g.apnap()) {
          escolhas[p] = (yield* chooseOne(c.g, p, 'Archangel of Strife: guerra (as suas criaturas recebem +3/+0) ou paz (+0/+3)?', [{ id: 'war', label: 'Guerra' }, { id: 'peace', label: 'Paz' }])) as Escolha;
          c.g.log(`${c.g.state.players[p].name} escolhe ${escolhas[p] === 'war' ? 'guerra' : 'paz'}.`);
        }
        ev.choices.guerraOuPaz = escolhas;
      }, 'Ao entrar, cada jogador escolhe guerra ou paz.'),
      // rulings 2-5: vale desde a entrada, só para a escolha feita com este Archangel, e acaba quando ele sai do campo
      staticAbility({
        affects: (c, o) => is.creature(c, o.id),
        mods: (c, o) => {
          const escolhas = (c.g.state.objects[c.source]?.choices.guerraOuPaz ?? {}) as Record<number, Escolha>;
          const esc = escolhas[controllerOf(c.g, o.id)];
          return [{ k: 'pt', p: esc === 'war' ? 3 : 0, t: esc === 'peace' ? 3 : 0 }];
        },
        text: 'As criaturas controladas pelos jogadores que escolheram guerra recebem +3/+0. As criaturas controladas pelos jogadores que escolheram paz recebem +0/+3.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: cada jogador escolhe guerra ou paz, o ativo primeiro',
    2: 'teste: cada jogador escolhe guerra ou paz, o ativo primeiro',
    3: 'regra geral: CR 613.4c — os bônus de dois Archangels somam; cada um usa a escolha feita com ele (objeto.choices)',
    4: 'teste: saindo do campo, o bônus acaba',
    5: 'regra geral: CR 607.2d — as habilidades são vinculadas: o bônus depende só da escolha feita quando este Archangel entrou (objeto.choices)',
  },
});