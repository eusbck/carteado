// Tymna the Weaver
// Lifelink
// At the beginning of each of your postcombat main phases, you may pay X life, where X is the number of opponents that
// were dealt combat damage this turn. If you do, draw X cards.
// Partner (You can have two commanders if both have partner.)
import { defineCard, draw, keyword, loseLife, on, triggered, yesNo } from '../../motor/api.ts';
import { SELECAO } from '../tartarugas.ts';

export default defineCard({
  name: 'Tymna the Weaver',
  faces: [{
    abilities: [
      keyword('lifelink'),
      // ruling 3: dispara em cada fase principal pós-combate do seu turno
      triggered(on.custom((e, c) => e.type === 'step' && e.step === 'main2' && e.active === c.you), function* (c) {
        // ruling 2: conta os oponentes que receberam dano de combate no turno, mesmo os que já saíram da partida
        const d = c.g.state.combatDamageBySource;
        const feridos = new Set<number>();
        if (d && d.turn === c.g.state.turn.number) for (const lista of Object.values(d.players)) for (const p of lista) if (p !== c.you && c.g.isOpponent(c.you, p)) feridos.add(p);
        const x = feridos.size;
        // ruling 1: paga exatamente X ou nada
        if (x <= 0 || c.g.state.players[c.you].life < x) return;
        if (!(yield* yesNo(c.g, c.you, `Tymna: pagar ${x} de vida para comprar ${x} carta(s)?`))) return;
        if (loseLife(c.g, c.you, x, c.source) < x) return;
        yield* draw(c.g, c.you, x);
      }, { text: 'No início de cada uma das suas fases principais pós-combate, você pode pagar X pontos de vida, sendo X o número de oponentes que receberam dano de combate neste turno. Se fizer isso, compre X cartas.' }),
    ],
  }],
  rulings: {
    1: 'teste: na fase principal pós-combate, paga X de vida e compra X cartas, X = oponentes que receberam dano de combate no turno',
    2: 'regra geral: o oponente que recebeu dano de combate e depois perdeu o jogo ainda conta para X (state.combatDamageBySource)',
    3: 'regra geral: CR 505.1 — cada fase principal depois de um combate é pós-combate: com combate adicional, a habilidade pode disparar de novo (motor/turn.ts)',
    4: SELECAO.identidade,
    5: SELECAO.comecam,
    6: SELECAO.perder,
    7: SELECAO.separados,
    8: SELECAO.refere,
    9: SELECAO.controla,
    10: 'regra geral: CR 702.124h — os dois comandantes com parceiro podem ter as mesmas cores; é da montagem do deck (decks/)',
  },
});