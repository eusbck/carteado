// Fighter Class
// (Gain the next level as a sorcery to add its ability.)
// When this Class enters, search your library for an Equipment card, reveal it, put it into your hand, then shuffle.
// {1}{R}{W}: Level 2
// Equip abilities you activate cost {2} less to activate.
// {3}{R}{W}: Level 3
// Whenever a creature you control attacks, up to one target creature blocks it this combat if able.
import { activated, chars, defineCard, emit, etb, on, ruleEffect, searchTo, staticAbility, t, tgt, triggered, upTo } from '../../motor/api.ts';
import type { ActivatedDef } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';
import { ehEquipar } from '../equipar.ts';

const nivelDe = (c: { g: { state: { objects: Record<number, { classLevel?: number } | undefined> } }; source: ObjId }) => c.g.state.objects[c.source]?.classLevel ?? 1;

/** CR 716.2a: "[custo]: nível N" — só no nível N-1 e só como feitiço (como em cartas/defs/cleric-class.ts) */
function nivel(custo: string, n: number): ActivatedDef {
  return activated(custo, function* (c) {
    const o = c.g.state.objects[c.source];
    if (!o || o.zone !== 'battlefield' || o.classLevel !== n - 1) return;
    o.classLevel = n;
    c.g.bump();
    c.g.log(`Fighter Class passa ao nível ${n}.`, { rule: '716.2a' });
    emit(c.g, [{ type: 'levelUp', obj: c.source, level: n }]);
  }, { timing: 'sorcery', condition: (c) => c.g.state.objects[c.source]?.classLevel === n - 1, text: `${custo}: Nível ${n}` });
}

export default defineCard({
  name: 'Fighter Class',
  faces: [{
    abilities: [
      etb(function* (c) {
        yield* searchTo(c, c.you, (id) => chars(c.g, id).subtypes.includes('Equipment'), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de Equipamento' });
      }, { text: 'Quando esta Classe entra, procure no seu grimório uma carta de Equipamento, revele-a, coloque-a na sua mão e depois embaralhe.' }),
      nivel('{1}{R}{W}', 2),
      // ruling 1: só a mana genérica, {2} por Fighter Class no nível 2 ou mais, sem baixar de {0}
      staticAbility({
        condition: (c) => nivelDe(c) >= 2,
        rules: { abilityCostModifier: (c, jogador, _fonte, def) => (jogador === c.you && ehEquipar(def) ? { reduce: 2 } : null) },
        text: 'Nível 2 — As habilidades de equipar que você ativa custam {2} a menos para serem ativadas.',
      }),
      nivel('{3}{R}{W}', 3),
      // rulings 2 e 3: exigência de bloqueio (CR 509.1c) até o fim do combate (motor/combat.ts blockRequirements)
      triggered(on.custom((e, c) => (e.type === 'attackers' && e.player === c.you ? e.attackers.map((a) => ({ atacante: a.obj })) : false)), function* (c) {
        const bloqueador = tgt(c);
        const atacante = c.event.atacante as ObjId;
        if (bloqueador === null || !c.g.state.combat?.attackers.some((a) => a.id === atacante && !a.removed)) return;
        ruleEffect(c, 'rule:blocksIfAble', { kind: 'endOfCombat' }, { params: { blocker: bloqueador, attacker: atacante } });
      }, {
        condition: (c) => nivelDe(c) >= 3,
        targets: [upTo(1, t.creature(undefined, 'até uma criatura alvo'))],
        text: 'Nível 3 — Sempre que uma criatura que você controla ataca, até uma criatura alvo a bloqueia neste combate se puder.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: duas Fighter Class no nível 2 baixam {4}, sem passar de {0}',
    2: 'teste: virada, ou com custo para bloquear, a criatura alvo não precisa bloquear',
    3: 'teste: duas exigências para a mesma criatura: ela bloqueia uma das atacantes, à escolha do controlador',
    4: 'regra geral: CR 716.2 — três habilidades de classe e duas de nível (cartas/defs/fighter-class.ts)',
    5: 'teste: ao entrar procura um Equipamento; no nível 2 equipar custa {2} a menos',
    6: 'teste: no nível 3, a criatura alvo precisa bloquear a atacante; o desconto do nível 2 continua',
    7: 'regra geral: CR 716.2a — ganhar nível é habilidade ativada: usa a pilha (cartas/defs/fighter-class.ts)',
    8: 'teste: no nível 1 só dá para ganhar o nível 2, e só como feitiço',
    9: 'regra geral: CR 716.2b — cada Classe guarda o próprio nível (objeto.classLevel)',
    10: 'não se aplica: Fighter Class não tem efeito que cresce com outras Classes',
  },
});
