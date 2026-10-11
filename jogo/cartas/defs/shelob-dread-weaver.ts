// Shelob, Dread Weaver
// Whenever a nontoken creature an opponent controls dies, exile it.
// {2}{B}, Put a creature card exiled with Shelob into its owner's graveyard: Put two +1/+1 counters on Shelob. Draw a
// card.
// {X}{1}{B}: Put target creature card with mana value X exiled with Shelob onto the battlefield tapped under your
// control.
import { activated, addCounters, chooseItems, defineCard, draw, exile, isCreature, linkedExiled, manaValue, moveObjects, nameOf, objItem, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const CHAVE = 'shelob';

export default defineCard({
  name: 'Shelob, Dread Weaver',
  faces: [{
    abilities: [
      // ruling 1: vale também quando Shelob morre junto (olha para trás, CR 603.10a); a carta fica ligada a ela (CR 607.2a)
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard') return false;
        const l = c.g.state.lki[e.old];
        return !!l && l.chars.types.includes('Creature') && !l.obj.isToken && c.g.isOpponent(c.you, l.chars.controller) ? { carta: e.obj } : false;
      }), function* (c) {
        const carta = c.event.carta as ObjId;
        // ruling 2: se a carta já saiu do cemitério, é outro objeto e não é exilada
        if (c.g.state.objects[carta]?.zone === 'graveyard') yield* exile(c.g, [carta], { linkTo: { obj: c.source, key: CHAVE } });
      }, { text: 'Sempre que uma criatura que não é ficha que um oponente controla morre, exile-a.' }),
      // o custo "pôr uma carta de criatura exilada com Shelob no cemitério do dono" é pago no começo da resolução: sem
      // carta para pôr, a habilidade nem pode ser ativada (condição) e, se a carta sumir antes, nada acontece
      activated('{2}{B}', function* (c) {
        const cartas = linkedExiled(c.g, c.source, CHAVE).filter((id) => isCreature(c.g, id));
        if (!cartas.length) return;
        const [esc] = cartas.length === 1 ? [String(cartas[0])] : yield* chooseItems(c.g, c.you, 'Shelob: escolha a carta de criatura exilada que vai para o cemitério do dono', cartas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        yield* moveObjects(c.g, [{ id: Number(esc), to: 'graveyard' }], 'effect');
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 2, c.you);
        yield* draw(c.g, c.you, 1);
      }, {
        condition: (c) => linkedExiled(c.g, c.source, CHAVE).some((id) => isCreature(c.g, id)),
        text: '{2}{B}, Coloque uma carta de criatura exilada com Shelob no cemitério do dono dela: Coloque dois marcadores +1/+1 em Shelob. Compre uma carta.',
      }),
      activated('{X}{1}{B}', function* (c) {
        const carta = tgt(c);
        if (carta === null || c.g.state.objects[carta]?.zone !== 'exile' || manaValue(c.g, carta) !== c.x) return;
        yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you, tapped: true }], 'effect');
      }, {
        targets: [t.card('exile', (c, id) => linkedExiled(c.g, c.source, CHAVE).includes(id) && isCreature(c.g, id) && manaValue(c.g, id) === ((c as { x?: number }).x ?? manaValue(c.g, id)), 'carta de criatura alvo com valor de mana X exilada com Shelob', 'any')],
        text: '{X}{1}{B}: Coloque a carta de criatura alvo com valor de mana X exilada com Shelob no campo de batalha virada sob o seu controle.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.10a — o gatilho de morrer olha para trás: a criatura do oponente que morre junto com Shelob é exilada',
    2: 'regra geral: CR 400.7 — a carta que saiu do exílio e voltou é um objeto novo, sem ligação com Shelob (motor/criaturas.ts linkedExiled)',
  },
});
