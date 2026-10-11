// Komainu Battle Armor
// Menace
// Equipped creature gets +2/+2 and has menace.
// Whenever this creature or equipped creature deals combat damage to a player, goad each creature that player controls.
// Reconfigure {4} ({4}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery.
// While attached, this isn't a creature.)
import { attachedGets, creaturesOf, defineCard, goad, keyword, on, reconfigure, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Komainu Battle Armor',
  faces: [{
    abilities: [
      keyword('menace'),
      attachedGets(() => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'menace' }], 'A criatura equipada recebe +2/+2 e tem ameaçar.'),
      // a fonte do dano é ele mesmo (enquanto é criatura) ou a criatura em que está anexado
      triggered(on.custom((e, c) => (e.type === 'damage' && e.combat && e.target.kind === 'player'
        && (e.source === c.source || e.source === c.g.state.objects[c.source]?.attachedTo) ? { jogador: e.target.id } : false)), function* (c) {
        for (const id of creaturesOf(c.g, c.event.jogador as PlayerId)) goad(c.g, id, c.you);
      }, { text: 'Sempre que esta criatura ou a criatura equipada causa dano de combate a um jogador, goade cada criatura que esse jogador controla.' }),
      // CR 702.151a-b
      ...reconfigure('{4}'),
    ],
  }],
  rulings: {
    1: 'teste: anexado, a criatura equipada recebe +2/+2 e ameaçar, e o dano de combate dela goada as criaturas do jogador',
    2: 'regra geral: CR 702.151b — anexado, deixa de ser criatura e perde os tipos de criatura (motor/criaturas.ts reconfigure)',
    3: 'regra geral: CR 301.5 — o Equipamento não vira quando a criatura equipada vira',
    4: 'regra geral: CR 702.151a — virado, ainda pode reconfigurar; anexar não o desvira',
    5: 'regra geral: CR 702.151b — o efeito de não ser criatura dura até ser desanexado (motor/criaturas.ts reconfigure)',
    6: 'regra geral: CR 704.5n — ao deixar de ser criatura, Equipamentos e Auras de criatura presos a ele soltam (motor/sba.ts)',
    7: 'regra geral: CR 301.5c — com reconfigurar, pode ser anexado por outros efeitos (motor/actions.ts attach)',
    8: 'regra geral: CR 702.151a — reconfigurar não é habilidade de equipar (a palavra-chave registrada é reconfigure)',
    9: 'regra geral: CR 702.151a — só anexa a outra criatura; nunca a si mesmo (motor/criaturas.ts reconfigure)',
    10: 'regra geral: CR 704.5n — se ainda for criatura depois de anexado, solta na hora (motor/sba.ts)',
  },
});
