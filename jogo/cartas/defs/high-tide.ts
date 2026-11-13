// High Tide
// Until end of turn, whenever a player taps an Island for mana, that player adds an additional {U}.
import { addMana, defineAbility, defineCard, delayed, isSubtype, ruleEffect, type StaticDef, type TriggeredDef } from '../../motor/api.ts';

// habilidade de mana desencadeada atrasada (CR 603.7, 605.1b): não usa a pilha; ruling 1, qualquer terreno com o tipo
// Island; ruling 2, vale também para as Islands que entrarem depois
const MANA_A_MAIS = defineAbility<TriggeredDef>('High Tide:mana', {
  kind: 'triggered', mana: true,
  on: { kind: 'event', match: (e, c) => (e.type === 'mana' && !!e.tappedForMana && !!c.g.state.objects[e.source] && isSubtype(c.g, e.source, 'Island') ? { quem: e.player } : false) },
  *effect(c) { addMana(c.g, c.event.quem as number, ['U'], { source: c.source }); },
  text: 'Até o fim do turno, sempre que um jogador vira uma Island para gerar mana, esse jogador adiciona {U} a mais.',
});

// avisa o pagamento automático da mana a mais (uma por High Tide resolvida)
const PLANEJAMENTO = defineAbility<StaticDef>('High Tide:planejamento', {
  kind: 'static',
  rules: { extraManaForPlanning: (c, _jogador, fonte, _produzida, virou) => (virou && isSubtype(c.g, fonte, 'Island') ? ['U'] : []) },
});

export default defineCard({
  name: 'High Tide',
  faces: [{
    spell: {
      *effect(c) {
        delayed(c, MANA_A_MAIS.id!, { once: false, expiresTurn: c.g.state.turn.number });
        ruleEffect(c, PLANEJAMENTO.id!, { kind: 'endOfTurn' });
      },
    },
  }],
  rulings: {
    1: 'teste: vale para qualquer terreno com o tipo Island, de qualquer jogador',
    2: 'teste: vale para a Island que entra depois de a High Tide resolver',
  },
});
