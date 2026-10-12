// Canoptek Scarab Swarm
// Flying
// Feeder Mandibles — When this creature enters, exile target player's graveyard. For each artifact or land card exiled
// this way, create a 1/1 colorless Insect artifact creature token with flying.
import { chars, createTokens, defineCard, etb, exile, keyword, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Canoptek Scarab Swarm',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        const cartas = [...c.g.state.zones.graveyard[p]];
        // ruling 1: a carta que é artefato e terreno conta uma vez só
        const contam = new Set(cartas.filter((id) => chars(c.g, id).types.some((x) => x === 'Artifact' || x === 'Land')));
        const res = yield* exile(c.g, cartas);
        const n = cartas.filter((id, i) => contam.has(id) && res[i] !== null && res[i] !== undefined && c.g.state.objects[res[i]!]?.zone === 'exile').length;
        if (n > 0) yield* createTokens(c.g, c.you, 'Insect artefato', n);
      }, { targets: [t.player()], text: 'Feeder Mandibles — Quando esta criatura entra, exile o cemitério do jogador alvo. Para cada carta de artefato ou de terreno exilada assim, crie uma ficha de criatura artefato Insect 1/1 incolor com voar.' }),
    ],
  }],
  rulings: { 1: 'teste: exila o cemitério do jogador alvo e cria um Insect para cada carta de artefato ou de terreno exilada' },
});