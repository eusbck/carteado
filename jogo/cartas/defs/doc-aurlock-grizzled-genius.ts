// Doc Aurlock, Grizzled Genius
// Spells you cast from your graveyard or from exile cost {2} less to cast.
// Plotting cards from your hand costs {2} less.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Doc Aurlock, Grizzled Genius',
  faces: [{
    abilities: [
      // rulings 1-2: reduz só o genérico do custo total (CR 601.2f)
      staticAbility({
        rules: { costModifier: (c, sp) => (sp.controller === c.you && (sp.castFrom === 'graveyard' || sp.castFrom === 'exile') ? { reduce: 2 } : null) },
        text: 'As mágicas que você conjura do seu cemitério ou do exílio custam {2} a menos para serem conjuradas.',
      }),
      // nenhuma carta dos decks tem tramar (plot, CR 702.170): a segunda habilidade fica só no texto
      staticAbility({ text: 'Tramar cartas da sua mão custa {2} a menos.' }),
    ],
  }],
  rulings: {
    1: 'teste: uma mágica conjurada do cemitério ou do exílio custa {2} a menos; da mão, não',
    2: 'teste: a redução não paga mana colorida',
    3: 'não se aplica: nenhuma carta dos decks tem tramar (plot)',
    4: 'não se aplica: nenhuma carta dos decks tem tramar (plot)',
    5: 'não se aplica: nenhuma carta dos decks tem tramar (plot)',
    6: 'não se aplica: nenhuma carta dos decks tem tramar (plot)',
    7: 'não se aplica: nenhuma carta dos decks tem tramar (plot)',
  },
});
