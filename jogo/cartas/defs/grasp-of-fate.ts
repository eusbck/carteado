// Grasp of Fate
// When this enchantment enters, for each opponent, exile up to one target nonland permanent that player controls until
// this enchantment leaves the battlefield. (Those permanents return under their owners' control.)
import { and, ATE_SAIR, controllerOf, defineCard, etb, exile, is, t, tgtsAll } from '../../motor/api.ts';
import type { TargetSpec } from '../../motor/defs.ts';

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
        // ruling 1 (CR 610.3b): se Grasp of Fate já saiu do campo, nada é exilado
        if (!ids.length || c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        // CR 610.3: as cartas voltam logo depois de ele sair do campo, sem pilha, sob o controle dos donos (motor ATE_SAIR)
        yield* exile(c.g, ids, { linkTo: { obj: c.source, key: ATE_SAIR } });
      }, { targets: [ALVOS], text: 'Quando este encantamento entra, para cada oponente, exile até um permanente não terreno alvo que esse jogador controla até este encantamento sair do campo. (Essas permanentes voltam sob o controle dos donos.)' }),
    ],
  }],
  rulings: {
    1: 'teste: se Grasp of Fate sai do campo antes de o gatilho resolver, nada é exilado',
    2: 'teste: a carta volta como objeto nova: a Aura dela foi para o cemitério e os marcadores sumiram',
    3: 'regra geral: CR 111.7 — a ficha exilada deixa de existir e não volta (motor/actions.ts voltarAteSair)',
    4: 'teste: destruído por Invoke the Divine, as permanentes voltam na hora, sem nada na pilha',
    5: 'teste: o dono de Grasp of Fate deixa a partida: as permanentes exiladas voltam',
  },
});
