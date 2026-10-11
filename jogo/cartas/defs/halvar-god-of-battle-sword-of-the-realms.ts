// Halvar, God of Battle // Sword of the Realms (modal de duas faces)
// Halvar, God of Battle {2}{W}{W} — Legendary Creature — God 4/4
// Creatures you control that are enchanted or equipped have double strike.
// At the beginning of each combat, you may attach target Aura or Equipment attached to a creature you control to
// target creature you control.
// Sword of the Realms {1}{W} — Legendary Artifact — Equipment
// Equipped creature gets +2/+0 and has vigilance.
// Whenever equipped creature dies, return it to its owner's hand.
// Equip {1}{W}
import { anthem, attach, attachedGets, chars, controllerOf, defineCard, equip, is, isCreature, moveObjects, on, t, tgt, triggered, yesNo, type G, type ObjId } from '../../motor/api.ts';

/** há uma Aura ou um Equipamento preso a este permanente (ruling 1: não precisa ser seu) */
function temAnexo(g: G, id: ObjId): boolean {
  return g.state.zones.battlefield.some((a) => g.state.objects[a].attachedTo === id && chars(g, a).subtypes.some((s) => s === 'Aura' || s === 'Equipment'));
}

export default defineCard({
  name: 'Halvar, God of Battle // Sword of the Realms',
  faces: [
    {
      abilities: [
        anthem((c, id) => is.creature(c, id) && controllerOf(c.g, id) === c.you && temAnexo(c.g, id), () => [{ k: 'addKeyword', kw: 'double strike' }],
          'As criaturas que você controla que estão encantadas ou equipadas têm golpe duplo.'),
        triggered(on.beginCombat('each'), function* (c) {
          // ruling 3: com um alvo ilegal, nada acontece; já presa à criatura alvo, nada muda
          const anexo = tgt(c, 0);
          const criatura = tgt(c, 1);
          if (anexo === null || criatura === null) return;
          if (!(yield* yesNo(c.g, c.you, 'Halvar: anexar a Aura ou o Equipamento alvo à criatura alvo?'))) return;
          attach(c.g, anexo, criatura);
        }, {
          targets: [
            // ruling 2: a Aura ou o Equipamento não precisa ser seu, mas precisa estar preso a uma criatura sua
            t.permanent((c, id) => chars(c.g, id).subtypes.some((s) => s === 'Aura' || s === 'Equipment') && (() => {
              const a = c.g.state.objects[id].attachedTo;
              return a !== null && !!c.g.state.objects[a] && isCreature(c.g, a) && controllerOf(c.g, a) === c.you;
            })(), 'Aura ou Equipamento alvo preso a uma criatura que você controla'),
            t.creature(is.yours, 'criatura alvo que você controla'),
          ],
          text: 'No início de cada combate, você pode anexar a Aura ou o Equipamento alvo preso a uma criatura sua a outra criatura alvo sua.',
        }),
      ],
    },
    {
      abilities: [
        attachedGets(() => [{ k: 'pt', p: 2, t: 0 }, { k: 'addKeyword', kw: 'vigilance' }], 'A criatura equipada recebe +2/+0 e tem vigilância.'),
        triggered(on.custom((e, c) => {
          if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard' || c.obj.attachedTo !== e.old) return false;
          return c.g.state.lki[e.old]?.chars.types.includes('Creature') ? { carta: e.obj } : false;
        }), function* (c) {
          // ruling 4: se a carta já saiu do cemitério, fica onde está; ruling 5: a ficha deixa de existir (CR 111.8)
          const id = c.event.carta as ObjId;
          if (c.g.state.objects[id]?.zone === 'graveyard') yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
        }, { text: 'Sempre que a criatura equipada morre, devolva-a para a mão do dono.' }),
        equip('{1}{W}'),
      ],
    },
  ],
  rulings: {
    1: 'teste: Equipamento de outro jogador também dá golpe duplo',
    2: 'teste: move o Equipamento de outro jogador preso a uma criatura sua',
    3: 'teste: com um alvo ilegal, nada acontece',
    4: 'teste: Sword of the Realms devolve a criatura equipada que morre; se ela já saiu do cemitério, fica onde está',
    5: 'regra geral: CR 111.8 — a ficha que sai do campo não muda mais de zona (motor/actions.ts moveObjects)',
    6: 'não se aplica: marcas de face impressas não têm efeito no jogo (CR 712.3a-b)',
    7: 'teste: CR 712.11c — conjurar Sword of the Realms olha só a face de trás',
    8: 'regra geral: CR 712.12 — permissão de jogar ou conjurar uma face (testes/regras-formatos.test.ts)',
    9: 'regra geral: CR 712.12 — a face que se encaixa no efeito (testes/regras-formatos.test.ts)',
    10: 'teste: CR 712.8f — no campo vale o valor de mana da face para cima',
    11: 'regra geral: CR 712.3, 712.9 — só transforma quando uma habilidade manda (testes/regras-formatos.test.ts)',
    12: 'regra geral: CR 712.14 — posta no campo por efeito, entra com a frente (testes/regras-formatos.test.ts)',
    13: 'não se aplica: nenhuma carta dos decks manda escolher um nome',
    14: 'regra geral: CR 903.4d — a identidade de cor soma as duas faces (gerado/cartas.json)',
  },
});
