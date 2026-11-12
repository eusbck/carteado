// Sorin of House Markov // Sorin, Ravenous Neonate
// Sorin of House Markov {1}{B} — Legendary Creature — Human Noble 1/4
// Lifelink
// Extort (Whenever you cast a spell, you may pay {W/B}. If you do, each opponent loses 1 life and you gain that much life.)
// At the beginning of each of your postcombat main phases, if you gained 3 or more life this turn, exile Sorin, then
// return him to the battlefield transformed under his owner's control.
// Sorin, Ravenous Neonate — Legendary Planeswalker — Sorin [3]
// Extort
// +2: Create a Food token.
// −1: Sorin deals damage equal to the amount of life you gained this turn to any target.
// −6: Gain control of target creature. It becomes a Vampire in addition to its other types. Put a lifelink counter on it
// if you control a white permanent other than that creature or Sorin.
import {
  activated, addCounters, chars, controllerOf, createTokens, dealDamage, defineCard, exile, gainControl, keyword, on,
  putOntoBattlefield, t, tgt, tgtRef, triggered, withDuration,
} from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';
import { extort } from '../milagres.ts';
import { COMIDA } from '../esquilos.ts';

/** exila Sorin e o devolve ao campo transformado, sob o controle do dono (CR 712.14) */
function* exilaEVoltaTransformado(c: Ctx) {
  const o = c.g.state.objects[c.source];
  if (!o || o.zone !== 'battlefield') return;
  const dono = o.owner;
  const [ex] = yield* exile(c.g, [c.source]);
  // ruling 16: ficha ou carta que não é de dupla face não volta
  if (ex !== null && ex !== undefined && c.g.state.objects[ex]?.zone === 'exile' && !c.g.state.objects[ex].isToken) {
    yield* putOntoBattlefield(c.g, [{ id: ex, controller: dono, face: 1 }], 'effect');
  }
}

export default defineCard({
  name: 'Sorin of House Markov // Sorin, Ravenous Neonate',
  faces: [
    {
      abilities: [
        keyword('lifelink'),
        ...extort(),
        // CR 505.1a: as fases principais depois do combate; CR 603.4: condição interveniente (ruling 17)
        triggered(on.custom((e, c) => e.type === 'step' && e.step === 'main2' && e.active === c.you), function* (c) {
          yield* exilaEVoltaTransformado(c);
        }, {
          condition: (c) => (c.g.state.turnStats[c.you]?.lifeGained ?? 0) >= 3,
          text: 'No início de cada uma das suas fases principais pós-combate, se você ganhou 3 ou mais pontos de vida neste turno, exile Sorin e depois devolva-o ao campo transformado sob o controle do dono.',
        }),
      ],
    },
    {
      abilities: [
        ...extort(),
        activated('+2', function* (c) {
          yield* createTokens(c.g, c.you, 'Food', 1);
        }, { text: '+2: Crie uma ficha Food.' }),
        activated('−1', function* (c) {
          const r = tgtRef(c);
          // ruling 11: conta toda a vida ganha no turno, sem descontar a perdida
          const n = c.g.state.turnStats[c.you]?.lifeGained ?? 0;
          if (r && n > 0) dealDamage(c.g, [{ source: c.source, target: r, amount: n, combat: false }]);
        }, { targets: [t.any()], text: '−1: Sorin causa dano igual à quantidade de vida que você ganhou neste turno a qualquer alvo.' }),
        activated('−6', function* (c) {
          const id = tgt(c);
          if (id === null) return;
          // ruling 12: o controle dura indefinidamente
          gainControl(c.g, id, c.you, { kind: 'permanent' }, c.source);
          withDuration(c, [id], [{ k: 'addTypes', subtypes: ['Vampire'] }], { kind: 'permanent' });
          const s = c.g.state;
          const branco = s.zones.battlefield.some((x) => x !== id && x !== c.source && controllerOf(c.g, x) === c.you && chars(c.g, x).colors.includes('W'));
          if (branco) addCounters(c.g, { kind: 'obj', id }, 'lifelink', 1, c.you);
        }, { targets: [t.creature()], text: '−6: Ganhe o controle da criatura alvo. Ela se torna um Vampire além dos outros tipos. Coloque um marcador de vínculo com a vida nela se você controlar um permanente branco além dela e de Sorin.' }),
      ],
    },
  ],
  rulings: {
    1: COMIDA.tipo,
    2: COMIDA.umCusto,
    3: COMIDA.piada,
    4: 'regra geral: CR 306.5b, 704.5i — transformado no campo sem entrar, o planeswalker fica sem lealdade e vai para o cemitério',
    5: 'regra geral: CR 606.3 — habilidades de lealdade só como feitiço, mesmo no turno em que entra',
    6: 'regra geral: CR 702.101b — extorquir paga uma vez por gatilho, na resolução (cartas/milagres.ts extort)',
    7: 'regra geral: CR 702.101a — ganha o total que os oponentes perderam (cartas/milagres.ts extort)',
    8: 'regra geral: CR 702.101a — extorquir não tem alvo',
    9: 'teste: ganhou 3 de vida no turno: na fase principal pós-combate volta transformado com 3 de lealdade',
    10: 'regra geral: CR 712.8a, 712.8d — fora do campo só a frente; no campo, a face para cima',
    11: 'teste: −1 causa dano igual a toda a vida ganha no turno',
    12: 'teste: −6 toma o controle para sempre, faz Vampire e, com outro permanente branco, põe vínculo com a vida',
    13: 'regra geral: CR 712.8d — no campo, só as características da face para cima',
    14: 'regra geral: CR 903.4 — identidade de cor soma as duas faces (motor/deck.ts)',
    15: 'regra geral: CR 712.14 — entra com a frente para cima, a menos que mandem pôr transformada',
    16: 'regra geral: CR 712.14a — o que não é de dupla face não entra transformado e fica onde está',
    17: 'teste: sem 3 de vida ganhos no turno, o gatilho não dispara',
    18: 'regra geral: CR 712.8e — o valor de mana é o da frente',
    19: 'regra geral: CR 712.8 — o verso tem indicador de cor',
  },
});
