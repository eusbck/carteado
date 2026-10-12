// Teferi's Protection
// Until your next turn, your life total can't change and you gain protection from everything. All permanents you control
// phase out. (While they're phased out, they're treated as though they don't exist. They phase in before you untap during
// your untap step.)
// Exile Teferi's Protection.
import { controllerOf, defineCard, exile, phaseOut, ruleEffect } from '../../motor/api.ts';
import { FASE, PROTECAO_TUDO } from '../jin.ts';

const VIDA = 'regra geral: CR 119.7 — com o total de vida sem poder mudar, ganhar, perder, definir ou trocar a vida não faz nada, e o resto do efeito continua (motor/actions.ts lifeCantChange)';
const TITULO = 'não se aplica: é só um título de seção nas notas da carta';

export default defineCard({
  name: "Teferi's Protection",
  faces: [{
    spell: {
      *effect(c) {
        const ate = { kind: 'untilYourNextTurn' as const, player: c.you, sinceTurn: c.g.state.turn.number };
        ruleEffect(c, 'rule:lifeCantChange', ate, { players: [c.you] });
        ruleEffect(c, 'rule:playerProtection', ate, { players: [c.you], params: { quality: 'everything' } });
        phaseOut(c.g, c.g.state.zones.battlefield.filter((id) => controllerOf(c.g, id) === c.you));
        if (c.g.state.objects[c.source]) yield* exile(c.g, [c.source]);
      },
    },
  }],
  rulings: {
    1: PROTECAO_TUDO.alvo,
    2: VIDA,
    3: FASE.marcadores,
    4: 'regra geral: CR 702.26e — a permanente de outro jogador que você controlava volta de fase com quem a controlar então (motor/mecanicas.ts phaseOut)',
    5: 'regra geral: CR 615.12 — o dano que não pode ser prevenido é causado, mas a sua vida não muda (motor/actions.ts dealDamage)',
    6: FASE.naoExiste,
    7: FASE.pulada,
    8: VIDA,
    9: FASE.marcadores,
    10: 'teste: até o seu próximo turno a sua vida não muda e você tem proteção contra tudo; as suas permanentes saem de fase e a carta é exilada',
    11: TITULO,
    12: 'regra geral: CR 608.2b — a mágica ou habilidade que mirava a permanente que saiu de fase fica com alvo ilegal (motor/stack.ts)',
    13: FASE.duracoes,
    14: FASE.anexos,
    15: PROTECAO_TUDO.tres,
    16: 'regra geral: CR 119.7 — um custo que inclui você ganhar vida não pode ser pago (motor/costs.ts)',
    17: 'regra geral: CR 702.26d — efeitos que esperam a permanente "sair do campo" não acontecem quando ela sai de fase (motor/mecanicas.ts phaseOut)',
    18: TITULO,
    19: PROTECAO_TUDO.soIsso,
    20: TITULO,
    21: 'regra geral: CR 119.8 — com a vida sem poder mudar, não se paga custo de vida diferente de 0 (simplificação: o motor deixa pagar e a vida não muda)',
    22: VIDA,
    23: VIDA,
    24: FASE.gatilhos,
    25: FASE.anexos,
    26: FASE.volta,
    27: FASE.volta,
  },
});