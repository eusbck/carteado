// Bot heurístico com busca rasa (fase 5).
//
// - Prioridade: nos momentos que importam (fases principais do próprio turno, etapa final dos oponentes e quando um
//   oponente põe algo na pilha), simula cada jogada candidata numa cópia determinizada da partida até a pilha
//   esvaziar, avalia e escolhe a melhor, se ela for melhor que passar. As escolhas feitas na melhor simulação (alvos,
//   modos, X, pagamento) viram o plano seguido na partida de verdade.
// - Combate: ataca quando a criatura não morre num bloqueio ruim e escolhe o oponente mais fraco; bloqueia para trocar
//   bem ou para não morrer.
// - Outras escolhas (sacrificar, descartar, vidência, mulligan): heurísticas simples sobre o valor das cartas.
// Usa só o que o jogador pode ver: a avaliação olha quantidades, e a simulação sorteia a informação oculta.

import { canBlock } from '../motor/combat.ts';
import { controllerOf, hasKw, isCreature, isLand, manaValue, power, toughness } from '../motor/api.ts';
import { defaultAnswer, type LiveDecision } from '../motor/ask.ts';
import type { Game } from '../motor/game.ts';
import type { G } from '../motor/game-context.ts';
import { int, seedFrom, shuffle, type RngState } from '../motor/rng.ts';
import type { Answer, ChoiceItem, Decision, ObjId, PlayerId, TargetRef } from '../motor/types.ts';
import { avaliar, valorPermanente } from './avaliacao.ts';
import { determinizar, simular } from './simulacao.ts';

export interface OpcoesBot {
  /** simulações por decisão de prioridade (determinístico) */
  simulacoes?: number;
  /** trava de segurança: tempo máximo por decisão de prioridade, em ms */
  orcamento?: number;
  /** simulações por jogada candidata (a primeira usa as heurísticas; as outras, escolhas ao acaso) */
  variantes?: number;
}

type D<K extends Decision['kind']> = Extract<Decision, { kind: K }>;

const PASSAR: Answer = { kind: 'priority', action: 'pass' };

export class HeuristicBot {
  rng: RngState;
  private plano: Answer[] = [];
  private passouEm = new Set<string>();
  private acoes = { turno: -1, n: 0 };
  /** última declaração de ataque (o motor pergunta de novo se o custo de atacar não foi pago) */
  private ataque = { turno: -1, combate: -1 };
  readonly orcamento: number;
  readonly simulacoes: number;
  readonly variantes: number;
  readonly eu: PlayerId;

  constructor(seed: string, eu: PlayerId, opts: OpcoesBot = {}) {
    this.eu = eu;
    this.rng = seedFrom(`heuristico:${seed}`);
    this.orcamento = opts.orcamento ?? 2000;
    this.simulacoes = opts.simulacoes ?? 24;
    this.variantes = opts.variantes ?? 2;
  }

  answer(d: Decision, game: Game): Answer {
    if (d.kind === 'priority') {
      this.plano = [];
      return this.prioridade(d, game);
    }
    // declaração de ataque repetida no mesmo combate: o pagamento falhou; fica só com o obrigatório
    if (d.kind === 'attackers') {
      const s = game.state;
      if (this.ataque.turno === s.turn.number && this.ataque.combate === s.turn.combatCount) return defaultAnswer(d);
      this.ataque = { turno: s.turn.number, combate: s.turn.combatCount };
    }
    // segue o plano da simulação escolhida enquanto ele servir
    if (this.plano.length) {
      const a = this.plano.shift()!;
      if (a.kind === d.kind && game.check(this.eu, a) === null) return a;
      this.plano = [];
    }
    return escolher(d, game, this.eu, this.rng, false);
  }

  // ---------------------------------------------------------------- prioridade
  private momentoDeAgir(game: Game): boolean {
    const s = game.state;
    const topo = s.zones.stack[s.zones.stack.length - 1];
    if (topo !== undefined) return s.objects[topo]?.stack?.controller !== this.eu; // responder a oponentes
    if (s.turn.active === this.eu) return s.turn.step === 'main1' || s.turn.step === 'main2';
    return s.turn.step === 'end'; // mágicas instantâneas no fim do turno do oponente
  }

  private prioridade(d: D<'priority'>, game: Game): Answer {
    const s = game.state;
    const acoes = d.actions.filter((a) => a.kind !== 'pass' && a.kind !== 'mana' && a.kind !== 'manual');
    if (!acoes.length || !this.momentoDeAgir(game)) return PASSAR;
    if (this.acoes.turno !== s.turn.number) this.acoes = { turno: s.turn.number, n: 0 };
    if (this.acoes.n >= 40) return PASSAR; // trava contra laços de habilidades
    const chave = `${s.turn.number}|${s.turn.step}|${s.zones.stack.join(',')}|${s.zones.hand[this.eu].length}|${acoes.map((a) => a.id).join(',')}`;
    if (this.passouEm.has(chave)) return PASSAR;

    const inicio = performance.now();
    // base: passar. Com a pilha vazia, o estado atual; com algo na pilha, a pilha resolvendo sem resposta
    let base = avaliar(game.g, this.eu);
    if (s.zones.stack.length) {
      const r = simular(determinizar(game, this.eu, this.rng), this.eu, PASSAR, this.minha(false), outros);
      if (Number.isFinite(r.valor)) base = r.valor;
    }
    const candidatas = ordenar(acoes, game);
    let melhor: { valor: number; acao: string | null; plano: Answer[] } = { valor: base + 0.5, acao: null, plano: [] };
    let feitas = 0;
    // primeiro uma simulação por jogada (com as heurísticas); depois variantes, enquanto houver orçamento
    for (let v = 0; v < this.variantes; v++) {
      for (const a of candidatas) {
        if (v > 0 && a.kind === 'play') continue;
        if (feitas >= this.simulacoes || performance.now() - inicio > this.orcamento) break;
        feitas++;
        const f = determinizar(game, this.eu, this.rng);
        const r = simular(f, this.eu, { kind: 'priority', action: a.id }, this.minha(v > 0), outros);
        // jogar terreno não precisa vencer a margem das outras jogadas
        const valor = a.kind === 'play' ? r.valor + 0.6 : r.valor;
        if (valor > melhor.valor) melhor = { valor, acao: a.id, plano: r.plano };
      }
    }
    if (!melhor.acao) {
      this.passouEm.add(chave);
      return PASSAR;
    }
    this.plano = melhor.plano;
    this.acoes.n++;
    return { kind: 'priority', action: melhor.acao };
  }

  /** política para as minhas escolhas dentro da simulação */
  private minha(aleatorio: boolean) {
    return (d: Decision, f: Game): Answer => escolher(d, f, this.eu, this.rng, aleatorio);
  }
}

/** ordem de tentativa: terrenos, comandante, mágicas mais caras, habilidades */
function ordenar(acoes: D<'priority'>['actions'], game: Game) {
  const g = game.g;
  const peso = (a: D<'priority'>['actions'][number]): number => {
    if (a.kind === 'play') return 100;
    if (a.kind === 'cast' && a.id.endsWith(':command')) return 90;
    if (a.kind === 'cast' && a.obj !== undefined && g.state.objects[a.obj]) return 50 + manaValue(g, a.obj);
    return 10;
  };
  return [...acoes].sort((a, b) => peso(b) - peso(a)).slice(0, 14);
}

/** política dos outros jogadores dentro da simulação: passa e responde o mais simples possível */
function outros(d: Decision, f: Game): Answer {
  switch (d.kind) {
    case 'priority': return PASSAR;
    case 'payment': return d.canAuto ? { kind: 'payment', auto: true } : d.canCancel ? { kind: 'payment', cancel: true } : { kind: 'payment', auto: true };
    case 'select': return escolher(d, f, d.player, seedFrom(`o:${d.id}`), false);
    default: return defaultAnswer(d);
  }
}

// ---------------------------------------------------------------- escolhas heurísticas

/** resposta heurística para qualquer decisão que não seja de prioridade */
export function escolher(d: Decision, game: Game, eu: PlayerId, rng: RngState, aleatorio: boolean): Answer {
  const live = d as LiveDecision;
  const ok = (a: Answer) => (!live.validate || live.validate(a) === null);
  switch (d.kind) {
    case 'priority': return PASSAR;
    case 'payment':
      if (d.canAuto) return { kind: 'payment', auto: true };
      if (d.canCancel) return { kind: 'payment', cancel: true };
      return { kind: 'payment', auto: true };
    case 'select': return selecionar(d, game, eu, rng, aleatorio, ok);
    case 'number': {
      if (aleatorio) return { kind: 'number', value: d.min + int(rng, d.max - d.min + 1) };
      if (/vida/i.test(d.prompt)) return { kind: 'number', value: Math.max(d.min, Math.min(d.max, Math.floor(game.state.players[eu].life / 5))) };
      return { kind: 'number', value: d.max };
    }
    case 'attackers': return atacar(d, game, eu, ok);
    case 'blockers': return bloquear(d, game, eu, ok);
    case 'damage': {
      const assign = d.recipients.map(() => 0);
      let resto = d.amount;
      for (let i = 0; i < d.recipients.length && resto > 0; i++) {
        const n = i === d.recipients.length - 1 ? resto : Math.min(resto, d.lethal[i] || 1);
        assign[i] = n;
        resto -= n;
      }
      assign[assign.length - 1] += resto;
      return { kind: 'damage', assign };
    }
    case 'arrange': return arrumar(d, game, eu);
    case 'mulligan': {
      const g = game.g;
      const mao = game.state.zones.hand[eu];
      const terrenos = mao.filter((id) => isLand(g, id)).length;
      return { kind: 'mulligan', keep: d.mulligans >= 2 || (terrenos >= 2 && terrenos <= 5) };
    }
  }
}

const PERDA = /sacrifi|descart|remova|pague|perca|perde|exile .*(seu|sua)|para o cemitério|vai para o cemitério/i;
const DANO = /destru|exil|dano|-1\/-1|vire|goad|sacrifica|perde .*vida|veneno|anule|oponente/i;
const BOM = /compra|ganha|cria|devolv|volta|copi|marcador \+1|recebe|ficam|fica|preparad|encantar|campo/i;

/** valor de um item de escolha do ponto de vista de `eu` (positivo = coisa minha valiosa) */
function valorItem(g: G, it: ChoiceItem, eu: PlayerId): { valor: number; meu: boolean } {
  const s = g.state;
  if (it.player !== undefined) return { valor: s.players[it.player].life, meu: it.player === eu };
  const id = it.obj ?? (Number.isFinite(Number(it.id)) ? Number(it.id) : undefined);
  const o = id !== undefined ? s.objects[id] : undefined;
  if (!o || id === undefined) return { valor: 0, meu: false };
  if (o.zone === 'battlefield') return { valor: isLand(g, id) && !isCreature(g, id) ? 2 : valorPermanente(g, id), meu: controllerOf(g, id) === eu };
  // carta fora do campo: custo como medida (terrenos valem pouco)
  return { valor: isLand(g, id) ? 1 : 1 + manaValue(g, id), meu: o.owner === eu };
}

function selecionar(d: D<'select'>, game: Game, eu: PlayerId, rng: RngState, aleatorio: boolean, ok: (a: Answer) => boolean): Answer {
  const itens = d.items.filter((i) => !i.disabled);
  const max = Math.min(d.max, itens.length);
  const tenta = (ids: string[]): Answer | null => { const a: Answer = { kind: 'select', ids }; return ok(a) ? a : null; };
  if (aleatorio) {
    for (let i = 0; i < 30; i++) {
      const n = d.min + int(rng, Math.max(1, max - d.min + 1));
      const a = tenta(shuffle(rng, itens.map((it) => it.id)).slice(0, Math.min(n, max)));
      if (a) return a;
    }
    return { kind: 'select', ids: itens.slice(0, d.min).map((it) => it.id) };
  }
  if (d.ordered) return { kind: 'select', ids: itens.slice(0, Math.max(d.min, Math.min(max, itens.length))).map((it) => it.id) };
  // sim ou não: aceita, a não ser que seja pagar algo sem ganhar nada claro
  const sim = itens.find((i) => i.id === 'yes');
  const nao = itens.find((i) => i.id === 'no');
  if (sim && nao && itens.length === 2) return { kind: 'select', ids: [sim.id] };
  if (max === 0) return { kind: 'select', ids: [] };

  const g = game.g;
  const perda = PERDA.test(d.prompt);
  const dano = !perda && DANO.test(d.prompt) && !BOM.test(d.prompt);
  const avaliados = itens.map((it) => ({ it, ...valorItem(g, it, eu) }));
  let ordem: typeof avaliados;
  if (perda) {
    // custo ou perda: as coisas menos valiosas, de preferência minhas que não fazem falta
    ordem = avaliados.sort((a, b) => a.valor - b.valor);
  } else if (dano) {
    // efeito ruim: nas coisas mais valiosas dos oponentes (jogadores: o de menos vida)
    ordem = avaliados.sort((a, b) => {
      if (a.meu !== b.meu) return a.meu ? 1 : -1;
      if (a.it.player !== undefined && b.it.player !== undefined) return a.valor - b.valor;
      return b.valor - a.valor;
    });
  } else {
    // efeito bom: nas minhas coisas mais valiosas
    ordem = avaliados.sort((a, b) => {
      if (a.meu !== b.meu) return a.meu ? -1 : 1;
      return b.valor - a.valor;
    });
  }
  const ids = ordem.map((x) => x.it.id);
  const quantos = perda ? d.min : max;
  for (let n = quantos; perda ? n <= max : n >= d.min; perda ? n++ : n--) {
    const a = tenta(ids.slice(0, n));
    if (a) return a;
  }
  for (let i = 0; i < 30; i++) {
    const n = d.min + int(rng, Math.max(1, max - d.min + 1));
    const a = tenta(shuffle(rng, [...ids]).slice(0, Math.min(n, max)));
    if (a) return a;
  }
  return { kind: 'select', ids: itens.slice(0, d.min).map((it) => it.id) };
}

// ---------------------------------------------------------------- combate

function mata(g: G, de: ObjId, em: ObjId): boolean {
  const p = power(g, de);
  if (p <= 0) return false;
  if (hasKw(g, em, 'indestructible')) return false;
  return hasKw(g, de, 'deathtouch') || p >= toughness(g, em) - (g.state.objects[em].damage ?? 0);
}

function atacar(d: D<'attackers'>, game: Game, eu: PlayerId, ok: (a: Answer) => boolean): Answer {
  const g = game.g;
  const s = game.state;
  const vida = (t: TargetRef) => (t.kind === 'player' ? s.players[t.id].life : s.objects[t.id]?.counters.loyalty ?? 0);
  const dono = (t: TargetRef) => (t.kind === 'player' ? t.id : controllerOf(g, t.id));
  const ataques: [ObjId, TargetRef][] = [];
  // ameaça de cada oponente: mesa + vida; quem me atacou no último turno dele pesa mais (retaliação)
  const ameaca = new Map<PlayerId, number>();
  for (const p of s.players) {
    if (p.id === eu || p.left || p.lost) continue;
    const mesa = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && controllerOf(g, id) === p.id && !isLand(g, id)).reduce((t, id) => t + valorPermanente(g, id), 0);
    const atacouMe = (s.lastTurnAttackedPlayers[p.id] ?? []).includes(eu) ? 15 : 0;
    ameaca.set(p.id, mesa + 0.3 * p.life + atacouMe);
  }
  // com pouca vida, segura uma parte das criaturas para bloquear
  const minhaVida = s.players[eu].life;
  let reserva = minhaVida <= 10 ? Math.ceil(d.candidates.length / 2) : 0;
  const ordem = [...d.candidates].sort((a, b) => power(g, b.obj) - power(g, a.obj));
  for (const c of ordem) {
    if (c.required?.length) {
      ataques.push([c.obj, [...c.required].sort((a, b) => vida(a) - vida(b))[0]]);
      continue;
    }
    const a = c.obj;
    if (power(g, a) <= 0) continue;
    const vigilante = hasKw(g, a, 'vigilance');
    if (!vigilante && reserva > 0) { reserva--; continue; }
    let melhor: { t: TargetRef; nota: number } | null = null;
    for (const [i, t] of c.targets.entries()) {
      // atacar com custo (Ghostly Prison e afins): não vale a pena para o bot
      if ((c.costs?.[i] ?? 0) > 0) continue;
      const def = dono(t);
      const bloqueadores = s.zones.battlefield.filter((b) => !s.objects[b].tapped && !s.objects[b].phasedOut && controllerOf(g, b) === def && isCreature(g, b) && canBlock(g, b, a));
      const primeiro = hasKw(g, a, 'first strike') || hasKw(g, a, 'double strike');
      const seguro = bloqueadores.every((b) => {
        if (!mata(g, b, a)) return true;
        if (primeiro && mata(g, a, b) && !hasKw(g, b, 'first strike')) return true;
        return mata(g, a, b) && valorPermanente(g, b) >= 0.8 * valorPermanente(g, a);
      });
      if (!seguro) continue;
      const v = vida(t);
      let nota = (ameaca.get(def) ?? 0) + (bloqueadores.length === 0 ? 5 : 0);
      if (v > 0 && v <= power(g, a)) nota += 60; // ataque que elimina (jogador ou planeswalker)
      if (t.kind === 'obj') nota -= 10;
      if (!melhor || nota > melhor.nota) melhor = { t, nota };
    }
    if (melhor) ataques.push([a, melhor.t]);
  }
  const resp: Answer = { kind: 'attackers', attacks: ataques };
  if (ok(resp)) return resp;
  return defaultAnswer(d);
}

function bloquear(d: D<'blockers'>, game: Game, eu: PlayerId, ok: (a: Answer) => boolean): Answer {
  const g = game.g;
  const s = game.state;
  const vida = s.players[eu].life;
  const atacantes = [...d.attackers].filter((a) => s.objects[a]).sort((a, b) => power(g, b) - power(g, a));
  const usados = new Set<ObjId>();
  const blocks: [ObjId, ObjId][] = [];
  const podem = (a: ObjId) => d.candidates.filter((c) => c.canBlock.includes(a) && !usados.has(c.obj)).map((c) => c.obj);
  const bloqueado = new Set<ObjId>();
  // bloqueios bons: mata e sobrevive; trocas favoráveis
  for (const a of atacantes) {
    const cands = podem(a).sort((x, y) => valorPermanente(g, x) - valorPermanente(g, y));
    const bom = cands.find((b) => mata(g, b, a) && !mata(g, a, b));
    const troca = cands.find((b) => mata(g, b, a) && valorPermanente(g, b) < valorPermanente(g, a));
    const b = bom ?? troca;
    if (b !== undefined) { blocks.push([b, a]); usados.add(b); bloqueado.add(a); }
  }
  // não morrer: bloqueia os maiores com as criaturas menos valiosas
  let entrando = atacantes.filter((a) => !bloqueado.has(a)).reduce((t, a) => t + Math.max(0, power(g, a)), 0);
  for (const a of atacantes) {
    if (entrando < vida) break;
    if (bloqueado.has(a)) continue;
    const cands = podem(a).sort((x, y) => valorPermanente(g, x) - valorPermanente(g, y));
    if (!cands.length) continue;
    blocks.push([cands[0], a]);
    usados.add(cands[0]);
    bloqueado.add(a);
    if (!hasKw(g, a, 'trample')) entrando -= Math.max(0, power(g, a));
  }
  // bloqueios inválidos (ameaça etc.): tira um de cada vez
  while (blocks.length) {
    const a: Answer = { kind: 'blockers', blocks: [...blocks] };
    if (ok(a)) return a;
    blocks.pop();
  }
  return { kind: 'blockers', blocks: [] };
}

// ---------------------------------------------------------------- vidência e afins

function arrumar(d: D<'arrange'>, game: Game, eu: PlayerId): Answer {
  const g = game.g;
  const s = game.state;
  const terrenos = s.zones.battlefield.filter((id) => controllerOf(g, id) === eu && isLand(g, id)).length + s.zones.hand[eu].filter((id) => isLand(g, id)).length;
  const fora = d.destinations.includes('graveyard') ? 'graveyard' : d.destinations.includes('bottom') ? 'bottom' : d.destinations[0];
  const placement: Record<string, 'top' | 'bottom' | 'graveyard'> = {};
  const topo: string[] = [];
  const resto: string[] = [];
  for (const it of d.items) {
    const id = it.obj;
    let quer = true;
    if (id !== undefined && s.objects[id]) {
      if (isLand(g, id)) quer = terrenos < 6;
      else quer = manaValue(g, id) <= terrenos + 2;
    }
    const dest = quer && d.destinations.includes('top') ? 'top' : fora;
    placement[it.id] = dest;
    (dest === 'top' ? topo : resto).push(it.id);
  }
  return { kind: 'arrange', placement, order: [...topo, ...resto] };
}
