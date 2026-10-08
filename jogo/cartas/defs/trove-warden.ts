// Trove Warden
// Vigilance
// Landfall — Whenever a land you control enters, exile target permanent card with mana value 3 or less from your
// graveyard.
// When this creature dies, put each permanent card exiled with it onto the battlefield under the control of that
// card's owner.
import { and, defineCard, exile, is, keyword, lkiObj, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';

const CHAVE = 'guardadas';

export default defineCard({
  name: 'Trove Warden',
  faces: [{
    abilities: [
      keyword('vigilance'),
      triggered(on.landfall(), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
      }, {
        targets: [t.card('graveyard', and(is.permanentCard, is.mvAtMost(3)), 'carta de permanente alvo com valor de mana 3 ou menos no seu cemitério')],
        text: 'Queda de terreno — Sempre que um terreno que você controla entra, exile a carta de permanente alvo com valor de mana 3 ou menos do seu cemitério.',
      }),
      triggered(on.selfDies(), function* (c) {
        const guardadas = (lkiObj(c.g, c.source)?.linked[CHAVE] ?? []).filter((id) => c.g.state.objects[id]?.zone === 'exile');
        if (guardadas.length) yield* putOntoBattlefield(c.g, guardadas.map((id) => ({ id, controller: c.g.state.objects[id].owner })), 'effect');
      }, { text: 'Quando esta criatura morre, coloque no campo cada carta de permanente exilada com ela, sob o controle do dono dela.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.3b — o controlador ordena os próprios gatilhos',
    2: 'não se aplica: nenhuma carta dos decks transforma um permanente em terreno',
    3: 'teste: dispara jogando terreno',
  },
});
