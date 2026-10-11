// Kimoyo Beads
// At the beginning of your end step, choose one that hasn't been chosen —
// • AV Bead — Draw a card.
// • Communication Bead — Create two 1/1 white Soldier creature tokens.
// • Prime Bead — You gain 3 life. Exile this artifact, then return it to the battlefield under its owner's control.
import { createTokens, defineCard, draw, exile, gainLife, modal, on, putOntoBattlefield, triggered } from '../../motor/api.ts';

const CHAVE = 'contasEscolhidas';

export default defineCard({
  name: 'Kimoyo Beads',
  faces: [{
    abilities: [
      triggered(on.endStep('you'), function* () { /* modos */ }, {
        modes: modal(1, 1, [
          { text: 'Conta AV — Compre uma carta', *effect(c) { yield* draw(c.g, c.you, 1); } },
          { text: 'Conta de Comunicação — Crie duas fichas de criatura Soldier 1/1 brancas', *effect(c) { yield* createTokens(c.g, c.you, 'Soldier', 2); } },
          {
            text: 'Conta Principal — Você ganha 3 de vida. Exile este artefato, depois devolva-o ao campo sob o controle do dono',
            *effect(c) {
              gainLife(c.g, c.you, 3, c.source);
              const o = c.g.state.objects[c.source];
              if (!o || o.zone !== 'battlefield') return;
              // volta como objeto novo (CR 400.7): as contas podem ser escolhidas de novo
              const [ex] = yield* exile(c.g, [c.source]);
              if (ex !== null && ex !== undefined && c.g.state.objects[ex]?.zone === 'exile') yield* putOntoBattlefield(c.g, [{ id: ex, controller: c.g.state.objects[ex].owner }], 'effect');
            },
          },
        ], {
          // "que não tenha sido escolhida": a permanente guarda as contas já escolhidas
          available: (c, i) => !((c.g.state.objects[c.source]?.data[CHAVE] as number[] | undefined) ?? []).includes(i),
          onChosen: (c, modos) => {
            const o = c.g.state.objects[c.source];
            if (o) o.data[CHAVE] = [...((o.data[CHAVE] as number[] | undefined) ?? []), ...modos];
          },
        }),
        text: 'No início da sua etapa final, escolha uma que não tenha sido escolhida — Conta AV: compre uma carta; Conta de Comunicação: crie duas fichas de criatura Soldier 1/1 brancas; Conta Principal: você ganha 3 de vida, exile este artefato e depois devolva-o ao campo sob o controle do dono.',
      }),
    ],
  }],
  rulings: {},
});