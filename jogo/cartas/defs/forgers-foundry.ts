// Forger's Foundry
// {T}: Add {U}. When you spend this mana to cast an instant or sorcery spell with mana value 3 or less, you may exile
// that spell instead of putting it into its owner's graveyard as it resolves.
// {3}{U}{U}, {T}: You may cast any number of spells from among cards exiled with this artifact without paying their mana
// costs. Activate only as a sorcery.
import { activated, chars, defineAbility, defineCard, defineFn, isInstantOrSorcery, mana, manaValueOf, nameOf, triggered, yesNo, addPending, type G } from '../../motor/api.ts';
import type { ManaUnit, ObjId, PlayerId } from '../../motor/types.ts';
import { conjuraDentreGratis } from '../roubo.ts';

/** spells marcados por esta Foundry (ids na pilha), guardados no objeto dela */
const CHAVE = 'fundicao';

/**
 * Cartas exiladas com esta Foundry (CR 607.2a): as mágicas marcadas que foram da pilha para o exílio e continuam lá
 * (a última informação de cada mágica diz para onde ela foi, CR 400.7).
 */
function exiladasComAFundicao(g: G, foundry: ObjId): ObjId[] {
  const o = g.state.objects[foundry] ?? g.state.lki[foundry]?.obj;
  const magicas = (o?.data[CHAVE] as ObjId[] | undefined) ?? [];
  const out: ObjId[] = [];
  for (const m of magicas) {
    const l = g.state.lki[m];
    if (l?.newZone === 'exile' && l.newId !== null && g.state.objects[l.newId]?.zone === 'exile') out.push(l.newId);
  }
  return out;
}

// o gatilho de quando a mana é gasta (CR 106.6, 603.2): "você pode exilar essa mágica em vez de pô-la no cemitério"
const GASTA = defineAbility("Forger's Foundry:gasta", triggered({ kind: 'batch', match: () => false }, function* (c) {
  const magica = c.event.spell as ObjId;
  const o = c.g.state.objects[magica];
  if (!o || o.zone !== 'stack' || o.stack?.kind !== 'spell') return;
  if (!(yield* yesNo(c.g, c.you, `Forger's Foundry: exilar ${nameOf(c.g, magica)} em vez de pô-la no cemitério quando ela resolver?`))) return;
  // só ao resolver (anulada, vai para o cemitério): motor/actions.ts finalDestination, exileAsResolves
  o.stack.data.exileAsResolves = true;
  const f = c.g.state.objects[c.source];
  if (f?.zone === 'battlefield') f.data[CHAVE] = [...((f.data[CHAVE] as ObjId[] | undefined) ?? []), magica];
  c.g.bump();
}, { text: 'Quando você gasta esta mana para conjurar uma mágica instantânea ou de feitiço com valor de mana 3 ou menos, você pode exilar essa mágica em vez de pô-la no cemitério do dono quando ela resolver.' }));

// a mana é gasta: o gatilho só existe se a mágica for instantânea ou feitiço com valor de mana 3 ou menos (ruling 3: o
// X escolhido conta no valor de mana)
const AO_GASTAR = "Forger's Foundry:aoGastar";
defineFn(AO_GASTAR, (g: G, u: ManaUnit, purpose: { kind: string; obj?: number }, player: PlayerId) => {
  if (purpose.kind !== 'spell' || purpose.obj === undefined) return;
  const o = g.state.objects[purpose.obj];
  if (!o || !isInstantOrSorcery(g, purpose.obj)) return;
  if (manaValueOf(chars(g, purpose.obj).manaCost, o.stack?.x ?? 0) > 3) return;
  addPending(g, GASTA.id!, u.source ?? purpose.obj, player, { spell: purpose.obj }, {});
});

export default defineCard({
  name: "Forger's Foundry",
  faces: [{
    abilities: [
      // ruling 1: a mana pode ser gasta em qualquer coisa
      mana('U', { rider: AO_GASTAR, text: '{T}: Adicione {U}. Quando você gasta esta mana para conjurar uma mágica instantânea ou de feitiço com valor de mana 3 ou menos, você pode exilar essa mágica em vez de pô-la no cemitério do dono quando ela resolver.' }),
      activated('{3}{U}{U}, {T}', function* (c) {
        // rulings 4-5: conjuradas agora, uma de cada vez, na ordem escolhida
        yield* conjuraDentreGratis(c, exiladasComAFundicao(c.g, c.source), { rotulo: "Forger's Foundry", varias: true });
      }, { timing: 'sorcery', text: '{3}{U}{U}, {T}: Você pode conjurar quantas mágicas quiser dentre as cartas exiladas com este artefato sem pagar os custos de mana delas. Ative apenas como um feitiço.' }),
    ],
  }],
  rulings: {
    1: 'teste: a mana gasta numa mágica de criatura não dispara nada',
    2: 'teste: o gatilho resolve mesmo com a Foundry fora do campo',
    3: 'regra geral: CR 202.3e — o valor de mana na pilha conta o X escolhido (cartas/defs/forgers-foundry.ts aoGastar)',
    4: 'teste: a instantânea paga com a mana dela é exilada ao resolver e depois conjurada de graça pela segunda habilidade',
    5: 'regra geral: CR 608.2g — conjuradas durante a resolução, ignorando o tempo do tipo (motor/stack.ts castSpell)',
    6: 'regra geral: CR 118.9a — sem pagar o custo de mana não se escolhe custo alternativo; custos adicionais continuam (motor/stack.ts)',
    7: 'regra geral: CR 107.3b — sem pagar o custo de mana, X vale 0 (motor/stack.ts)',
  },
});
