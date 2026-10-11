// Dragonhawk, Fate's Tempest
// Flying
// Whenever Dragonhawk enters or attacks, exile the top X cards of your library, where X is the number of creatures you
// control with power 4 or greater. You may play those cards until your next end step. At the beginning of your next end
// step, Dragonhawk deals 2 damage to each opponent for each of those cards that are still exiled.
import { allowPlay, creaturesOf, dealDamage, defineAbility, defineCard, delayed, exile, keyword, on, power, removeEffect, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// "No início da sua próxima etapa final": a permissão de jogar acaba e as cartas que sobraram viram dano
const FIM = defineAbility("Dragonhawk, Fate's Tempest:fim", triggered(on.custom((e, c) => {
  if (e.type !== 'step' || e.step !== 'end' || e.active !== c.you) return false;
  // CR 513.2: criado durante a sua etapa final, espera a etapa final do seu próximo turno
  const d = (c as unknown as { delayed?: { createdTurn: number; createdStep: string } }).delayed;
  return !d || c.g.state.turn.number > d.createdTurn || d.createdStep !== 'end';
}), function* (c) {
  const efeito = c.data.efeito as number | undefined;
  if (efeito !== undefined) removeEffect(c.g, efeito);
  // ruling 3: conta só as cartas exiladas pela habilidade que criou este gatilho
  const sobraram = ((c.data.cartas ?? []) as ObjId[]).filter((id) => c.g.state.objects[id]?.zone === 'exile').length;
  if (sobraram > 0) dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 2 * sobraram, combat: false })));
}, { text: 'No início da sua próxima etapa final, Dragonhawk causa 2 de dano a cada oponente para cada uma dessas cartas que continua exilada.' }));

export default defineCard({
  name: "Dragonhawk, Fate's Tempest",
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), function* (c) {
        const g = c.g;
        // ruling 1: X é calculado uma vez, na resolução
        const x = creaturesOf(g, c.you).filter((id) => power(g, id) >= 4).length;
        const topo = g.state.zones.library[c.you].slice(0, x);
        const cartas = topo.length ? (yield* exile(g, topo)).filter((id): id is ObjId => id !== null && id !== undefined) : [];
        let efeito: number | undefined;
        if (cartas.length) {
          // ruling 2: joga pagando os custos e no tempo normal de cada carta
          allowPlay(g, c.you, c.source, cartas, { kind: 'permanent' });
          efeito = g.state.effects[g.state.effects.length - 1]?.id;
        }
        delayed(c, FIM.id!, { data: { cartas, efeito } });
      }, { text: 'Sempre que Dragonhawk entra ou ataca, exile as X cartas do topo do seu grimório, onde X é o número de criaturas com força 4 ou mais que você controla. Você pode jogar essas cartas até a sua próxima etapa final. No início da sua próxima etapa final, Dragonhawk causa 2 de dano a cada oponente para cada uma dessas cartas que continua exilada.' }),
    ],
  }],
  rulings: {
    1: 'teste: ao entrar, exila X cartas (criaturas suas com força 4 ou mais); as jogadas não contam e as que sobram causam 2 de dano cada na sua etapa final',
    2: 'teste: ao entrar, exila X cartas (criaturas suas com força 4 ou mais); as jogadas não contam e as que sobram causam 2 de dano cada na sua etapa final',
    3: 'teste: atacando no turno seguinte, exila de novo e cada gatilho conta só as cartas dele',
  },
});
