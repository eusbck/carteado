// Inniaz, the Gale Force
// Flying
// {2}{W/U}: Attacking creatures with flying get +1/+1 until end of turn. ({W/U} can be paid with either {W} or {U}.)
// Whenever three or more creatures you control with flying attack, each player gains control of a nonland permanent of
// your choice controlled by the player to their right.
import {
  activated, allCreatures, chooseItems, controlledBy, controllerOf, defineCard, gainControl, hasKw, isAttacking, isLand, keyword, nameOf, objItem, on,
  seatNeighbor, triggered, untilEndOfTurn,
} from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Inniaz, the Gale Force',
  faces: [{
    abilities: [
      keyword('flying'),
      activated('{2}{W/U}', function* (c) {
        // CR 611.2c: vale para as que estão atacando e têm voar na resolução
        const ids = allCreatures(c.g).filter((id) => isAttacking(c.g, id) && hasKw(c.g, id, 'flying'));
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'pt', p: 1, t: 1 }]);
      }, { text: '{2}{W/U}: As criaturas atacantes com voar recebem +1/+1 até o fim do turno.' }),
      // ruling 1: um gatilho só por declaração de atacantes, com três ou mais
      triggered(on.custom((e, c) => e.type === 'attackers' && e.player === c.you
        && e.attackers.filter((a) => c.g.state.objects[a.obj] && controllerOf(c.g, a.obj) === c.you && hasKw(c.g, a.obj, 'flying')).length >= 3), function* (c) {
        const s = c.g.state;
        // ruling 4: você escolhe tudo na resolução; depois o controle muda de uma vez só
        const trocas: { id: ObjId; para: PlayerId }[] = [];
        for (const p of c.g.apnap()) {
          const direita = seatNeighbor(c.g, p, 'right');
          if (direita === p) continue;
          // ruling 7: sem permanente que não seja terreno, quem está à esquerda dele não ganha nada
          const cands = controlledBy(c.g, direita, (id) => !isLand(c.g, id));
          if (!cands.length) continue;
          const [esc] = yield* chooseItems(c.g, c.you, `Inniaz: escolha a permanente de ${s.players[direita].name} que ${s.players[p].name} passa a controlar`, cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
          trocas.push({ id: Number(esc), para: p });
        }
        // ruling 9: sem prazo; não depende de Inniaz continuar no campo. Ruling 5: a atacante cedida sai do combate
        for (const tr of trocas) gainControl(c.g, tr.id, tr.para, { kind: 'permanent' }, c.source);
      }, { text: 'Sempre que três ou mais criaturas com voar que você controla atacam, cada jogador ganha o controle de uma permanente que não é terreno, à sua escolha, controlada pelo jogador à direita dele.' }),
    ],
  }],
  rulings: {
    1: 'teste: com quatro atacantes com voar, o gatilho dispara uma vez só',
    2: 'regra geral: CR 508.2a — o gatilho confere as atacantes só na declaração; resolve mesmo que elas percam voar ou saiam do combate',
    3: 'teste: com três jogadores, cada um ganha uma permanente do jogador à direita, todas ao mesmo tempo',
    4: 'teste: com três jogadores, cada um ganha uma permanente do jogador à direita, todas ao mesmo tempo',
    5: 'teste: a atacante com voar cedida sai do combate e continua virada',
    6: 'teste: com dois jogadores, vocês trocam o controle de duas permanentes à sua escolha',
    7: 'teste: de quem não controla permanente que não seja terreno, o jogador à esquerda não ganha nada',
    8: 'não se aplica: Gigante de Duas Cabeças não existe no jogo',
    9: 'regra geral: CR 611.2a — o efeito de controle não tem prazo e não depende de Inniaz (motor/actions.ts gainControl, duração permanente)',
  },
});
