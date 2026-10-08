// Nicol Bolas, Dragon-God
// Nicol Bolas has all loyalty abilities of all other planeswalkers on the battlefield.
// +1: You draw a card. Each opponent exiles a card from their hand or a permanent they control.
// −3: Destroy target creature or planeswalker.
// −8: Each opponent who doesn't control a legendary creature or planeswalker loses the game.
import {
  activated, chars, chooseItems, controllerOf, defineCard, destroy, draw, exile, loseGame, nameOf, objItem, registry, selfGets, t, tgt,
  type Mod,
} from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

/** habilidade de lealdade: ativada com o símbolo de lealdade no custo (CR 606.2) */
function deLealdade(id: string): boolean {
  const a = registry.abilities.get(id);
  return a?.kind === 'activated' && a.cost.some((p) => p.k === 'loyalty');
}

export default defineCard({
  name: 'Nicol Bolas, Dragon-God',
  faces: [{
    abilities: [
      // camada 6 (CR 613.1f): ganha as habilidades de lealdade que os outros planeswalkers têm agora; rulings 1-2: os
      // outros continuam com as deles, e estáticas, disparadas e ativadas sem lealdade não vêm; ruling 3: o limite de
      // uma habilidade de lealdade por turno vale para Bolas inteiro (CR 606.3); ruling 4: as habilidades ganhas usam
      // Bolas como fonte ("este planeswalker", "outro alvo"…)
      selfGets((c) => {
        const s = c.g.state;
        const ja = new Set(chars(c.g, c.source).abilities.map((a) => a.id));
        const mods: Mod[] = [];
        for (const id of s.zones.battlefield) {
          if (id === c.source || s.objects[id].phasedOut) continue;
          const ch = chars(c.g, id);
          if (!ch.types.includes('Planeswalker')) continue;
          for (const a of ch.abilities) {
            if (ja.has(a.id) || !deLealdade(a.id)) continue;
            ja.add(a.id);
            mods.push({ k: 'addAbility', id: a.id });
          }
        }
        return mods;
      }, 'Nicol Bolas tem todas as habilidades de lealdade de todos os outros planeswalkers no campo.'),
      activated('+1', function* (c) {
        yield* draw(c.g, c.you, 1);
        // ruling 7: cada oponente, na ordem de turno, escolhe (a carta da mão sem revelar); depois tudo é exilado junto
        const escolhidos: ObjId[] = [];
        for (const p of c.g.apnap().filter((x) => c.g.isOpponent(c.you, x))) {
          const s = c.g.state;
          const mao = s.zones.hand[p].map((id) => ({ ...objItem(c.g, id, `Mão: ${nameOf(c.g, id)}`), card: { def: s.objects[id].def } }));
          const perms = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && controllerOf(c.g, id) === p).map((id) => objItem(c.g, id, nameOf(c.g, id)));
          if (mao.length + perms.length === 0) continue;
          const [id] = yield* chooseItems(c.g, p, 'Nicol Bolas: exile uma carta da sua mão ou um permanente que você controla', [...mao, ...perms], 1, 1);
          escolhidos.push(Number(id));
        }
        if (escolhidos.length) yield* exile(c.g, escolhidos);
      }, { text: '+1: Você compra uma carta. Cada oponente exila uma carta da mão dele ou um permanente que ele controla.' }),
      activated('−3', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, { targets: [t.creatureOrPlaneswalker()], text: '−3: Destrua a criatura ou o planeswalker alvo.' }),
      activated('−8', function* (c) {
        const s = c.g.state;
        // "criatura ou planeswalker lendário": o adjetivo vale para os dois (todo planeswalker impresso é lendário)
        const temLenda = (p: number) => s.zones.battlefield.some((id) => {
          if (s.objects[id].phasedOut || controllerOf(c.g, id) !== p) return false;
          const ch = chars(c.g, id);
          return ch.supertypes.includes('Legendary') && (ch.types.includes('Creature') || ch.types.includes('Planeswalker'));
        });
        const perdem = c.g.opponents(c.you).filter((p) => !temLenda(p));
        for (const p of perdem) {
          c.g.log(`${s.players[p].name} perde a partida: não controla criatura nem planeswalker lendário (Nicol Bolas, Dragon-God).`, { rule: '104.3e' });
          loseGame(c.g, p);
        }
      }, { text: '−8: Cada oponente que não controla uma criatura ou planeswalker lendário perde o jogo.' }),
    ],
  }],
  rulings: {
    1: 'teste: o outro planeswalker continua com as próprias habilidades de lealdade',
    2: 'teste: Bolas não ganha estáticas, disparadas nem ativadas sem lealdade dos outros planeswalkers',
    3: 'teste: mesmo com várias habilidades, só uma de lealdade por turno',
    4: 'teste: a habilidade ganha trata Bolas como a fonte ("outro" alvo, lealdade de Bolas)',
    5: 'não se aplica: nenhum planeswalker dos decks tem habilidades de lealdade vinculadas (CR 607)',
    6: 'regra geral: CR 603.3 — gatilhos de comprar esperam a habilidade terminar de resolver (motor)',
    7: 'teste: +1: cada oponente, na ordem de turno, escolhe uma carta da mão ou um permanente; tudo é exilado ao mesmo tempo',
    8: 'não se aplica: partidas de Gigante de Duas Cabeças não são jogadas aqui',
  },
});
