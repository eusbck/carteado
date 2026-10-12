// Heroes in a Half Shell
// Vigilance, menace, trample, haste
// Whenever one or more Mutants, Ninjas, and/or Turtles you control deal combat damage to a player, put a +1/+1 counter
// on each of those creatures and draw a card.
import { addCounters, controllerOf, defineCard, draw, keywords, on, triggered } from '../../motor/api.ts';
import { ehMutanteNinjaOuTartaruga } from '../tartarugas.ts';

export default defineCard({
  name: 'Heroes in a Half Shell',
  faces: [{
    abilities: [
      ...keywords('vigilance', 'menace', 'trample', 'haste'),
      // ruling 1: um gatilho para cada jogador que tomou dano, com as criaturas que causaram dano a esse jogador
      triggered(on.batch((evs, c) => {
        const porJogador = new Map<number, number[]>();
        for (const e of evs) {
          if (e.type !== 'damage' || !e.combat || e.target.kind !== 'player') continue;
          const o = c.g.state.objects[e.source];
          if (!o || o.zone !== 'battlefield' || controllerOf(c.g, e.source) !== c.you || !ehMutanteNinjaOuTartaruga(c.g, e.source)) continue;
          const lista = porJogador.get(e.target.id) ?? [];
          if (!lista.includes(e.source)) lista.push(e.source);
          porJogador.set(e.target.id, lista);
        }
        return [...porJogador].map(([jogador, criaturas]) => ({ jogador, criaturas }));
      }), function* (c) {
        for (const id of c.event.criaturas as number[]) if (c.g.state.objects[id]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que um ou mais Mutants, Ninjas e/ou Turtles que você controla causam dano de combate a um jogador, coloque um marcador +1/+1 em cada uma dessas criaturas e compre uma carta.' }),
    ],
  }],
  rulings: { 1: 'teste: um gatilho por jogador que tomou dano; cada um põe marcador só nas criaturas que causaram dano a esse jogador' },
});