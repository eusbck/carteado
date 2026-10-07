// Thread de pensar dos bots (fase 9, item 4.3): roda bots/pensar.ts fora da linha principal do servidor.
// Guarda, por sala, o checkpoint da última decisão de prioridade que refez, para refazer pouco na próxima tarefa.

import { parentPort } from 'node:worker_threads';
import '../cartas/index.ts';
import decksJson from '../gerado/decks.json' with { type: 'json' };
import type { Checkpoint } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';
import { pensar } from '../bots/pensar.ts';
import type { MsgPensar, RespPensar } from './pensadores.ts';

const DECKS = new Map((decksJson as DeckList[]).map((d) => [d.id, d]));
const cache = new Map<string, { geracao: number; cp: Checkpoint }>();

parentPort!.on('message', (m: MsgPensar) => {
  if (m.t === 'esquecer') { cache.delete(m.sala); return; }
  const responder = (r: RespPensar) => parentPort!.postMessage(r);
  try {
    let cp: Checkpoint | null = m.base;
    if (!cp && m.desde !== null) {
      const c = cache.get(m.sala);
      if (!c || c.geracao !== m.geracao || c.cp.inputIndex !== m.desde) { responder({ id: m.id, erro: 'sem-base' }); return; }
      cp = c.cp;
    }
    const decks = m.deckIds.map((id) => DECKS.get(id)!);
    const r = pensar({ ...m.tarefa, cp, entradas: m.entradas }, decks);
    if (r.cp) cache.set(m.sala, { geracao: m.geracao, cp: r.cp });
    responder({ id: m.id, resposta: r.resposta, estado: r.estado, cpIndice: r.cp?.inputIndex ?? null, ms: r.ms, memoria: process.memoryUsage().heapUsed });
  } catch (e) {
    responder({ id: m.id, erro: e instanceof Error ? `${e.message}\n${e.stack}` : String(e) });
  }
});
