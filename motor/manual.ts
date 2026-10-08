// Modo manual: ajustes feitos por quem tem prioridade, para aplicar à mão o efeito de cartas
// ainda sem definição (cartas pendentes). Cada ajuste é uma resposta de prioridade, então
// fica nas entradas da partida (reprodutível) e no log, visível a todos.
// Os ajustes passam pelas ações normais do motor: substituições e gatilhos acontecem como se
// o efeito tivesse sido aplicado por uma carta.

import { addCounters, createTokens, draw, gainLife, loseLife, mill, moveObjects, putOntoBattlefield, removeCounters, searchLibrary, shuffleLibrary, tap, untap, lookAndArrange } from './actions.ts';
import { nameOf } from './chars.ts';
import { registry, type Gen } from './defs.ts';
import type { G } from './game-context.ts';
import type { ManualAction, PlayerId, ZoneName } from './types.ts';

// "de onde" e "para onde", com a contração certa
const DE: Record<string, string> = {
  battlefield: 'do campo', hand: 'da mão', graveyard: 'do cemitério', exile: 'do exílio', library: 'do grimório', command: 'da zona de comando',
};
const PARA: Record<string, string> = {
  battlefield: 'o campo', hand: 'a mão', graveyard: 'o cemitério', exile: 'o exílio', libraryTop: 'o topo do grimório', libraryBottom: 'o fundo do grimório',
};
const inteiro = (n: unknown, min: number, max: number) => typeof n === 'number' && Number.isInteger(n) && n >= min && n <= max;

/** confere o ajuste contra o estado atual; devolve o motivo da recusa ou null */
export function validateManual(g: G, p: PlayerId, m: ManualAction | undefined): string | null {
  if (!g.state.config.manualMode) return 'O modo manual está desligado nesta partida';
  if (!m || typeof m !== 'object') return 'Ajuste manual sem conteúdo';
  const s = g.state;
  const vivo = (q: unknown) => typeof q === 'number' && !!s.players[q] && !s.players[q].left;
  switch (m.k) {
    case 'mover': {
      const o = s.objects[m.obj];
      if (!o) return 'Objeto inexistente';
      if (!['battlefield', 'hand', 'graveyard', 'exile', 'libraryTop', 'libraryBottom'].includes(m.to)) return 'Destino inválido';
      if (o.zone === 'stack') return 'Objetos na pilha não podem ser movidos à mão';
      if (registry.emblems.has(o.def)) return 'Emblemas não saem da zona de comando (CR 114.5)';
      // zonas ocultas: só o dono mexe nas próprias cartas (CR 401.2, 402.3)
      if ((o.zone === 'hand' || o.zone === 'library') && o.owner !== p) return 'Essa carta está numa zona oculta de outro jogador';
      if (o.zone === 'exile' && o.faceDown && o.owner !== p) return 'Carta exilada virada para baixo de outro jogador';
      return null;
    }
    case 'vida': return vivo(m.player) && inteiro(m.delta, -100, 100) && m.delta !== 0 ? null : 'Ajuste de vida inválido';
    case 'marcadores': {
      if (!inteiro(m.delta, -20, 20) || m.delta === 0) return 'Quantidade de marcadores inválida';
      if (typeof m.kind !== 'string' || !/^[\p{L}\d+\-/ ]{1,24}$/u.test(m.kind)) return 'Tipo de marcador inválido';
      if (m.target?.kind === 'player') return vivo(m.target.id) ? null : 'Jogador inválido';
      return m.target?.kind === 'obj' && s.objects[m.target.id]?.zone === 'battlefield' ? null : 'Alvo de marcador inválido';
    }
    case 'virar': return s.objects[m.obj]?.zone === 'battlefield' && typeof m.tapped === 'boolean' ? null : 'Só permanentes podem ser virados';
    case 'ficha': return registry.tokens.has(m.def) && inteiro(m.n, 1, 20) && vivo(m.player) ? null : 'Ficha inválida';
    case 'comprar': return inteiro(m.n, 1, 10) ? null : 'Quantidade inválida';
    case 'moer': return inteiro(m.n, 1, 30) ? null : 'Quantidade inválida';
    case 'embaralhar': return null;
    case 'buscar': return ['battlefield', 'hand', 'graveyard', 'exile', 'libraryTop'].includes(m.to) ? null : 'Destino inválido';
    case 'videncia': case 'vigiar': return inteiro(m.n, 1, 10) ? null : 'Quantidade inválida';
    default: return 'Ajuste manual desconhecido';
  }
}

function* mover(g: G, p: PlayerId, ids: number[], to: string): Gen<void> {
  if (to === 'battlefield') { yield* putOntoBattlefield(g, ids.map((id) => ({ id, controller: p })), 'manual'); return; }
  const zone: ZoneName = to === 'libraryTop' || to === 'libraryBottom' ? 'library' : (to as ZoneName);
  yield* moveObjects(g, ids.map((id) => ({ id, to: zone, position: to === 'libraryBottom' ? 'bottom' as const : 'top' as const })), 'manual', p);
}

export function* performManual(g: G, p: PlayerId, m: ManualAction): Gen<boolean> {
  const s = g.state;
  const quem = `${s.players[p].name} (ajuste manual)`;
  switch (m.k) {
    case 'mover': {
      const o = s.objects[m.obj];
      const oculto = o.zone === 'hand' || o.zone === 'library';
      const nome = nameOf(g, m.obj);
      g.log(`${quem} move ${oculto && m.to !== 'battlefield' && m.to !== 'graveyard' && m.to !== 'exile' ? 'uma carta' : nome} ${DE[o.zone]} para ${PARA[m.to]}.`);
      yield* mover(g, p, [m.obj], m.to);
      return true;
    }
    case 'vida': {
      g.log(`${quem}: ${s.players[m.player].name} ${m.delta > 0 ? 'ganha' : 'perde'} ${Math.abs(m.delta)} de vida.`);
      if (m.delta > 0) gainLife(g, m.player, m.delta, null); else loseLife(g, m.player, -m.delta, null);
      return true;
    }
    case 'marcadores': {
      const alvo = m.target.kind === 'player' ? s.players[m.target.id].name : nameOf(g, m.target.id);
      g.log(`${quem}: ${m.delta > 0 ? 'coloca' : 'remove'} ${Math.abs(m.delta)} marcador(es) ${m.kind} ${m.delta > 0 ? 'em' : 'de'} ${alvo}.`);
      if (m.delta > 0) addCounters(g, m.target, m.kind, m.delta, p); else removeCounters(g, m.target, m.kind, -m.delta);
      return true;
    }
    case 'virar': {
      g.log(`${quem} ${m.tapped ? 'vira' : 'desvira'} ${nameOf(g, m.obj)}.`);
      if (m.tapped) tap(g, m.obj); else untap(g, m.obj);
      return true;
    }
    case 'ficha': {
      g.log(`${quem}: ${s.players[m.player].name} cria ${m.n} ficha(s) ${registry.tokens.get(m.def)!.name}.`);
      yield* createTokens(g, m.player, m.def, m.n);
      return true;
    }
    case 'comprar': g.log(`${quem} compra ${m.n} carta(s).`); yield* draw(g, p, m.n); return true;
    case 'moer': g.log(`${quem} moi ${m.n} carta(s).`); yield* mill(g, p, m.n); return true;
    case 'embaralhar': g.log(`${quem} embaralha o grimório.`); shuffleLibrary(g, p); return true;
    case 'buscar': {
      g.log(`${quem} procura no grimório.`);
      const achadas = yield* searchLibrary(g, p, p, { max: 1, prompt: `Procure uma carta (ela vai para ${PARA[m.to]})` });
      if (achadas.length) {
        if (m.to !== 'hand' && m.to !== 'libraryTop') g.log(`${quem}: ${nameOf(g, achadas[0])} vai para ${PARA[m.to]}.`);
        yield* mover(g, p, achadas, m.to);
      }
      if (m.to !== 'libraryTop') shuffleLibrary(g, p);
      return true;
    }
    case 'videncia': g.log(`${quem}: vidência ${m.n}.`); yield* lookAndArrange(g, p, m.n, 'scry'); return true;
    case 'vigiar': g.log(`${quem}: vigiar ${m.n}.`); yield* lookAndArrange(g, p, m.n, 'surveil'); return true;
  }
}
