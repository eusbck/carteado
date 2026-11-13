// The Masamune
// As long as equipped creature is attacking, it has first strike and must be blocked if able.
// Equipped creature has "If a creature dying causes a triggered ability of this creature or an emblem you own to
// trigger, that ability triggers an additional time."
// Equip {2}
import { defineCard, equip, isAttacking, isEmblem, morteCausouDisparo, staticAbility } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';

/** a criatura equipada (o id pode ser o da que acabou de morrer: o Equipamento só se solta nas ações de estado) */
function equipada(c: SCtx): ObjId | null {
  const o = c.g.state.objects[c.source];
  return o?.zone === 'battlefield' ? o.attachedTo : null;
}

export default defineCard({
  name: 'The Masamune',
  faces: [{
    abilities: [
      staticAbility({
        affects: (c, o) => o.id === equipada(c) && isAttacking(c.g, o.id),
        mods: () => [{ k: 'addKeyword', kw: 'first strike' }],
        // CR 509.1c: exigência de bloqueio (motor/bloqueio-obrigatorio.ts)
        rules: { mustBeBlockedIfAble: (c, a) => a === equipada(c) && isAttacking(c.g, a) },
        text: 'Enquanto a criatura equipada estiver atacando, ela tem iniciativa e precisa ser bloqueada se possível.',
      }),
      staticAbility({
        rules: {
          extraTriggers: (c, tr) => {
            const eq = equipada(c);
            if (eq === null || !morteCausouDisparo(c.g, tr)) return 0;
            // ruling 5: a criatura equipada que morre junto (ou ela mesma morrendo) ainda conta, pela última informação
            if (tr.source === eq) return 1;
            // "um emblema de que você é dono": você é quem controla a criatura equipada
            const dono = c.g.state.objects[eq]?.zone === 'battlefield' ? c.g.state.objects[eq].controller : c.g.state.lki[eq]?.chars.controller;
            return isEmblem(c.g, tr.source) && c.g.state.objects[tr.source].owner === dono ? 1 : 0;
          },
        },
        text: 'A criatura equipada tem "Se uma criatura morrer e isso fizer disparar uma habilidade desencadeada desta criatura ou de um emblema de que você é dono, essa habilidade dispara uma vez a mais."',
      }),
      equip('{2}'),
    ],
  }],
  rulings: {
    1: 'teste: "sempre que você sacrifica" não dispara a mais',
    2: 'regra geral: o evento de ir do campo para o cemitério conta (motor/morte-dispara.ts ehMorteDeCriatura)',
    3: 'regra geral: CR 603.2 — dispara de novo, com escolhas próprias (motor/triggers.ts extraTriggers)',
    4: 'regra geral: "sai do campo" morrendo é o mesmo evento de mudança de zona (motor/morte-dispara.ts)',
    5: 'teste: a própria criatura equipada morrendo dispara o gatilho dela duas vezes',
    6: 'teste: os gatilhos da criatura equipada e do emblema disparam uma vez a mais quando uma criatura morre',
    7: 'regra geral: CR 603.2 — cada The Masamune soma um disparo (motor/triggers.ts extraTriggers)',
    8: 'regra geral: CR 603.10a — a criatura vista como estava no campo (motor/morte-dispara.ts)',
  },
});
