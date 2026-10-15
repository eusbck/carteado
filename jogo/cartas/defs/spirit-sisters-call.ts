// Spirit-Sister's Call
// At the beginning of your end step, choose target permanent card in your graveyard. You may sacrifice a permanent that
// shares a card type with the chosen card. If you do, return the chosen card from your graveyard to the battlefield and
// it gains "If this permanent would leave the battlefield, exile it instead of putting it anywhere else."
import { addEffect, chars, chooseItems, controlledBy, defineAbility, defineCard, is, nameOf, on, putOntoBattlefield, sacrifice, staticAbility, t, tgt, triggered } from '../../motor/api.ts';
import type { StaticDef } from '../../motor/defs.ts';

const PERMANENTES = ['Artifact', 'Battle', 'Creature', 'Enchantment', 'Land', 'Planeswalker'];

// a habilidade que a permanente devolvida ganha (CR 614.1a, substituição de sair do campo)
const EXILA = defineAbility<StaticDef>("Spirit-Sister's Call:exila", staticAbility({
  rules: { leavesBattlefield: (c, o, dest) => (o.id === c.source && dest !== 'exile' ? { dest: 'exile', label: 'é exilada em vez disso' } : null) },
  text: 'Se esta permanente fosse sair do campo, exile-a em vez de colocá-la em qualquer outro lugar.',
}));

export default defineCard({
  name: "Spirit-Sister's Call",
  faces: [{
    abilities: [
      triggered(on.endStep('you'), function* (c) {
        const carta = tgt(c);
        if (carta === null) return;
        const tipos = chars(c.g, carta).types.filter((x) => PERMANENTES.includes(x));
        const servem = controlledBy(c.g, c.you, (id) => chars(c.g, id).types.some((x) => tipos.includes(x)));
        if (!servem.length) return;
        const [r] = yield* chooseItems(c.g, c.you, `Spirit-Sister's Call: sacrificar uma permanente que tenha um tipo de ${nameOf(c.g, carta)} para devolvê-la ao campo?`,
          [{ id: 'nao', label: 'Não sacrificar' }, ...servem.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id }))], 1, 1);
        if (r === 'nao') return;
        const [sac] = yield* sacrifice(c.g, [Number(r)]);
        if (sac === null || sac === undefined) return;
        if (c.g.state.objects[carta]?.zone !== 'graveyard') return;
        const [nova] = yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you }], 'effect');
        // ruling 1: vale enquanto ela estiver no campo, mesmo sem o Spirit-Sister's Call
        if (nova !== undefined && c.g.state.objects[nova]?.zone === 'battlefield') {
          addEffect(c.g, { source: nova, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: nova }, affected: [nova], mods: [{ k: 'addAbility', id: EXILA.id! }] });
        }
      }, {
        targets: [t.card('graveyard', is.permanentCard, 'carta de permanente alvo do seu cemitério', 'you')],
        text: 'No começo da sua etapa final, escolha a carta de permanente alvo no seu cemitério. Você pode sacrificar uma permanente que tenha um tipo de carta em comum com ela. Se fizer isso, devolva a carta escolhida ao campo e ela ganha "Se esta permanente fosse sair do campo, exile-a em vez de colocá-la em qualquer outro lugar."',
      }),
    ],
  }],
  rulings: {
    1: 'teste: devolve a criatura sacrificando outra, e ela é exilada em vez de morrer, mesmo sem o Spirit-Sister\'s Call',
    2: 'regra geral: CR 700.4 — exilada em vez de ir ao cemitério, não morre (gatilhos de morrer não disparam)',
  },
});
