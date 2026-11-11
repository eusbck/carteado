// Talon Gates of Madara
// When this land enters, up to one target creature phases out.
// {T}: Add {C}.
// {1}, {T}: Add one mana of any color.
// {4}: Put this card from your hand onto the battlefield.
import { activated, defineCard, etb, mana, phaseOut, putOntoBattlefield, t, tgt, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Talon Gates of Madara',
  faces: [{
    abilities: [
      // CR 702.26 (motor/mecanicas.ts phaseOut): rulings 1 a 7
      etb(function* (c) { const id = tgt(c); if (id !== null) phaseOut(c.g, [id]); }, {
        targets: [upTo(1, t.creature(undefined, 'até uma criatura alvo'))],
        text: 'Quando este terreno entra, até uma criatura alvo sai de fase.',
      }),
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana('any', { cost: '{1}, {T}', text: '{1}, {T}: Adicione uma mana de qualquer cor.' }),
      // ruling 8: revelada da mão até resolver; se não estiver mais na mão, nada acontece. Não é jogar terreno
      activated('{4}', function* (c) {
        const o = c.g.state.objects[c.source];
        if (!o || o.zone !== 'hand') return;
        yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you }], 'effect');
      }, { zones: ['hand'], text: '{4}: Ponha esta carta da sua mão no campo.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.26b — fora de fase, a permanente é tratada como se não existisse (motor/mecanicas.ts)',
    2: 'regra geral: CR 702.26g — o que está anexado sai de fase junto (motor/mecanicas.ts phaseOut)',
    3: 'teste: a criatura sai de fase e volta na etapa de desvirar do controlador',
    4: 'regra geral: CR 506.4 — sai do combate (motor/mecanicas.ts phaseOut)',
    5: 'regra geral: CR 702.26d — sair e voltar de fase não dispara "sai do campo" nem "entra" (motor/mecanicas.ts)',
    6: 'regra geral: CR 702.26f — efeitos "enquanto" que acompanham a permanente acabam (motor/state.ts)',
    7: 'regra geral: CR 702.26d — as escolhas feitas ao entrar continuam (o objeto é o mesmo)',
    8: 'teste: {4}: da mão para o campo, sem contar como jogar terreno; e a criatura alvo sai de fase',
  },
});
