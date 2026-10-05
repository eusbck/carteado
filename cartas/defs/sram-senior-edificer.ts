// Sram, Senior Edificer
// Whenever you cast an Aura, Equipment, or Vehicle spell, draw a card.
import { defineCard, draw, is, on, or, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Sram, Senior Edificer',
  faces: [{
    abilities: [
      // ruling 1: resolve antes da mágica, mesmo que ela seja anulada
      triggered(on.youCast(or(is.subtype('Aura'), is.subtype('Equipment'), is.subtype('Vehicle'))), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você conjura uma mágica de Aura, Equipamento ou Veículo, compre uma carta.' }),
    ],
  }],
  rulings: { 1: 'teste: compra antes de a mágica resolver' },
});
