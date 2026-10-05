// Parasitic Impetus
// Enchant creature
// Enchanted creature gets +2/+2 and is goaded. (It attacks each combat if able and attacks a player other than you if
// able.)
// Whenever enchanted creature attacks, its controller loses 2 life and you gain 2 life.
import { attachedGets, controllerOf, defineCard, gainLife, goadsEnchanted, loseLife, on, t, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Parasitic Impetus',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 2, t: 2 }], 'A criatura encantada recebe +2/+2.'),
      // rulings 3-7: goad pelo controlador da Aura (motor: exigências de ataque, CR 701.15b)
      goadsEnchanted(),
      triggered(on.custom((e, c) => {
        const enc = c.g.state.objects[c.source]?.attachedTo;
        return e.type === 'attackers' && enc != null && e.attackers.some((a) => a.obj === enc) ? { criatura: enc, dono: e.player } : false;
      }), function* (c) {
        const id = c.event.criatura as ObjId;
        const quem = c.g.state.objects[id] ? controllerOf(c.g, id) : (c.event.dono as number);
        // ruling 1: perde e depois ganha; as ações de estado só olham depois
        loseLife(c.g, quem, 2, c.source);
        gainLife(c.g, c.you, 2, c.source);
      }, { text: 'Sempre que a criatura encantada ataca, o controlador dela perde 2 de vida e você ganha 2 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 704.3 — as ações de estado só são verificadas depois do efeito inteiro',
    2: 'teste: você ganha a vida, não o controlador da criatura',
    3: 'regra geral: CR 701.15b — maior número de exigências cumpridas',
    4: 'regra geral: CR 701.15b — deve atacar outro jogador se puder',
    5: 'regra geral: CR 701.15b — goad vale em combates adicionais',
    6: 'regra geral: CR 701.15 — goad não é habilidade da criatura',
    7: 'regra geral: CR 508.1d — virada ou impedida, não ataca; custo não é obrigatório',
  },
});
