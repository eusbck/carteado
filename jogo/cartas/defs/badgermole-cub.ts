// Badgermole Cub
// When this creature enters, earthbend 1. (Target land you control becomes a 0/0 creature with haste that's still a
// land. Put a +1/+1 counter on it. When it dies or is exiled, return it to the battlefield tapped.)
// Whenever you tap a creature for mana, add an additional {G}.
import { addMana, and, defineCard, earthbend, etb, is, isCreature, on, staticAbility, t, tgt, triggered } from '../../motor/api.ts';

const DOBRAR = 'regra geral: CR 701.66a — dobrar a terra (motor/terra.ts earthbend)';

export default defineCard({
  name: 'Badgermole Cub',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* earthbend(c, id, 1);
      }, { targets: [t.land(and(is.yours), 'terreno alvo que você controla')], text: 'Quando esta criatura entra, dobre a terra 1. (O terreno alvo que você controla se torna uma criatura 0/0 com ímpeto e continua sendo terreno. Coloque um marcador +1/+1 nele. Quando ele morrer ou for exilado, devolva-o ao campo virado.)' }),
      // avisa o pagamento automático da mana a mais
      staticAbility({ rules: { extraManaForPlanning: (c, player, source, produced, tapped) => (player === c.you && tapped && !!c.g.state.objects[source] && isCreature(c.g, source) && produced.length ? ['G'] : []) } }),
      // ruling 1: habilidade de mana desencadeada (CR 605.1b), sem pilha; ruling 5: só com {T} no custo da habilidade de
      // mana da própria criatura (o evento traz tappedForMana)
      triggered(on.custom((e, c) => e.type === 'mana' && e.player === c.you && !!e.tappedForMana && !!c.g.state.objects[e.source] && isCreature(c.g, e.source)), function* (c) {
        addMana(c.g, c.you, ['G'], { source: c.source });
      }, { mana: true, text: 'Sempre que você vira uma criatura para gerar mana, adicione {G} a mais.' }),
    ],
  }],
  rulings: {
    1: 'teste: virar uma criatura para mana gera {G} a mais',
    2: 'teste: dobra a terra: a Planície vira criatura 1/1 com ímpeto e continua Planície',
    3: DOBRAR,
    4: 'regra geral: CR 701.66a — só volta se morrer ou for exilado (motor/terra.ts, gatilho atrasado)',
    5: 'teste: virar uma criatura para mana gera {G} a mais; terreno não',
    6: 'regra geral: CR 608.2b — com o alvo ilegal, o gatilho não resolve (motor/stack.ts)',
    7: DOBRAR,
    8: 'teste: quando o terreno dobrado morre, volta ao campo virado',
  },
});
