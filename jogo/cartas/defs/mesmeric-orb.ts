// Mesmeric Orb
// Whenever a permanent becomes untapped, that permanent's controller mills a card.
import { controllerOf, defineCard, mill, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Mesmeric Orb',
  faces: [{
    abilities: [
      // um disparo por permanente desvirado; os da etapa de desvirar vão para a pilha na manutenção (ruling 1, CR 503.1)
      triggered(on.custom((e, c) => (e.type === 'untap' && c.g.state.objects[e.obj] ? { jogador: controllerOf(c.g, e.obj) } : false)), function* (c) {
        const p = (c.event as { jogador: number }).jogador;
        yield* mill(c.g, p, 1);
      }, { text: 'Sempre que um permanente é desvirado, o controlador dele mói uma carta.' }),
    ],
  }],
  rulings: { 1: 'teste: na etapa de desvirar, um gatilho por permanente desvirado, resolvidos na manutenção' },
});
