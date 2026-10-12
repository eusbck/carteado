// Grim Hireling
// Whenever one or more creatures you control deal combat damage to a player, create two Treasure tokens.
// {B}, Sacrifice X Treasures: Target creature gets -X/-X until end of turn. Activate only as a sorcery.
import { activated, controllerOf, createTokens, defineCard, isCreature, isSubtype, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { seusCausamDanoDeCombate } from '../gatos.ts';

const ENFRAQUECE = activated('{B}', function* (c) {
  const id = tgt(c);
  if (id !== null && c.x > 0) untilEndOfTurn(c, [id], [{ k: 'pt', p: -c.x, t: -c.x }]);
}, {
  timing: 'sorcery',
  targets: [t.creature()],
  xMax: (c) => c.g.state.zones.battlefield.filter((id) => controllerOf(c.g, id) === c.you && isSubtype(c.g, id, 'Treasure')).length,
  text: '{B}, Sacrifique X Treasures: A criatura alvo recebe -X/-X até o fim do turno. Ative somente como um feitiço.',
});
// o custo "sacrifique X Treasures" é montado à mão
ENFRAQUECE.cost.push({ k: 'sacrifice', n: 'X', label: 'Treasures', filter: (c, id) => isSubtype(c.g, id, 'Treasure') });

export default defineCard({
  name: 'Grim Hireling',
  faces: [{
    abilities: [
      // um gatilho por jogador que tomou dano no mesmo lote
      triggered(seusCausamDanoDeCombate((c, id) => isCreature(c.g, id)), function* (c) { yield* createTokens(c.g, c.you, 'Treasure', 2); }, {
        text: 'Sempre que uma ou mais criaturas que você controla causam dano de combate a um jogador, crie duas fichas Treasure.',
      }),
      ENFRAQUECE,
    ],
  }],
  rulings: {},
});