// Felix Five-Boots
// Menace, ward {2}
// If a creature you control dealing combat damage to a player causes a triggered ability of a permanent you control to
// trigger, that ability triggers an additional time.
import { chars, defineCard, keyword, staticAbility, ward } from '../../motor/api.ts';
import { registry, type TriggerCtx, type TriggeredDef } from '../../motor/defs.ts';
import type { GameEvent } from '../../motor/events.ts';
import type { G } from '../../motor/game-context.ts';
import type { PlayerId } from '../../motor/types.ts';

/** dano de combate a um jogador causado por uma criatura que `p` controla */
function danoDeCombateDeCriatura(g: G, e: GameEvent, p: PlayerId): boolean {
  if (e.type !== 'damage' || !e.combat || e.target.kind !== 'player' || e.controller !== p) return false;
  const c = g.state.objects[e.source] ? chars(g, e.source) : g.state.lki[e.source]?.chars;
  return !!c && c.types.includes('Creature');
}

export default defineCard({
  name: 'Felix Five-Boots',
  faces: [{
    abilities: [
      keyword('menace'),
      ...ward('{2}'),
      staticAbility({
        rules: {
          extraTriggers: (c, tr) => {
            if (tr.controller !== c.you) return 0;
            // só habilidades de permanentes (no campo, ou que acabaram de sair dele)
            const src = c.g.state.objects[tr.source] ?? c.g.state.lki[tr.source]?.obj;
            if (!src || src.zone !== 'battlefield') return 0;
            // gatilho de evento: o evento que o disparou é o dano (ruling 2: não o que resulta dele, como ganhar vida)
            if (tr.cause) return danoDeCombateDeCriatura(c.g, tr.cause, c.you) ? 1 : 0;
            // gatilho de "um ou mais": dispararia sem o dano de combate das suas criaturas?
            const def = registry.abilities.get(tr.abilityId) as TriggeredDef | undefined;
            if (!def || def.on.kind !== 'batch' || !tr.batch) return 0;
            const sem = tr.batch.filter((e) => !danoDeCombateDeCriatura(c.g, e, c.you));
            if (sem.length === tr.batch.length) return 0;
            const sc = c.g.state.objects[tr.source] ? chars(c.g, tr.source) : c.g.state.lki[tr.source]?.chars;
            if (!sc) return 0;
            const ctx: TriggerCtx = { g: c.g, you: tr.controller, source: tr.source, obj: src, chars: sc };
            const r = sem.length ? def.on.match(sem, ctx) : false;
            const lista = Array.isArray(r) ? r : r ? [typeof r === 'object' ? r : {}] : [];
            const este = JSON.stringify(tr.event);
            return lista.some((x) => JSON.stringify(x) === este) ? 0 : 1;
          },
        },
        text: 'Se uma criatura que você controla causar dano de combate a um jogador e isso fizer disparar uma habilidade desencadeada de um permanente que você controla, essa habilidade dispara uma vez a mais.',
      }),
    ],
  }],
  rulings: {
    1: 'não se aplica: explica o que é habilidade desencadeada',
    2: 'teste: um gatilho de ganhar vida pelo vínculo com a vida não dispara a mais',
    3: 'regra geral: CR 614 — substituições não são habilidades desencadeadas; Felix não as repete',
    4: 'teste: cada disparo a mais escolhe os alvos e resolve separado',
    5: 'regra geral: CR 603.2 — cada Felix soma um disparo (motor/triggers.ts extraTriggers)',
  },
});
