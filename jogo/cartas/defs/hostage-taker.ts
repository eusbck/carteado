// Hostage Taker
// When this creature enters, exile another target creature or artifact until this creature leaves the battlefield. You may
// cast that card for as long as it remains exiled, and mana of any type can be spent to cast that spell.
import { allowPlay, and, defineCard, etb, exile, is, lkiObj, on, or, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';

const CHAVE = 'refem';

export default defineCard({
  name: 'Hostage Taker',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        // ruling 2: se Hostage Taker já saiu do campo, nada é exilado
        if (id === null || c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        const [ex] = yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
        // ruling 4: a ficha deixa de existir; ruling 5: conjurada, a carta vira um objeto novo que é seu
        if (ex === null || ex === undefined || c.g.state.objects[ex]?.zone !== 'exile') return;
        // ruling 6: saindo Hostage Taker, a carta volta na hora (CR 610.3c); aqui a volta é um gatilho, então a permissão
        // acaba junto com Hostage Taker, para não sobrar uma janela em que ainda daria para conjurá-la
        allowPlay(c.g, c.you, c.source, [ex], { kind: 'whileOnBattlefield', obj: c.source }, { anyType: true, spellsOnly: true });
      }, {
        // ruling 1: não pode mirar a si mesmo
        targets: [t.permanent(and(or(is.creature, is.artifact), is.other), 'outra criatura ou artefato alvo')],
        text: 'Quando esta criatura entra, exile outra criatura ou artefato alvo até esta criatura sair do campo. Você pode conjurar essa carta enquanto ela continuar exilada, e mana de qualquer tipo pode ser gasta para conjurá-la.',
      }),
      // CR 610.3: volta logo depois de Hostage Taker sair, sob o controle do dono (610.3c)
      triggered(on.selfLeaves(), function* (c) {
        const exiladas = (lkiObj(c.g, c.source)?.linked[CHAVE] ?? []).filter((id) => c.g.state.objects[id]?.zone === 'exile');
        if (exiladas.length) yield* putOntoBattlefield(c.g, exiladas.map((id) => ({ id, controller: c.g.state.objects[id].owner })), 'effect');
      }, { text: 'Quando esta criatura sai do campo, a carta exilada volta ao campo.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: o alvo é "outra" criatura ou artefato: Hostage Taker não pode mirar a si mesmo (cartas/defs/hostage-taker.ts)',
    2: 'regra geral: CR 610.3 — se Hostage Taker saiu antes de o gatilho resolver, nada é exilado (cartas/defs/hostage-taker.ts)',
    3: 'regra geral: CR 400.7 — a carta exilada é um objeto novo: Auras vão para o cemitério, Equipamentos soltam e marcadores somem',
    4: 'regra geral: CR 111.7 — a ficha exilada deixa de existir, não volta e não pode ser conjurada',
    5: 'teste: você conjura a carta exilada com mana de qualquer tipo e fica com ela mesmo que Hostage Taker saia',
    6: 'teste: saindo Hostage Taker, já não dá para conjurar a carta enquanto ela volta para o dono',
    7: 'regra geral: CR 610.3c — a carta volta sob o controle do dono, também quando o dono de Hostage Taker deixa a partida',
    8: 'regra geral: CR 800.4a — quando você sai da partida, o que você controla de outros donos é exilado (motor/actions.ts)',
  },
});
