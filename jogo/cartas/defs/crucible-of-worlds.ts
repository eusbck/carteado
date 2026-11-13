// Crucible of Worlds
// You may play lands from your graveyard.
import { defineCard, isLand, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Crucible of Worlds',
  faces: [{
    abilities: [
      // CR 305.1-305.2: é a jogada de terreno normal do turno, só de outra zona (rulings 1 e 2)
      staticAbility({
        rules: { mayPlayFrom: (c, p, carta) => (p === c.you && c.g.state.objects[carta]?.zone === 'graveyard' && c.g.state.objects[carta].owner === p && isLand(c.g, carta) ? { key: `crucible:${c.source}`, label: 'Crucible of Worlds', land: true } : null) },
        text: 'Você pode jogar terrenos do seu cemitério.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: o terreno do cemitério usa a jogada de terreno do turno',
    2: 'regra geral: CR 305.1 — só jogar o terreno; habilidades de cartas no cemitério (ciclagem) continuam sem poder ser ativadas',
  },
});
