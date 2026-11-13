// Braids, Arisen Nightmare
// At the beginning of your end step, you may sacrifice an artifact, creature, enchantment, land, or planeswalker. If you
// do, each opponent may sacrifice a permanent of their choice that shares a card type with it. For each opponent who
// doesn't, that player loses 2 life and you draw a card.
import { chars, chooseItems, controlledBy, defineCard, draw, loseLife, nameOf, objItem, on, sacrifice, triggered } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

const TIPOS = ['Artifact', 'Creature', 'Enchantment', 'Land', 'Planeswalker'];
const TIPO_PT: Record<string, string> = { Artifact: 'artefato', Creature: 'criatura', Enchantment: 'encantamento', Land: 'terreno', Planeswalker: 'planeswalker', Battle: 'batalha' };

export default defineCard({
  name: 'Braids, Arisen Nightmare',
  faces: [{
    abilities: [
      triggered(on.endStep('you'), function* (c) {
        const g = c.g;
        const meus = controlledBy(g, c.you, (id) => chars(g, id).types.some((t) => TIPOS.includes(t)));
        if (!meus.length) return;
        const [esc] = yield* chooseItems(g, c.you, 'Braids: você pode sacrificar um artefato, criatura, encantamento, terreno ou planeswalker', meus.map((id) => objItem(g, id, nameOf(g, id))), 0, 1);
        if (esc === undefined) return;
        // os tipos do que foi sacrificado, como estava no campo (CR 608.2h)
        const tipos = chars(g, Number(esc)).types.filter((t) => t !== 'Tribal' && t !== 'Kindred');
        const [foi] = yield* sacrifice(g, [Number(esc)]);
        if (foi === null || foi === undefined) return;
        const rotulo = tipos.map((t) => TIPO_PT[t] ?? t).join(' ou ');
        // ruling 1: cada oponente escolhe qualquer permanente que tenha um tipo em comum; em ordem APNAP (CR 101.4)
        const sacrificados: ObjId[] = [];
        const recusaram: PlayerId[] = [];
        for (const p of g.apnap().filter((x) => g.isOpponent(c.you, x))) {
          const dele = controlledBy(g, p, (id) => chars(g, id).types.some((t) => tipos.includes(t)));
          const [s] = dele.length ? yield* chooseItems(g, p, `Braids: sacrificar um(a) ${rotulo}? Se não, você perde 2 de vida e ${g.state.players[c.you].name} compra uma carta`, dele.map((id) => objItem(g, id, nameOf(g, id))), 0, 1) : [];
          if (s === undefined) recusaram.push(p);
          else sacrificados.push(Number(s));
        }
        if (sacrificados.length) yield* sacrifice(g, sacrificados);
        for (const p of recusaram) {
          loseLife(g, p, 2, c.source);
          yield* draw(g, c.you, 1);
        }
      }, { text: 'No início da sua etapa final, você pode sacrificar um artefato, criatura, encantamento, terreno ou planeswalker. Se fizer isso, cada oponente pode sacrificar um permanente à escolha dele que tenha um tipo de carta em comum com ele. Para cada oponente que não fizer isso, esse jogador perde 2 pontos de vida e você compra uma carta.' }),
    ],
  }],
  rulings: { 1: 'teste: com uma criatura artefato sacrificada, um oponente sacrifica um artefato e o outro recusa' },
});
