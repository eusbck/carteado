// Modo manual: ajustes feitos por quem tem prioridade, para aplicar à mão o efeito de cartas
// ainda sem definição (cartas pendentes). Cada ajuste é uma resposta de prioridade, então
// fica nas entradas da partida (reprodutível) e no log, visível a todos.
// Os ajustes passam pelas ações normais do motor: substituições e gatilhos acontecem como se
// o efeito tivesse sido aplicado por uma carta.

import { addCounters, createTokens, draw, gainLife, loseLife, mill, moveObjects, putOntoBattlefield, removeCounters, searchLibrary, shuffleLibrary, tap, untap, lookAndArrange } from './actions.ts';
import { controllerOf, nameOf } from './chars.ts';
import { registry, type Gen } from './defs.ts';
import type { G } from './game-context.ts';
import { poolToString } from './mana.ts';
import type { GameState, ManaUnit, ManualAction, ObjId, PlayerId, ZoneName } from './types.ts';
import { jog, obj, reg } from './registro.ts';

// "de onde" e "para onde", com a contração certa
const DE: Record<string, string> = {
  battlefield: 'do campo', hand: 'da mão', graveyard: 'do cemitério', exile: 'do exílio', library: 'do grimório', command: 'da zona de comando',
};
const PARA: Record<string, string> = {
  battlefield: 'o campo', hand: 'a mão', graveyard: 'o cemitério', exile: 'o exílio', libraryTop: 'o topo do grimório', libraryBottom: 'o fundo do grimório',
};
const inteiro = (n: unknown, min: number, max: number) => typeof n === 'number' && Number.isInteger(n) && n >= min && n <= max;

/**
 * Desvirar à mão desfaz o virar para mana só com a mana daquele virar inteira na reserva (GameState.config
 * desvirarSoComMana): se parte dela já pagou alguma coisa, desvirar e virar de novo daria mana de graça. Quem não foi
 * virada para mana (atacou, pagou outro custo, virou à mão) desvira livre.
 */
export function manaDesfazivel(s: GameState, id: ObjId): boolean {
  const o = s.objects[id];
  if (!o?.tapped || !o.manaTap) return true;
  const { seq, n } = o.manaTap;
  return s.players.reduce((k, p) => k + p.manaPool.filter((u) => (u.tapSource ?? u.source) === id && u.tap === seq).length, 0) >= n;
}

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
    case 'virar': {
      if (s.objects[m.obj]?.zone !== 'battlefield' || typeof m.tapped !== 'boolean') return 'Só permanentes podem ser virados';
      if (!m.tapped && s.config.desvirarSoComMana && !manaDesfazivel(s, m.obj)) return 'A mana dessa permanente já foi gasta: para voltar atrás, use Desfazer';
      return null;
    }
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
  // toda linha começa com `${jog(p)} (ajuste manual)`; o kind 'manual' marca a linha (antes o cliente procurava o texto)
  const ajuste = reg(g, 'manual');
  switch (m.k) {
    case 'mover': {
      const o = s.objects[m.obj];
      const oculto = o.zone === 'hand' || o.zone === 'library';
      ajuste`${jog(p)} (ajuste manual) move ${oculto && m.to !== 'battlefield' && m.to !== 'graveyard' && m.to !== 'exile' ? 'uma carta' : obj(m.obj)} ${DE[o.zone]} para ${PARA[m.to]}.`;
      yield* mover(g, p, [m.obj], m.to);
      return true;
    }
    case 'vida': {
      ajuste`${jog(p)} (ajuste manual): ${jog(m.player, 'alvo')} ${m.delta > 0 ? 'ganha' : 'perde'} ${Math.abs(m.delta)} de vida.`;
      if (m.delta > 0) gainLife(g, m.player, m.delta, null); else loseLife(g, m.player, -m.delta, null);
      return true;
    }
    case 'marcadores': {
      const alvo = m.target.kind === 'player' ? jog(m.target.id, 'alvo') : obj(m.target.id, 'alvo');
      ajuste`${jog(p)} (ajuste manual): ${m.delta > 0 ? 'coloca' : 'remove'} ${Math.abs(m.delta)} marcador(es) ${m.kind} ${m.delta > 0 ? 'em' : 'de'} ${alvo}.`;
      if (m.delta > 0) addCounters(g, m.target, m.kind, m.delta, p); else removeCounters(g, m.target, m.kind, -m.delta);
      return true;
    }
    case 'virar': {
      const nome = obj(m.obj);
      if (m.tapped) { ajuste`${jog(p)} (ajuste manual) vira ${nome}.`; tap(g, m.obj); return true; }
      // desvirar à mão desfaz o virar para mana. Com config.desvirarSoComMana (partidas novas) só vale com a mana
      // daquele virar inteira na reserva (validateManual) e ela sai toda. Antes (só desvirarTiraMana) saía a que ainda
      // estava lá, e a gasta ficava gasta: desvirar e virar de novo dava mana de graça. Partidas de antes de cada
      // regra reproduzem como foram jogadas
      const dono = controllerOf(g, m.obj);
      const ctl = s.players[dono];
      if (s.config.desvirarSoComMana) {
        // a regra nova: sai exatamente a mana daquele virar (conferida inteira na reserva pela validação), de quem quer
        // que seja a reserva e quem quer que desvire
        const virar = s.objects[m.obj].manaTap?.seq;
        if (!untap(g, m.obj)) { ajuste`${jog(p)} (ajuste manual) tenta desvirar ${nome}, mas ela não desvira.`; return true; }
        const daquele = (u: ManaUnit) => virar !== undefined && (u.tapSource ?? u.source) === m.obj && u.tap === virar;
        const dela = s.players.flatMap((q) => q.manaPool.filter(daquele));
        if (dela.length) { for (const q of s.players) q.manaPool = q.manaPool.filter((u) => !daquele(u)); g.bump(); }
        ajuste`${jog(p)} (ajuste manual) desvira ${nome}${dela.length ? ` (a mana dela, ${poolToString(dela)}, sai da reserva)` : ''}.`;
        return true;
      }
      const desvirou = untap(g, m.obj);
      const dela = desvirou && dono === p && s.config.desvirarTiraMana ? ctl.manaPool.filter((u) => (u.tapSource ?? u.source) === m.obj) : [];
      if (dela.length) { ctl.manaPool = ctl.manaPool.filter((u) => (u.tapSource ?? u.source) !== m.obj); g.bump(); }
      ajuste`${jog(p)} (ajuste manual) desvira ${nome}${dela.length ? ` (a mana dela, ${poolToString(dela)}, sai da reserva)` : ''}.`;
      return true;
    }
    case 'ficha': {
      ajuste`${jog(p)} (ajuste manual): ${jog(m.player)} cria ${m.n} ficha(s) ${registry.tokens.get(m.def)!.name}.`;
      yield* createTokens(g, m.player, m.def, m.n);
      return true;
    }
    case 'comprar': ajuste`${jog(p)} (ajuste manual) compra ${m.n} carta(s).`; yield* draw(g, p, m.n); return true;
    case 'moer': ajuste`${jog(p)} (ajuste manual) moi ${m.n} carta(s).`; yield* mill(g, p, m.n); return true;
    case 'embaralhar': ajuste`${jog(p)} (ajuste manual) embaralha o grimório.`; shuffleLibrary(g, p); return true;
    case 'buscar': {
      ajuste`${jog(p)} (ajuste manual) procura no grimório.`;
      const achadas = yield* searchLibrary(g, p, p, { max: 1, prompt: `Procure uma carta (ela vai para ${PARA[m.to]})` });
      if (achadas.length) {
        if (m.to !== 'hand' && m.to !== 'libraryTop') ajuste`${jog(p)} (ajuste manual): ${obj(achadas[0])} vai para ${PARA[m.to]}.`;
        yield* mover(g, p, achadas, m.to);
      }
      if (m.to !== 'libraryTop') shuffleLibrary(g, p);
      return true;
    }
    case 'videncia': ajuste`${jog(p)} (ajuste manual): vidência ${m.n}.`; yield* lookAndArrange(g, p, m.n, 'scry'); return true;
    case 'vigiar': ajuste`${jog(p)} (ajuste manual): vigiar ${m.n}.`; yield* lookAndArrange(g, p, m.n, 'surveil'); return true;
  }
}
