// Screams from Within
// Enchant creature
// Enchanted creature gets -1/-1.
// When enchanted creature dies, return this card from your graveyard to the battlefield.
import { attachedGets, defineCard, on, putOntoBattlefield, t, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Screams from Within',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      attachedGets(() => [{ k: 'pt', p: -1, t: -1 }], 'A criatura encantada recebe -1/-1.'),
      triggered(on.dies((c, _l, o) => c.obj.attachedTo === o.id), function* (c) {
        const carta = c.g.state.lki[c.source]?.newId ?? null;
        if (carta === null) return;
        const o = c.g.state.objects[carta];
        // ruling 1: só procura no cemitério do controlador (se outro jogador a controlava, nada acontece)
        if (o?.zone !== 'graveyard' || o.owner !== c.you) return;
        // ruling 2: escolhe o que encantar ao entrar (CR 303.4f); sem opção, fica no cemitério (303.4g)
        yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you }], 'effect');
      }, { text: 'Quando a criatura encantada morre, devolva esta carta do seu cemitério ao campo.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 400.3 — a carta vai para o cemitério do dono; o gatilho só procura no do controlador',
    2: 'teste: volta e escolhe outra criatura para encantar',
  },
});
