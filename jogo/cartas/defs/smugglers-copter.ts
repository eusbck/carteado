// Smuggler's Copter
// Flying
// Whenever this Vehicle attacks or blocks, you may draw a card. If you do, discard a card.
// Crew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature
// until end of turn.)
import { crew, defineCard, discard, draw, keyword, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: "Smuggler's Copter",
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source)) || (e.type === 'blockers' && e.blocks.some(([b]) => b === c.source))), function* (c) {
        if (!(yield* yesNo(c.g, c.you, "Smuggler's Copter: comprar uma carta e depois descartar uma?"))) return;
        const compradas = yield* draw(c.g, c.you, 1);
        if (compradas.length) yield* discard(c.g, c.you, 1);
      }, { text: 'Sempre que este Veículo ataca ou bloqueia, você pode comprar uma carta. Se fizer isso, descarte uma carta.' }),
      crew(1),
    ],
  }],
  rulings: {
    1: 'teste: tripulado, vira criatura artefato 3/3 voadora; ao atacar, compra e descarta',
    2: 'regra geral: CR 613.4b — um efeito que define a força e a resistência sobrepõe os valores impressos (motor/chars.ts)',
    3: 'regra geral: CR 205.3g, 301.7 — Vehicle é subtipo de artefato; tripular não dá tipo de criatura (motor/mecanicas.ts crew)',
    4: 'regra geral: CR 602.2 — ninguém age durante a ativação e o pagamento da tripulação (motor/stack.ts)',
    5: 'regra geral: CR 302.6 — o custo de tripular não tem {T}: criatura com enjoo pode tripular (motor/costs.ts crewCandidates)',
    6: 'regra geral: CR 702.122a — pode virar mais criaturas que o necessário (motor/costs.ts)',
    7: 'regra geral: CR 702.122b-c — quem tripula não fica ligado ao Veículo (motor/mecanicas.ts crew)',
    8: 'regra geral: CR 302.6, 301.7 — tripulado, segue as regras de criatura: enjoo, ataque e bloqueio (motor/combat.ts)',
    9: 'regra geral: CR 702.122a — tripular de novo não muda nada (motor/mecanicas.ts crew)',
    10: 'regra geral: CR 508.1a, 509.1a — precisa ser criatura quando os atacantes ou bloqueadores são declarados (motor/combat.ts)',
    11: 'regra geral: CR 301.7 — virar criatura não é entrar no campo (motor/mecanicas.ts crew)',
    12: 'regra geral: CR 707.2 — a cópia de um Veículo não copia a animação da tripulação (motor/mecanicas.ts copiableValues)',
  },
});
