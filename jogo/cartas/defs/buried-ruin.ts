// Buried Ruin
// {T}: Add {C}.
// {2}, {T}, Sacrifice this land: Return target artifact card from your graveyard to your hand.
import { activated, defineCard, is, mana, returnToHand, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "Buried Ruin",
  faces: [{ abilities: [mana('C'), activated('{2}, {T}, Sacrifice this land', function*(c) { const id = tgt(c); if (id !== null) yield* returnToHand(c.g, [id]); }, { targets: [t.card('graveyard', is.artifact, 'carta de artefato alvo no seu cemitério')], text: '{2}, {T}, Sacrifique este terreno: devolva a carta de artefato alvo do seu cemitério à mão.' })] }],
  rulings: {},
});
