// Borg Cube
// Affinity for artifact creatures
// Whenever this Spacecraft enters or attacks, assimilate a creature card exiled with it. If you can't, exile up to one
// target creature.
// Station (It's an artifact creature at 12+.)
// 12+ | Artifact creatures you control have flying.
import { and, anthem, chooseItems, defineCard, exile, is, isCreature, linkedExiled, objItem, on, t, tgt, triggered, upTo } from '../../motor/api.ts';
import type { Ctx, Gen, SCtx } from '../../motor/defs.ts';
import { artefatoCriatura, assimilar } from '../borg.ts';
import { cargas, estacao, nivelDeEstacao } from '../estacao.ts';

const CHAVE = 'borg-cube';

function* aoEntrarOuAtacar(c: Ctx): Gen<void> {
  const cartas = linkedExiled(c.g, c.source, CHAVE).filter((id) => c.g.state.objects[id]?.zone === 'exile' && isCreature(c.g, id));
  if (cartas.length) {
    const [escolhida] = yield* chooseItems(c.g, c.you, 'Borg Cube: assimile uma carta de criatura exilada com ela', cartas.map((id) => objItem(c.g, id, '')), 1, 1);
    yield* assimilar(c, Number(escolhida));
    return;
  }
  // "se não puder": a criatura alvo (escolhida ao pôr na pilha) é exilada e fica ligada a esta Espaçonave
  const id = tgt(c);
  if (id !== null) yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
}

const afinidade = (c: SCtx) => ({ reduce: c.g.state.zones.battlefield.filter((id) => artefatoCriatura(c.g, id) && c.g.state.objects[id] && is.yours(c, id)).length });
const ALVO = [upTo(1, t.creature(undefined, 'até uma criatura alvo'))];
const TEXTO = 'assimile uma carta de criatura exilada com ela. Se não puder, exile até uma criatura alvo.';

export default defineCard({
  name: 'Borg Cube',
  faces: [{
    selfCost: afinidade,
    abilities: [
      triggered(on.selfEnters(), aoEntrarOuAtacar, { targets: ALVO, text: `Sempre que esta Espaçonave entra, ${TEXTO}` }),
      triggered(on.selfAttacks(), aoEntrarOuAtacar, { targets: ALVO, text: `Sempre que esta Espaçonave ataca, ${TEXTO}` }),
      estacao(),
      nivelDeEstacao(12, { criatura: true }, '12+ | É uma criatura-artefato.'),
      anthem(and(is.creature, is.artifact, is.yours, (c) => cargas(c.g, c.source) >= 12), () => [{ k: 'addKeyword', kw: 'flying' }], '12+ | As criaturas-artefato que você controla têm voar.'),
    ],
  }],
  rulings: {},
});
