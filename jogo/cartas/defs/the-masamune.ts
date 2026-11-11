// The Masamune
// As long as equipped creature is attacking, it has first strike and must be blocked if able.
// Equipped creature has "If a creature dying causes a triggered ability of this creature or an emblem you own to
// trigger, that ability triggers an additional time."
// Equip {2}
import { defineCard, equip, isEmblem, staticAbility } from '../../motor/api.ts';
import { disparoPorMorte } from '../morte.ts';

export default defineCard({
  name: 'The Masamune',
  faces: [{
    abilities: [
      // simplificação: "precisa ser bloqueada se puder" não é exigido dos bloqueadores
      // a condição fica em `affects` (o motor acha a camada pelos mods)
      staticAbility({
        affects: (c, o) => {
          const alvo = c.g.state.objects[c.source]?.attachedTo;
          return alvo != null && o.id === alvo && !!c.g.state.combat?.attackers.some((a) => a.id === alvo && !a.removed);
        },
        mods: () => [{ k: 'addKeyword', kw: 'first strike' }],
        text: 'Enquanto a criatura equipada estiver atacando, ela tem iniciativa e precisa ser bloqueada se puder.',
      }),
      staticAbility({
        rules: {
          extraTriggers: (c, tr) => {
            const eu = c.g.state.objects[c.source];
            const equipada = eu?.attachedTo;
            if (equipada == null) return 0;
            const daEquipada = tr.source === equipada;
            const doEmblema = c.g.state.objects[tr.source] && isEmblem(c.g, tr.source) && c.g.state.objects[tr.source].owner === eu!.controller;
            return (daEquipada || doEmblema) && disparoPorMorte(c.g, tr) ? 1 : 0;
          },
        },
        text: 'A criatura equipada tem "Se uma criatura morrendo fizer disparar uma habilidade desencadeada desta criatura ou de um emblema seu, essa habilidade dispara uma vez a mais."',
      }),
      equip('{2}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.2 — vale para gatilhos da criatura equipada e dos seus emblemas',
    2: 'regra geral: CR 702.7 — iniciativa só enquanto ataca',
  },
});
