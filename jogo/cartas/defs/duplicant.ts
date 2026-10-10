// Duplicant
// Imprint — When this creature enters, you may exile target nontoken creature.
// As long as a card exiled with this creature is a creature card, this creature has the power, toughness, and creature types of the last creature card exiled with it. It's still a Shapeshifter.
import { chars, defineCard, etb, exile, is, isCreature, selfGets, t, tgt, yesNo } from '../../motor/api.ts';
import { CREATURE_SUBTYPES } from '../../motor/oracle.ts';

export default defineCard({
  name: "Duplicant",
  faces: [{
    abilities: [
      etb(function*(c) {
        const id = tgt(c); if (id === null || !(yield* yesNo(c.g, c.you, 'Duplicant: exilar a criatura alvo?'))) return;
        const out = yield* exile(c.g, [id]);
        const source = c.g.state.objects[c.source];
        if (source?.zone === 'battlefield') {
          source.linked.imprint = [...source.linked.imprint ?? [], ...out.filter((id): id is number => id !== null)];
          c.g.bump();
        }
      }, { targets: [t.creature(is.nontoken, 'criatura não ficha alvo')], text: 'Quando entra, você pode exilar a criatura não ficha alvo.' }),
      selfGets((c, o) => {
        const id = o.linked.imprint?.filter((id) => c.g.state.objects[id]?.zone === 'exile' && isCreature(c.g, id)).at(-1);
        if (id === undefined) return [];
        const model = chars(c.g, id);
        const nonCreature = chars(c.g, o.id).subtypes.filter((s) => !CREATURE_SUBTYPES.has(s));
        return [{ k: 'setPT', p: model.power ?? 0, t: model.toughness ?? 0 }, { k: 'setTypes', types: chars(c.g, o.id).types, keepSupertypes: true, subtypes: [...new Set([...nonCreature, ...model.subtypes.filter((s) => CREATURE_SUBTYPES.has(s)), 'Shapeshifter'])] }];
      }, 'Tem a força, resistência e tipos de criatura da última carta de criatura exilada com ele; continua Shapeshifter.'),
    ]
  }],
  rulings: {
    "1": "CR 613.4b-c: teste: valores básicos copiados da carta exilada; marcadores e bônus sobre Duplicant continuam aplicáveis.",
    "2": "CR 604.3: teste: CDA da carta exilada funciona no exílio; bônus estáticos de campo não a afetam.",
    "3": "teste: os valores são recalculados quando a CDA da carta exilada muda.",
    "4": "não se aplica: esta frente não contém cartas meld ou criaturas mescladas; o vínculo preserva a ordem dos objetos exilados."
  },
});
