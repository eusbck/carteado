// Hoarding Broodlord
// Convoke
// Flying
// When this creature enters, search your library for a card, exile it face down, then shuffle. For as long as that card
// remains exiled, you may play it.
// Spells you cast from exile have convoke.
import { allowPlay, defineCard, etb, keyword, moveObjects, searchLibrary, shuffleLibrary, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Hoarding Broodlord',
  faces: [{
    convoke: true,
    abilities: [
      keyword('convoke'),
      keyword('flying'),
      etb(function* (c) {
        const g = c.g;
        const [achada] = yield* searchLibrary(g, c.you, c.you, { max: 1, prompt: 'Procure uma carta para exilar virada para baixo' });
        if (achada !== undefined) {
          // ruling 8: você pode olhar a carta exilada enquanto ela continuar exilada
          const [ex] = yield* moveObjects(g, [{ id: achada, to: 'exile', faceDown: true, visibleTo: [c.you] }], 'exile');
          // ruling 7: quem joga a carta é quem controlava o Broodlord na resolução, mesmo que outro ganhe o controle dele
          if (ex !== null && ex !== undefined) allowPlay(g, c.you, c.source, [ex], { kind: 'permanent' });
        }
        shuffleLibrary(g, c.you);
      }, { text: 'Quando esta criatura entra, procure uma carta no seu grimório, exile-a virada para baixo e embaralhe. Enquanto ela continuar exilada, você pode jogá-la.' }),
      staticAbility({
        rules: {
          spellsHaveConvoke: (c, p, magica) => {
            const o = c.g.state.objects[magica];
            return p === c.you && !!o && (o.zone === 'exile' || (o.zone === 'stack' && o.stack?.castFrom === 'exile'));
          },
        },
        text: 'As mágicas que você conjura do exílio têm convocar.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.51a — criatura multicolorida paga {1} ou uma mana de uma das cores dela (motor/mana.ts convokeOne)',
    2: 'regra geral: CR 601.2g-h — mana ativada antes do pagamento vira a criatura antes de convocar (motor/stack.ts)',
    3: 'regra geral: CR 702.51b — convocar não é custo alternativo e soma com eles (motor/stack.ts)',
    4: 'regra geral: CR 702.51a — qualquer criatura desvirada convoca, mesmo com enjoo (motor/stack.ts)',
    5: 'regra geral: CR 702.51a — virar atacante ou bloqueador para convocar não o tira do combate',
    6: 'regra geral: CR 601.2f, 702.51a — convocar se aplica depois do custo total; o valor de mana não muda (motor/stack.ts)',
    7: 'teste: busca e exila virada para baixo; você joga a carta e as mágicas do exílio têm convocar',
    8: 'teste: busca e exila virada para baixo; você joga a carta e as mágicas do exílio têm convocar',
  },
});
