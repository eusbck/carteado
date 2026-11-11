// Tireless Tracker
// Landfall — Whenever a land you control enters, investigate. (Create a Clue token. It's an artifact with "{2},
// Sacrifice this token: Draw a card.")
// Whenever you sacrifice a Clue, put a +1/+1 counter on this creature.
import { addCounters, defineCard, investigate, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Tireless Tracker',
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) { yield* investigate(c.g, c.you, 1); }, {
        text: 'Aterragem — Sempre que um terreno que você controla entra, investigue. (Crie uma ficha Clue: um artefato com "{2}, sacrifique esta ficha: compre uma carta".)',
      }),
      // rulings 5-7: qualquer Clue (ficha ou não), sacrificada por qualquer motivo; olha a última informação conhecida
      triggered(on.custom((e, c) => {
        if (e.type !== 'sacrifice' || e.player !== c.you) return false;
        const l = c.g.state.lki[e.old]?.chars;
        return !!l && l.types.includes('Artifact') && l.subtypes.includes('Clue');
      }), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que você sacrifica uma Clue, coloque um marcador +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: jogando um terreno, investiga',
    2: 'regra geral: CR 603.3b — vários gatilhos de aterragem vão para a pilha na ordem que você escolher',
    3: 'regra geral: CR 603.6a — permanente que já está no campo e vira terreno não dispara (motor/dsl.ts on.landfall)',
    4: 'regra geral: CR 118.3 — um objeto sacrificado só paga um custo (motor/costs.ts)',
    5: 'regra geral: CR 205.3g — Clue é tipo de artefato; o gatilho olha o subtipo, não o nome',
    6: 'regra geral: CR 205.3g — qualquer artefato Clue serve, ficha ou não (o gatilho olha o subtipo)',
    7: 'teste: sacrificando a Clue para comprar, recebe um marcador +1/+1',
    8: 'não se aplica: o investigar da Tireless Tracker não tem alvo',
  },
});
