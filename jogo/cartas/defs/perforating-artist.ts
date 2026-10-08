// Perforating Artist
// Deathtouch
// Raid — At the beginning of your end step, if you attacked this turn, each opponent loses 3 life unless that player
// sacrifices a nonland permanent of their choice or discards a card.
import { chooseItems, controlledBy, defineCard, discard, isLand, keyword, loseLife, nameOf, objItem, on, sacrifice, triggered } from '../../motor/api.ts';
import type { ChoiceItem, ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Perforating Artist',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      triggered(on.endStep('you'), function* (c) {
        const s = c.g.state;
        // ruling 6: cada oponente escolhe em ordem; depois tudo acontece ao mesmo tempo
        const escolhas: { p: PlayerId; sac?: ObjId; desc?: ObjId }[] = [];
        for (const p of c.g.apnap().filter((x) => c.g.isOpponent(c.you, x))) {
          const itens: ChoiceItem[] = [{ id: 'vida', label: 'Perder 3 de vida' }];
          for (const id of controlledBy(c.g, p, (x) => !isLand(c.g, x))) itens.push({ ...objItem(c.g, id, `Sacrificar ${nameOf(c.g, id)}`), id: `sac:${id}` });
          // ruling 1: a carta escolhida para descarte não é revelada antes
          for (const id of s.zones.hand[p]) itens.push({ id: `desc:${id}`, label: `Descartar ${nameOf(c.g, id)}`, obj: id, card: { def: s.objects[id].def } });
          const [esc] = yield* chooseItems(c.g, p, 'Perforating Artist: sacrifique um permanente que não seja terreno, descarte uma carta ou perca 3 de vida', itens, 1, 1);
          if (esc.startsWith('sac:')) escolhas.push({ p, sac: Number(esc.slice(4)) });
          else if (esc.startsWith('desc:')) escolhas.push({ p, desc: Number(esc.slice(5)) });
          else escolhas.push({ p });
        }
        const sacs = escolhas.flatMap((e) => (e.sac !== undefined ? [e.sac] : []));
        if (sacs.length) yield* sacrifice(c.g, sacs);
        for (const e of escolhas) if (e.desc !== undefined) yield* discard(c.g, e.p, 1, { filter: (id) => id === e.desc });
        for (const e of escolhas) if (e.sac === undefined && e.desc === undefined) loseLife(c.g, e.p, 3, c.source);
      }, {
        // rulings 2, 4, 5: olha o turno inteiro
        condition: (c) => c.g.state.turnStats[c.you].attacked,
        text: 'Incursão — No início da sua etapa final, se você atacou neste turno, cada oponente perde 3 de vida a menos que sacrifique um permanente que não seja terreno à escolha dele ou descarte uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: o oponente pode escolher perder 3 de vida mesmo tendo cartas',
    2: 'regra geral: CR 603.4 — vale mesmo que a Artist tenha entrado depois do ataque',
    3: 'não se aplica: Gigante de Duas Cabeças fora do escopo',
    4: 'regra geral: o turno inteiro conta, mesmo que o atacante já tenha saído',
    5: 'regra geral: basta ter atacado com uma criatura',
    6: 'teste: cada oponente escolhe em ordem; tudo acontece junto',
  },
});
