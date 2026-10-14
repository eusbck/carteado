// Diluvian Primordial
// Flying
// When this creature enters, for each opponent, you may cast up to one target instant or sorcery card from that
// player's graveyard without paying its mana cost. If a spell cast this way would be put into a graveyard, exile it
// instead.
import { defineCard, etb, is, keyword, t, tgtsAll } from '../../motor/api.ts';
import type { TargetSpec } from '../../motor/defs.ts';
import { conjuraDentreGratis, ROUBO } from '../roubo.ts';

// "para cada oponente, até uma carta alvo do cemitério desse jogador" (ruling 1): uma lista só, no máximo uma por dono
const ALVOS: TargetSpec = {
  ...t.card('graveyard', is.instantOrSorcery, 'até uma carta de instantânea ou feitiço alvo do cemitério de cada oponente', 'opponent'),
  min: 0, max: (c) => c.g.opponents(c.you).length,
  validateSet: (c, escolhidos) => {
    const donos = escolhidos.map((r) => (r.kind === 'obj' ? c.g.state.objects[r.id]?.owner : -1));
    return new Set(donos).size === donos.length;
  },
};

export default defineCard({
  name: 'Diluvian Primordial',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const cartas = tgtsAll(c);
        if (!cartas.length) return;
        // ruling 2: uma de cada vez, na ordem que você escolher; rulings 7 e 9: exilada em vez de ir para o cemitério
        yield* conjuraDentreGratis(c, cartas, { rotulo: 'Diluvian Primordial', varias: true, exilaEmVezDoCemiterio: true });
      }, { targets: [ALVOS], text: 'Quando esta criatura entra, para cada oponente, você pode conjurar até uma carta de instantânea ou feitiço alvo do cemitério desse jogador sem pagar o custo de mana dela. Se uma mágica conjurada assim fosse para um cemitério, exile-a em vez disso.' }),
    ],
  }],
  rulings: {
    1: 'teste: no máximo uma carta alvo por oponente',
    2: 'teste: conjura uma de cada vez; a mágica conjurada assim é exilada depois de resolver',
    3: ROUBO.durante,
    4: 'teste: a carta que você não conjura fica no cemitério do dono',
    5: ROUBO.gratisAlternativo,
    6: ROUBO.gratisX,
    7: 'regra geral: CR 614.1a — anulada, a mágica também é exilada em vez de ir para o cemitério (motor/actions.ts exileInsteadOfGraveyard)',
    8: 'teste: Arcane Heist conjurada assim pode ser codificada (cartas/defs/arcane-heist.test.ts)',
    9: 'regra geral: CR 614.1a — a substituição só vale para o cemitério; outra zona não muda (motor/actions.ts)',
  },
});
