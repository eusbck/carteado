// Qasali Slingers
// Reach
// Whenever this creature or another Cat you control enters, you may destroy target artifact or enchantment.
import { controllerOf, defineCard, destroy, is, isSubtype, keyword, on, or, t, tgt, triggered, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Qasali Slingers',
  faces: [{
    abilities: [
      keyword('reach'),
      // ruling 1: dispara para ela mesma e para cada Cat que entra junto com ela (CR 603.6a)
      triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj]
        && (e.obj === c.source || (controllerOf(c.g, e.obj) === c.you && isSubtype(c.g, e.obj, 'Cat')))), function* (c) {
        // "você pode": sem alvo escolhido, nada é destruído
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, {
        targets: [upTo(1, t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo (opcional)'))],
        text: 'Sempre que esta criatura ou outro Cat que você controla entra, você pode destruir o artefato ou encantamento alvo.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: dispara ao entrar e de novo quando outro Cat seu entra',
  },
});
