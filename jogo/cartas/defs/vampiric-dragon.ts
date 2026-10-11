// Vampiric Dragon
// Flying
// Whenever a creature dealt damage by this creature this turn dies, put a +1/+1 counter on this creature.
// {1}{R}: This creature deals 1 damage to target creature.
import { activated, addCounters, dealDamage, defineCard, keyword, on, t, tgt, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Vampiric Dragon',
  faces: [{
    abilities: [
      keyword('flying'),
      // anota no próprio objeto as criaturas a que causou dano neste turno
      triggered(on.custom((e, c) => {
        if (e.type !== 'damage' || e.source !== c.source || e.target.kind !== 'obj') return false;
        const o = c.g.state.objects[c.source];
        if (!o) return false;
        const turno = c.g.state.turn.number;
        const reg = (o.data.dragaoFeriu as { turno: number; ids: ObjId[] } | undefined);
        o.data.dragaoFeriu = { turno, ids: [...(reg && reg.turno === turno ? reg.ids : []), e.target.id] };
        return false;
      }), function* () { /* só registra */ }, { text: '' }),
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard') return false;
        const l = c.g.state.lki[e.old];
        const reg = c.g.state.objects[c.source]?.data.dragaoFeriu as { turno: number; ids: ObjId[] } | undefined;
        return !!l && l.chars.types.includes('Creature') && !!reg && reg.turno === c.g.state.turn.number && reg.ids.includes(e.old);
      }), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que uma criatura que recebeu dano desta criatura neste turno morre, coloque um marcador +1/+1 nesta criatura.' }),
      activated('{1}{R}', function* (c) {
        const id = tgt(c);
        if (id !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: 1, combat: false }]);
      }, { targets: [t.creature()], text: '{1}{R}: Esta criatura causa 1 de dano à criatura alvo.' }),
    ],
  }],
  rulings: {},
});
