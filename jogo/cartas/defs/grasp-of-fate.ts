// Grasp of Fate
// When this enchantment enters, for each opponent, exile up to one target nonland permanent that player controls until
// this enchantment leaves the battlefield. (Those permanents return under their owners' control.)
import { and, controllerOf, defineCard, etb, exile, is, lkiObj, on, putOntoBattlefield, t, tgtsAll, triggered } from '../../motor/api.ts';
import type { TargetSpec } from '../../motor/defs.ts';

const CHAVE = 'grasp-of-fate';

// "para cada oponente, até um permanente não terreno alvo que esse jogador controla": no máximo um por oponente
const ALVOS: TargetSpec = {
  ...t.nonlandPermanent(and(is.nonland, is.opponents), 'até um permanente não terreno alvo de cada oponente'),
  min: 0, max: (c) => c.g.opponents(c.you).length,
  validateSet: (c, escolhidos) => {
    const quem = escolhidos.map((r) => (r.kind === 'obj' ? controllerOf(c.g, r.id) : -1));
    return new Set(quem).size === quem.length;
  },
};

export default defineCard({
  name: 'Grasp of Fate',
  faces: [{
    abilities: [
      etb(function* (c) {
        const ids = tgtsAll(c);
        // ruling 1: se Grasp of Fate já saiu do campo, nada é exilado
        if (!ids.length || c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        yield* exile(c.g, ids, { linkTo: { obj: c.source, key: CHAVE } });
      }, { targets: [ALVOS], text: 'Quando este encantamento entra, para cada oponente, exile até um permanente não terreno alvo que esse jogador controla até este encantamento sair do campo.' }),
      // CR 610.3: as cartas voltam logo depois de ele sair, sob o controle dos donos (ruling 4)
      triggered(on.selfLeaves(), function* (c) {
        const exiladas = (lkiObj(c.g, c.source)?.linked[CHAVE] ?? []).filter((id) => c.g.state.objects[id]?.zone === 'exile');
        if (exiladas.length) yield* putOntoBattlefield(c.g, exiladas.map((id) => ({ id, controller: c.g.state.objects[id].owner })), 'effect');
      }, { text: 'Quando este encantamento sai do campo, as cartas exiladas voltam ao campo.' }),
    ],
  }],
  rulings: {
    1: 'teste: se Grasp of Fate sai do campo antes de o gatilho resolver, nada é exilado',
    2: 'regra geral: CR 400.7 — a carta exilada é um objeto novo: Auras vão para o cemitério, Equipamentos soltam e marcadores somem',
    3: 'regra geral: CR 111.7 — a ficha exilada deixa de existir e não volta',
    4: 'teste: exila até um permanente de cada oponente; quando ele sai do campo, elas voltam',
    5: 'regra geral: CR 610.3 — as cartas voltam quando ele sai do campo, também quando o dono deixa a partida',
  },
});
