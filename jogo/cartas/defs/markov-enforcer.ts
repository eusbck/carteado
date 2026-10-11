// Markov Enforcer
// Whenever this creature or another Vampire you control enters, this creature fights up to one target creature an
// opponent controls.
// Whenever a creature dealt damage by this creature this turn dies, create a Blood token. (It's an artifact with "{1},
// {T}, Discard a card, Sacrifice this token: Draw a card.")
import { controllerOf, createTokens, dealDamage, defineCard, isSubtype, on, power, t, tgt, triggered, upTo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

type Registro = { turno: number; ids: ObjId[] };

export default defineCard({
  name: 'Markov Enforcer',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj]
        && (e.obj === c.source || (controllerOf(c.g, e.obj) === c.you && isSubtype(c.g, e.obj, 'Vampire')))), function* (c) {
        const id = tgt(c);
        // CR 701.14a: lutar — cada uma causa à outra dano igual à própria força, ao mesmo tempo; só se as duas estão no campo
        if (id === null || c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        dealDamage(c.g, [
          { source: c.source, target: { kind: 'obj' as const, id }, amount: power(c.g, c.source), combat: false },
          { source: id, target: { kind: 'obj' as const, id: c.source }, amount: power(c.g, id), combat: false },
        ].filter((d) => d.amount > 0));
      }, {
        targets: [upTo(1, t.creature((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id)), 'até uma criatura alvo que um oponente controla'))],
        text: 'Sempre que esta criatura ou outro Vampire que você controla entra, esta criatura luta com até uma criatura alvo que um oponente controla.',
      }),
      // anota no próprio objeto as criaturas a que causou dano neste turno
      triggered(on.custom((e, c) => {
        if (e.type !== 'damage' || e.source !== c.source || e.target.kind !== 'obj') return false;
        const o = c.g.state.objects[c.source];
        if (!o) return false;
        const turno = c.g.state.turn.number;
        const reg = o.data.enforcerFeriu as Registro | undefined;
        o.data.enforcerFeriu = { turno, ids: [...(reg && reg.turno === turno ? reg.ids : []), e.target.id] };
        return false;
      }), function* () { /* só registra */ }, { text: '' }),
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard') return false;
        const l = c.g.state.lki[e.old];
        const reg = c.g.state.objects[c.source]?.data.enforcerFeriu as Registro | undefined;
        return !!l && l.chars.types.includes('Creature') && !!reg && reg.turno === c.g.state.turn.number && reg.ids.includes(e.old);
      }), function* (c) { yield* createTokens(c.g, c.you, 'Blood', 1); }, { text: 'Sempre que uma criatura que recebeu dano desta criatura neste turno morre, crie uma ficha de Blood.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: ficha de Blood é qualquer ficha de artefato com o subtipo Blood, mesmo com outros subtipos (cartas/vampiros.ts fichasDeSangue)',
    2: 'regra geral: CR 118.3 — um permanente sacrificado paga um custo só (motor/costs.ts)',
    3: 'não se aplica: nenhuma carta dos decks dispara ao sacrificar uma ficha de Blood',
  },
});
