// Stensian Sanguinist // Exsanguinate
// Stensian Sanguinist — Whenever you attack, target creature gains deathtouch until end of turn. Whenever that creature
// deals combat damage to a player this combat, this creature becomes prepared.
// Exsanguinate (feitiço preparado) — Each opponent loses X life. You gain life equal to the life lost this way.
import { defineAbility, defineCard, delayed, gainLife, loseLife, on, prepare, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const PREPARA = defineAbility('Stensian Sanguinist:prepara', triggered({
  kind: 'event',
  match: (e, c) => {
    const d = (c as unknown as { delayed?: { data: Record<string, unknown> } }).delayed?.data;
    // "neste combate": só no combate em que o gatilho foi criado
    return e.type === 'damage' && e.combat && e.target.kind === 'player' && e.source === d?.criatura && c.g.state.turn.number === d?.turno;
  },
}, function* (c) { prepare(c.g, c.source); }, { text: 'Sempre que essa criatura causa dano de combate a um jogador neste combate, esta criatura fica preparada.' }));

export default defineCard({
  name: 'Stensian Sanguinist // Exsanguinate',
  faces: [
    {
      abilities: [
        triggered(on.youAttack(), function* (c) {
          const id = tgt(c);
          if (id === null) return;
          untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'deathtouch' }]);
          delayed(c, PREPARA.id!, { data: { criatura: id as ObjId, turno: c.g.state.turn.number }, once: false, expiresTurn: c.g.state.turn.number });
        }, { targets: [t.creature()], text: 'Sempre que você ataca, a criatura alvo ganha toque mortífero até o fim do turno. Sempre que ela causar dano de combate a um jogador neste combate, esta criatura fica preparada.' }),
      ],
    },
    {
      spell: {
        *effect(c) {
          let perdida = 0;
          for (const p of c.g.opponents(c.you)) perdida += loseLife(c.g, p, c.x, c.source);
          if (perdida > 0) gainLife(c.g, c.you, perdida, c.source);
        },
      },
    },
  ],
  rulings: {
    1: "regra geral: CR 722.3a — a designação continua",
    2: "regra geral: CR 722.3c — exceção a 704.5e (motor/sba.ts)",
    3: "regra geral: CR 722.3a — preparado é designação, não habilidade",
    4: "teste: ao ficar preparado, cria a cópia do feitiço no exílio; conjurá-la tira a designação",
    5: "não se aplica: nenhuma carta dos decks pede para nomear uma carta",
    6: "regra geral: CR 722.3c — só o controlador atual (motor/priority.ts)",
    7: 'regra geral: CR 119.4 — pode perder mais vida do que tem; você ganha o total perdido',
    8: "regra geral: CR 722.2b e 722.3a — preparado é designação do objeto, não valor copiável",
    9: "regra geral: CR 608.2b — não resolve; a designação já saiu ao conjurar (601.2i)",
    10: "regra geral: CR 722.3 — a carta é conjurada só pela frente",
    11: "regra geral: CR 722.3a — prepare() exige feitiço preparado",
    12: "regra geral: CR 722.3c — a cópia usa só as características do feitiço preparado",
    13: "regra geral: CR 722.3b — sem a designação, a cópia no exílio deixa de existir (704.5e)",
    14: "regra geral: CR 722.3c — conjura pela permissão, pagando o custo normal",
    15: "regra geral: CR 722.3a — prepare() não age em quem já está preparado",
    16: "regra geral: CR 722.4 — fora do campo, só as características normais",
  },
});
