// Yarok, the Desecrated
// Deathtouch, lifelink
// If a permanent entering causes a triggered ability of a permanent you control to trigger, that ability triggers an
// additional time.
import { chars, defineCard, keywords, staticAbility } from '../../motor/api.ts';
import { registry, type TriggerCtx, type TriggeredDef } from '../../motor/defs.ts';
import type { GameEvent } from '../../motor/events.ts';

/** um permanente entrando no campo (de qualquer jogador: ruling 8) */
const entrando = (e: GameEvent): boolean => e.type === 'zone' && e.to === 'battlefield';

export default defineCard({
  name: 'Yarok, the Desecrated',
  faces: [{
    abilities: [
      ...keywords('deathtouch', 'lifelink'),
      // CR 603.2d, como a Ancient Greenwarden (que faz o mesmo só com terrenos)
      staticAbility({
        rules: {
          extraTriggers: (c, tr) => {
            if (tr.controller !== c.you) return 0;
            // só habilidades de permanentes (no campo, ou que acabaram de sair dele)
            const src = c.g.state.objects[tr.source] ?? c.g.state.lki[tr.source]?.obj;
            if (!src || src.zone !== 'battlefield') return 0;
            // ruling 1: o gatilho de entrar do próprio permanente e os de outros ("sempre que uma criatura entra")
            if (tr.cause) return entrando(tr.cause) ? 1 : 0;
            // gatilho de "um ou mais": dispararia sem os permanentes entrando?
            const def = registry.abilities.get(tr.abilityId) as TriggeredDef | undefined;
            if (!def || def.on.kind !== 'batch' || !tr.batch) return 0;
            const sem = tr.batch.filter((e) => !entrando(e));
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
        text: 'Se um permanente entrar no campo e isso fizer disparar uma habilidade desencadeada de um permanente que você controla, essa habilidade dispara uma vez a mais.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: o gatilho de entrar de uma criatura sua dispara duas vezes',
    2: 'regra geral: CR 603.2d — cada instância é uma habilidade própria na pilha, com escolhas próprias (motor/triggers.ts)',
    3: 'teste: um permanente que entra junto com Yarok também dispara a mais',
    4: 'regra geral: CR 614.12 — substituições de "conforme entra" não são habilidades desencadeadas',
    5: 'não se aplica: nenhuma carta dos decks tem gatilho de entrar ligado a outra habilidade ("a carta exilada")',
    6: 'teste: com outro efeito igual (Ancient Greenwarden), o gatilho dispara três vezes',
    7: 'regra geral: CR 614.12 — "entra com marcadores" é substituição, não gatilho',
    8: 'teste: a aterragem dispara a mais; o permanente que entra pode ser de qualquer jogador, basta o gatilho ser seu',
    9: 'não se aplica: nenhuma carta dos decks tem gatilho de entrar ligado a outra habilidade ("a carta exilada")',
  },
});
