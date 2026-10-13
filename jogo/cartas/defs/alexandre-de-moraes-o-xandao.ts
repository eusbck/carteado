// Alexandre de Moraes, o Xandão (carta própria da mesa)
// Vigilance
// When Xandão enters, exile target creature an opponent controls until Xandão leaves the battlefield.
// {2}, {T}: Put an ankle monitor counter on target creature. Creatures with ankle monitor counters on them can't attack
// or block.
import { activated, addCounters, and, defineCard, etb, exile, is, keyword, lkiObj, on, putOntoBattlefield, staticAbility, t, tgt, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const CHAVE = 'preso';
const MARCADOR = 'tornozeleira';
const monitorada = (g: G, id: ObjId) => (g.state.objects[id]?.counters[MARCADOR] ?? 0) > 0;

export default defineCard({
  name: 'Alexandre de Moraes, o Xandão',
  faces: [{
    abilities: [
      keyword('vigilance'),
      etb(function* (c) {
        const id = tgt(c);
        // CR 610.3: se Xandão já saiu do campo, nada é exilado
        if (id === null || c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
      }, {
        targets: [t.creature(and(is.opponents), 'criatura alvo que um oponente controla')],
        text: 'Quando Xandão entra, exile a criatura alvo que um oponente controla até Xandão sair do campo de batalha.',
      }),
      // CR 610.3c: a carta volta sob o controle do dono
      triggered(on.selfLeaves(), function* (c) {
        const exiladas = (lkiObj(c.g, c.source)?.linked[CHAVE] ?? []).filter((id) => c.g.state.objects[id]?.zone === 'exile');
        if (exiladas.length) yield* putOntoBattlefield(c.g, exiladas.map((id) => ({ id, controller: c.g.state.objects[id].owner })), 'effect');
      }, { text: 'Quando Xandão sai do campo de batalha, a carta exilada volta ao campo.' }),
      activated('{2}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, MARCADOR, 1, c.you);
      }, { targets: [t.creature()], text: '{2}, {T}: Coloque um marcador de tornozeleira na criatura alvo.' }),
      staticAbility({
        rules: { canAttack: (c, a) => !monitorada(c.g, a), canBlock: (c, b) => !monitorada(c.g, b) },
        text: 'Criaturas com marcadores de tornozeleira não podem atacar nem bloquear.',
      }),
    ],
  }],
  rulings: {},
});
