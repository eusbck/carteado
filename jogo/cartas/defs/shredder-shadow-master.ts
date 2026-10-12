// Shredder, Shadow Master
// Whenever Shredder attacks a player, for each other opponent, create a token that's a copy of Shredder tapped and
// attacking that player, except it isn't legendary. Sacrifice those tokens at end of combat.
// Whenever Shredder deals combat damage to a player, that player loses half their life, rounded up.
import { copiableValues, defineCard, delayed, loseLife, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import { SACRIFICA_NO_FIM_DO_COMBATE } from '../tartarugas.ts';

export default defineCard({
  name: 'Shredder, Shadow Master',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers') return false;
        const a = e.attackers.find((x) => x.obj === c.source);
        return a && a.target.kind === 'player' ? { defensor: a.target.id } : false;
      }), function* (c) {
        const s = c.g.state;
        const defensor = c.event.defensor as number;
        const outros = c.g.apnap().filter((p) => c.g.isOpponent(c.you, p) && p !== defensor);
        if (!outros.length) return;
        // rulings 1, 2 e 5: os valores copiáveis de agora, ou os de quando Shredder esteve no campo pela última vez
        const v = copiableValues(c.g, c.source);
        const copia = { ...v, except: { ...(v.except ?? {}), legendary: false as const } };
        // ruling 3: entram atacando sem terem sido declaradas, então "sempre que ataca" não dispara para elas
        const fichas = yield* putOntoBattlefield(c.g, outros.map((p) => ({ controller: c.you, token: { copyOf: copia }, tapped: true, attacking: { kind: 'player' as const, id: p } })), 'token');
        if (fichas.length) delayed(c, SACRIFICA_NO_FIM_DO_COMBATE.id!, { data: { fichas }, expiresTurn: s.turn.number });
      }, { text: 'Sempre que Shredder ataca um jogador, para cada outro oponente, crie uma ficha que é uma cópia de Shredder virada e atacando esse jogador, exceto que ela não é lendária. Sacrifique essas fichas no fim do combate.' }),
      triggered(on.custom((e, c) => (e.type === 'damage' && e.combat && e.source === c.source && e.target.kind === 'player' ? { jogador: e.target.id } : false)), function* (c) {
        const p = c.event.jogador as number;
        const vida = c.g.state.players[p].life;
        if (vida > 0) loseLife(c.g, p, Math.ceil(vida / 2), c.source);
      }, { text: 'Sempre que Shredder causa dano de combate a um jogador, esse jogador perde metade dos pontos de vida, arredondada para cima.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.2 — a cópia só pega os valores copiáveis: não copia estar virado, marcadores, Auras nem efeitos que não são de cópia (motor/mecanicas.ts copiableValues)',
    2: 'regra geral: CR 608.2h — sem Shredder no campo, valem os valores copiáveis da última informação dele (motor/mecanicas.ts copiableValues)',
    3: 'regra geral: CR 508.4 — a ficha entra atacando sem ter sido declarada: os gatilhos de atacar não disparam (motor/actions.ts putOntoBattlefield)',
    4: 'teste: atacando um jogador, cria uma cópia não lendária atacando cada outro oponente; quem leva dano de combate perde metade da vida',
    5: 'regra geral: CR 707.3 — se Shredder for cópia de outra coisa, as fichas copiam o que ele estiver copiando (motor/mecanicas.ts copiableValues)',
  },
});