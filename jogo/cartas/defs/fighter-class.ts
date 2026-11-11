// Fighter Class
// (Gain the next level as a sorcery to add its ability.)
// When this Class enters, search your library for an Equipment card, reveal it, put it into your hand, then shuffle.
// {1}{R}{W}: Level 2
// Equip abilities you activate cost {2} less to activate.
// {3}{R}{W}: Level 3
// Whenever a creature you control attacks, up to one target creature blocks it this combat if able.
import { addEffect, chars, defineCard, etb, on, searchTo, staticAbility, t, tgt, triggered, upTo } from '../../motor/api.ts';
import { ehEquipar } from '../armaria.ts';
import { nivelDeClasse } from '../esquilos.ts';

const C = 'Fighter Class';
const nivel = (c: { g: { state: { objects: Record<number, { classLevel: number } | undefined> } }; source: number }) => c.g.state.objects[c.source]?.classLevel ?? 1;

export default defineCard({
  name: C,
  faces: [{
    abilities: [
      etb(function* (c) {
        yield* searchTo(c, c.you, (id) => chars(c.g, id).subtypes.includes('Equipment'), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de Equipamento' });
      }, { text: 'Quando esta Classe entra, procure no seu grimório uma carta de Equipamento, revele-a, coloque-a na sua mão e depois embaralhe.' }),
      nivelDeClasse(C, '{1}{R}{W}', 2),
      // ruling 1: só a mana genérica; cada Fighter Class reduz {2}; nunca abaixo de {0}
      staticAbility({
        rules: { abilityCostModifier: (c, p, _f, def) => (p === c.you && ehEquipar(def) && nivel(c as never) >= 2 ? { reduce: 2 } : null) },
        text: 'Nível 2 — Habilidades de equipar que você ativa custam {2} a menos para serem ativadas.',
      }),
      nivelDeClasse(C, '{3}{R}{W}', 3),
      // CR 509.1c: exigência de bloqueio (motor/combat.ts rule:blocksIfAble)
      triggered(on.custom((e, c) => (e.type === 'attackers' && e.player === c.you ? e.attackers.map((a) => ({ atacante: a.obj })) : false)), function* (c) {
        const bloqueador = tgt(c);
        const atacante = (c.event as { atacante?: number }).atacante;
        if (bloqueador === null || atacante === undefined) return;
        addEffect(c.g, { source: c.source, sourceDef: C, controller: c.you, affected: [bloqueador], duration: { kind: 'endOfCombat' }, mods: [{ k: 'rule', id: 'rule:blocksIfAble', params: { attacker: atacante } }] });
      }, {
        condition: (c) => nivel(c as never) >= 3,
        targets: [upTo(1, t.creature(undefined, 'até uma criatura alvo'))],
        text: 'Nível 3 — Sempre que uma criatura que você controla ataca, até uma criatura alvo a bloqueia neste combate se puder.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: nível 2: equipar custa {2} a menos',
    2: 'regra geral: CR 509.1c — virada ou que não pode bloquear não bloqueia; custo para bloquear não é obrigatório (motor/combat.ts forcedBlocks usa os bloqueios possíveis)',
    3: 'regra geral: CR 509.1c — com várias exigências, o controlador escolhe qual cumprir (motor/combat.ts validateBlocks aceita qualquer uma)',
    4: 'regra geral: CR 716.2 — três habilidades de classe e duas de nível (cartas/esquilos.ts nivelDeClasse)',
    5: 'teste: nível 3: a criatura alvo precisa bloquear a atacante',
    6: 'regra geral: CR 716.2c — subir de nível não tira as habilidades anteriores (as condições usam nível ≥ N)',
    7: 'regra geral: CR 716.2a — subir de nível usa a pilha (cartas/esquilos.ts nivelDeClasse)',
    8: 'regra geral: CR 716.2a — o nível 2 só com a Classe no nível 1, o 3 só no 2 (condição de nivelDeClasse)',
    9: 'regra geral: CR 716.2b — cada Classe guarda o próprio nível (objeto.classLevel)',
    10: 'não se aplica: fala de Barbarian Class, que não está nos decks',
  },
});
