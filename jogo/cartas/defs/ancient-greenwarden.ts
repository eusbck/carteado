// Ancient Greenwarden
// Reach (This creature can block creatures with flying.)
// You may play lands from your graveyard.
// If a land entering causes a triggered ability of a permanent you control to trigger, that ability triggers an
// additional time.
import { chars, defineCard, isLand, keyword, staticAbility } from '../../motor/api.ts';
import { registry, type TriggerCtx, type TriggeredDef } from '../../motor/defs.ts';
import type { GameEvent } from '../../motor/events.ts';
import type { G } from '../../motor/game-context.ts';

/** um terreno entrando no campo (olha o objeto no campo; se já saiu, a última informação) */
function terrenoEntrando(g: G, e: GameEvent): boolean {
  if (e.type !== 'zone' || e.to !== 'battlefield') return false;
  if (g.state.objects[e.obj]) return isLand(g, e.obj);
  return !!g.state.lki[e.obj]?.chars.types.includes('Land');
}

export default defineCard({
  name: 'Ancient Greenwarden',
  faces: [{
    abilities: [
      keyword('reach'),
      // rulings 1-3: não muda quando nem quantos terrenos você joga; não deixa ativar habilidades (ciclagem) no cemitério
      staticAbility({
        rules: { mayPlayFrom: (c, p, carta) => (p === c.you && c.g.state.objects[carta]?.zone === 'graveyard' && c.g.state.objects[carta].owner === p && isLand(c.g, carta) ? { key: `greenwarden:${c.source}`, label: 'Ancient Greenwarden', land: true } : null) },
        text: 'Você pode jogar terrenos do seu cemitério.',
      }),
      staticAbility({
        rules: {
          // CR 603.2d; ruling 6: a habilidade dispara de novo (não é cópia); ruling 10: cada Greenwarden soma uma
          extraTriggers: (c, tr) => {
            if (tr.controller !== c.you) return 0;
            // só habilidades de permanentes (no campo, ou que acabaram de sair dele)
            const src = c.g.state.objects[tr.source] ?? c.g.state.lki[tr.source]?.obj;
            if (!src || src.zone !== 'battlefield') return 0;
            // rulings 4 e 7: qualquer gatilho de "entra" (o do próprio terreno, aterragem, "uma criatura entra"…)
            if (tr.cause) return terrenoEntrando(c.g, tr.cause) ? 1 : 0;
            // gatilho de "um ou mais": dispararia sem os terrenos entrando?
            const def = registry.abilities.get(tr.abilityId) as TriggeredDef | undefined;
            if (!def || def.on.kind !== 'batch' || !tr.batch) return 0;
            const sem = tr.batch.filter((e) => !terrenoEntrando(c.g, e));
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
        text: 'Se um terreno entrar no campo e isso fizer disparar uma habilidade desencadeada de um permanente que você controla, essa habilidade dispara uma vez a mais.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: você joga um terreno do seu cemitério, como a jogada de terreno do turno',
    2: 'regra geral: CR 305.1 — só jogar o terreno; habilidades de cartas no cemitério continuam sem poder ser ativadas',
    3: 'regra geral: CR 712.11 — só a face de terreno de um modal de duas faces pode ser jogada (motor/priority.ts)',
    4: 'teste: com um terreno entrando, a aterragem de outra permanente sua e o gatilho do próprio terreno disparam duas vezes',
    5: 'regra geral: CR 614.12 — substituições de "conforme entra" e "entra com marcadores" não são habilidades desencadeadas',
    6: 'regra geral: CR 603.2d — cada instância é uma habilidade própria na pilha, com escolhas próprias (motor/triggers.ts)',
    7: 'regra geral: CR 603.2d — vale para qualquer gatilho de entrar que o terreno cause, não só os que dizem "terreno"',
    8: 'não se aplica: nenhuma carta dos decks tem gatilho de "sempre que você joga um terreno"',
    9: 'regra geral: CR 603.2d — os gatilhos são vistos com os efeitos contínuos aplicados (motor/triggers.ts)',
    10: 'teste: com duas Ancient Greenwarden, a aterragem dispara três vezes',
    11: 'não se aplica: nenhuma carta dos decks faz a Ancient Greenwarden entrar junto com um terreno',
  },
});
