// Cast Out
// Flash
// When this enchantment enters, exile target nonland permanent an opponent controls until this enchantment leaves the
// battlefield.
// Cycling {W} ({W}, Discard this card: Draw a card.)
import { and, cycling, defineCard, etb, exile, is, keyword, lkiObj, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';

const CHAVE = 'cast-out';

export default defineCard({
  name: 'Cast Out',
  faces: [{
    abilities: [
      keyword('flash'),
      etb(function* (c) {
        const id = tgt(c);
        // ruling 1: se Cast Out já saiu do campo, nada é exilado
        if (id === null || c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
      }, {
        targets: [t.nonlandPermanent(and(is.nonland, is.opponents), 'permanente não terreno alvo que um oponente controla')],
        text: 'Quando este encantamento entra, exile o permanente não terreno alvo que um oponente controla até este encantamento sair do campo.',
      }),
      // CR 610.3: a volta é um efeito único logo depois de Cast Out sair; volta sob o controle do dono (610.3c)
      triggered(on.selfLeaves(), function* (c) {
        const exiladas = (lkiObj(c.g, c.source)?.linked[CHAVE] ?? []).filter((id) => c.g.state.objects[id]?.zone === 'exile');
        if (exiladas.length) yield* putOntoBattlefield(c.g, exiladas.map((id) => ({ id, controller: c.g.state.objects[id].owner })), 'effect');
      }, { text: 'Quando este encantamento sai do campo, a carta exilada volta ao campo.' }),
      // CR 702.29a
      cycling('{W}'),
    ],
  }],
  rulings: {
    1: 'teste: se Cast Out sai do campo antes de o gatilho resolver, nada é exilado',
    2: 'regra geral: CR 400.7 — a carta exilada é um objeto novo: Auras vão para o cemitério, Equipamentos soltam e marcadores somem',
    3: 'regra geral: CR 111.7 — a ficha exilada deixa de existir e não volta',
    4: 'teste: exila o permanente não terreno de um oponente até sair do campo; ciclagem {W}',
    5: 'regra geral: CR 610.3 — a carta volta quando Cast Out sai do campo, também quando o dono dele deixa a partida',
  },
});
