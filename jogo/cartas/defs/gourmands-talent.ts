// Gourmand's Talent
// (Gain the next level as a sorcery to add its ability.)
// During your turn, artifacts you control are Foods in addition to their other types and have "{2}, {T}, Sacrifice this
// artifact: You gain 3 life."
// {2}{G}: Level 2
// Whenever you gain life for the first time each turn, create a 3/3 green Raccoon creature token.
// {3}{G}: Level 3
// Whenever you gain life for the first time each turn, put a +1/+1 counter on each creature you control.
import {
  activated, addCounters, controlledBy, controllerOf, createTokens, defineAbility, defineCard, gainLife, isCreature, isType, on,
  staticAbility, triggered,
} from '../../motor/api.ts';
import type { GameEvent } from '../../motor/events.ts';
import type { SCtx, TriggerSpec } from '../../motor/defs.ts';
import { COMIDA, nivelDeClasse } from '../esquilos.ts';

// a habilidade de Food que os artefatos ganham
const COMER = defineAbility("Gourmand's Talent:comer", activated('{2}, {T}, Sacrifice this artifact', function* (c) {
  gainLife(c.g, c.you, 3, c.source);
}, { text: '{2}, {T}, Sacrifique este artefato: Você ganha 3 de vida.' }));

/** "sempre que você ganha vida pela primeira vez em cada turno": o lote de ganhos é o primeiro do turno (ruling 12) */
function primeiroGanho(): TriggerSpec {
  return on.batch((evs: GameEvent[], c) => {
    const neste = evs.reduce((s, e) => s + (e.type === 'lifeGain' && e.player === c.you ? e.amount : 0), 0);
    return neste > 0 && c.g.state.turnStats[c.you].lifeGained === neste;
  });
}
const nivel = (c: SCtx): number => c.g.state.objects[c.source]?.classLevel ?? 1;

export default defineCard({
  name: "Gourmand's Talent",
  faces: [{
    abilities: [
      // camada 4 (tipo Food) e 6 (a habilidade), só durante o seu turno; ruling 7: os outros tipos e habilidades ficam
      staticAbility({
        condition: (c) => c.g.state.turn.active === c.you,
        affects: (c, o) => o.zone === 'battlefield' && controllerOf(c.g, o.id) === c.you && isType(c.g, o.id, 'Artifact'),
        mods: () => [{ k: 'addTypes', subtypes: ['Food'] }, { k: 'addAbility', id: COMER.id! }],
        text: 'Durante o seu turno, os artefatos que você controla são Foods além dos outros tipos e têm "{2}, {T}, Sacrifique este artefato: Você ganha 3 de vida."',
      }),
      nivelDeClasse("Gourmand's Talent", '{2}{G}', 2),
      triggered(primeiroGanho(), function* (c) { yield* createTokens(c.g, c.you, 'Raccoon', 1); }, {
        condition: (c) => nivel(c) >= 2,
        text: 'Nível 2 — Sempre que você ganha vida pela primeira vez em cada turno, crie uma ficha de criatura Raccoon verde 3/3.',
      }),
      nivelDeClasse("Gourmand's Talent", '{3}{G}', 3),
      triggered(primeiroGanho(), function* (c) {
        for (const id of controlledBy(c.g, c.you, (x) => isCreature(c.g, x))) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, {
        condition: (c) => nivel(c) >= 3,
        text: 'Nível 3 — Sempre que você ganha vida pela primeira vez em cada turno, coloque um marcador +1/+1 em cada criatura que você controla.',
      }),
    ],
  }],
  rulings: {
    1: COMIDA.tipo,
    2: COMIDA.umCusto,
    3: COMIDA.piada,
    4: 'regra geral: CR 716.2 — três habilidades de classe e duas de nível',
    5: 'teste: nível 2: no primeiro ganho de vida do turno cria um Raccoon 3/3; no segundo, não',
    6: 'regra geral: CR 716.2a — ganhar nível não tira as habilidades anteriores',
    7: 'teste: no seu turno, o Sol Ring é Food e pode ser comido; no turno do oponente, não',
    8: 'teste: no nível 1 só dá para ganhar o nível 2',
    9: 'regra geral: CR 716.2b — cada Classe guarda o próprio nível (objeto.classLevel)',
    10: 'regra geral: CR 716.2a — ganhar nível é habilidade ativada e usa a pilha',
    11: 'regra geral: a estática olha os tipos atuais: virando artefato, a própria Classe também é Food no seu turno',
    12: 'teste: nível 2: no primeiro ganho de vida do turno cria um Raccoon 3/3; no segundo, não',
  },
});
