// Oblivion Sower
// When you cast this spell, target opponent exiles the top four cards of their library, then you may put any number of
// land cards that player owns from exile onto the battlefield under your control.
import { chooseItems, defineCard, exile, isLand, nameOf, onCastThis, putOntoBattlefield, t, tgtPlayer } from '../../motor/api.ts';

const GATILHO = onCastThis(function* (c) {
  const g = c.g;
  const p = tgtPlayer(c);
  if (p === null) return;
  const topo = g.state.zones.library[p].slice(0, 4);
  if (topo.length) yield* exile(g, topo);
  // ruling 1: qualquer carta de terreno dele no exílio, não importa como foi exilada; ruling 2: viradas para baixo não
  const terrenos = g.state.zones.exile.filter((id) => { const o = g.state.objects[id]; return o.owner === p && !o.faceDown && !o.isToken && isLand(g, id); });
  if (!terrenos.length) return;
  const esc = (yield* chooseItems(g, c.you, `Oblivion Sower: escolha as cartas de terreno de ${g.state.players[p].name} no exílio para pôr no campo sob o seu controle`,
    terrenos.map((id) => ({ id: String(id), label: nameOf(g, id), obj: id, card: { def: g.state.objects[id].def } })), 0, terrenos.length)).map(Number);
  if (esc.length) yield* putOntoBattlefield(g, esc.map((id) => ({ id, controller: c.you })), 'effect');
}, 'Quando você conjura esta mágica, o oponente alvo exila as quatro cartas do topo do grimório dele; depois, você pode pôr no campo sob o seu controle quantas cartas de terreno de que esse jogador é dono quiser, vindas do exílio.');
GATILHO.targets = [t.opponent()];

export default defineCard({
  name: 'Oblivion Sower',
  faces: [{ abilities: [GATILHO] }],
  rulings: {
    1: 'teste: põe no campo terrenos dele que já estavam no exílio, além dos que acabaram de ser exilados',
    2: 'teste: cartas viradas para baixo no exílio não podem ser postas no campo',
  },
});
