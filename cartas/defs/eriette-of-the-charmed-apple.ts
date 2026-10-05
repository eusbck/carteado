// Eriette of the Charmed Apple
// Each creature that's enchanted by an Aura you control can't attack you or planeswalkers you control.
// At the beginning of your end step, each opponent loses X life and you gain X life, where X is the number of Auras you
// control.
import { controlledBy, controllerOf, defineCard, gainLife, isSubtype, isType, loseLife, on, staticAbility, triggered, type G } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

function encantadaPorAuraMinha(g: G, eu: PlayerId, criatura: ObjId): boolean {
  return g.state.zones.battlefield.some((id) => g.state.objects[id].attachedTo === criatura && isSubtype(g, id, 'Aura') && controllerOf(g, id) === eu);
}

export default defineCard({
  name: 'Eriette of the Charmed Apple',
  faces: [{
    abilities: [
      staticAbility({
        rules: {
          canAttack: (c, atacante, alvo) => !(encantadaPorAuraMinha(c.g, c.you, atacante) && (
            (alvo.kind === 'player' && alvo.id === c.you) || (alvo.kind === 'obj' && isType(c.g, alvo.id, 'Planeswalker') && controllerOf(c.g, alvo.id) === c.you))),
        },
        text: 'Cada criatura encantada por uma Aura que você controla não pode atacar você nem planeswalkers que você controla.',
      }),
      triggered(on.endStep('you'), function* (c) {
        // ruling 2: X na resolução
        const x = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Aura')).length;
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, x, c.source);
        gainLife(c.g, c.you, x, c.source);
      }, { text: 'No início da sua etapa final, cada oponente perde X de vida e você ganha X de vida, onde X é o número de Auras que você controla.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: quem cria a ficha de Papel a controla (não há Papéis nos decks)',
    2: 'teste: X conta as Auras na resolução',
  },
});
