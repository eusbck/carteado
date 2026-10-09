// Bots com níveis de dificuldade (fase 9; o bot heurístico da fase 5 é o nível Intermediário).
//
// Todo bot decide no próprio mundo (bots/mundo.ts): uma cópia da partida em que o que o assento dele não vê foi
// sorteado de novo. Decisões óbvias saem da vista do jogador (motor/view.ts, a mesma que o servidor manda a uma pessoa)
// sem simular nada; as outras, de simulações nessas cópias.
//
// - Prioridade: Iniciante segue regras (terreno, criatura na curva); Fácil e Intermediário simulam cada jogada
//   candidata até a pilha esvaziar e ficam com a melhor (o Fácil, com poucas simulações e às vezes a segunda ou a
//   terceira melhor); Difícil e Cartomante comparam as candidatas nos mesmos mundos sorteados (média), com variações
//   de alvo, oponentes que respondem e o horizonte até o fim do combate quando agem no combate; o Magic God refina as
//   melhores com jogadas até o fim do turno seguinte (bots/busca.ts).
// - Combate: só o óbvio (Iniciante), regras fixas (Fácil, Intermediário) ou opções comparadas em simulação.
// - Outras escolhas: heurísticas sobre o valor das cartas; do Difícil em diante, as opções são simuladas.

import { canBlock, combatDamageAmount } from '../motor/combat.ts';
import { chars, controllerOf, hasKw, isCreature, isLand, manaValue, toughness } from '../motor/api.ts';
import { toxicValue } from '../motor/veneno-emblema.ts';
import { defaultAnswer, validateShape, type LiveDecision } from '../motor/ask.ts';
import type { Game } from '../motor/game.ts';
import type { G } from '../motor/game-context.ts';
import { int, next, seedFrom, shuffle, type RngState } from '../motor/rng.ts';
import type { Answer, ChoiceItem, Decision, ObjId, PlayerId, TargetRef } from '../motor/types.ts';
import { buildView, type GameView } from '../motor/view.ts';
import { avaliar, forcas, valorPermanente, type OpcoesAvaliacao } from './avaliacao.ts';
import { buscar } from './busca.ts';
import { infoDaMemoria, memoriaVazia, observar, type DadosMemoria } from './memoria.ts';
import { Copiador, determinizar, estadoOculto, ramo, Rastro, type InfoOculta } from './mundo.ts';
import { NIVEL_PADRAO, PARAMETROS, type NivelBot, type Parametros } from './niveis.ts';
import { intencao, PERDA, type Intencao } from './intencao.ts';
import { papelDe } from './papeis.ts';
import { simular, type Horizonte, type Politica } from './simulacao.ts';

export interface OpcoesBot {
  nivel?: NivelBot;
  /** teto de simulações por decisão de prioridade (sobrepõe o do nível) */
  simulacoes?: number;
  /** teto de tempo por decisão, em ms (sobrepõe o do nível) */
  orcamento?: number;
  /** variações por jogada candidata (sobrepõe o do nível) */
  variantes?: number;
  /** mundos sorteados por candidata (sobrepõe o do nível) */
  mundos?: number;
  /** jogadas da busca do Magic God (sobrepõe o tempo; os testes usam para ficar determinísticos) */
  jogadasBusca?: number;
}

/** o que o bot guarda entre uma decisão e outra (vai e volta da thread de pensar) */
export interface EstadoBot {
  rng: RngState;
  plano: Answer[];
  passouEm: string[];
  acoes: { turno: number; n: number };
  /** última declaração de ataque (o motor pergunta de novo se o custo de atacar não foi pago) */
  ataque: { turno: number; combate: number };
  /** jogada que o bot tentou e não conseguiu pagar, para não insistir no mesmo passo */
  tentativa: string | null;
  falhas: string[];
  memoria: DadosMemoria | null;
}

type D<K extends Decision['kind']> = Extract<Decision, { kind: K }>;

const PASSAR: Answer = { kind: 'priority', action: 'pass' };

/** a decisão e o mundo do bot (calculado só se precisar) */
export class Contexto {
  readonly d: LiveDecision;
  readonly copia: ((semente: RngState) => Game | null) | null;
  /** performance.now() em que o bot precisa ter respondido */
  readonly prazo: number;
  private fazer: () => G;
  private _g: G | null = null;
  constructor(d: LiveDecision, fazer: () => G, copia: ((semente: RngState) => Game | null) | null, prazo: number) {
    this.d = d;
    this.fazer = fazer;
    this.copia = copia;
    this.prazo = prazo;
  }
  /** o estado do mundo do bot */
  get g(): G { return (this._g ??= this.fazer()); }
  valida(a: Answer): boolean { return validateShape(this.d, a) === null && (!this.d.validate || this.d.validate(a) === null); }
  restante(): number { return this.prazo - performance.now(); }
}

const significativas = (d: D<'priority'>) => d.actions.filter((a) => a.kind !== 'pass' && a.kind !== 'mana' && a.kind !== 'manual');

export class HeuristicBot {
  readonly eu: PlayerId;
  readonly nivel: NivelBot;
  readonly p: Parametros;
  readonly jogadasBusca: number | null;
  e: EstadoBot;
  /** partida jogada neste processo: checkpoint do começo do turno para refazer decisões que não são de prioridade */
  readonly rastro = new Rastro();

  constructor(seed: string, eu: PlayerId, opts: OpcoesBot = {}) {
    this.eu = eu;
    this.nivel = opts.nivel ?? NIVEL_PADRAO;
    const base = PARAMETROS[this.nivel];
    this.p = {
      ...base,
      simulacoes: opts.simulacoes ?? base.simulacoes,
      tempo: opts.orcamento ?? base.tempo,
      variantes: opts.variantes ?? base.variantes,
      mundos: opts.mundos ?? base.mundos,
    };
    this.jogadasBusca = opts.jogadasBusca ?? null;
    this.e = { rng: seedFrom(`heuristico:${seed}`), plano: [], passouEm: [], acoes: { turno: -1, n: 0 }, ataque: { turno: -1, combate: -1 }, tentativa: null, falhas: [], memoria: this.p.memoria ? memoriaVazia() : null };
  }

  get rng(): RngState { return this.e.rng; }

  /** o que a Cartomante sabe além do que está à vista */
  infoOculta(): InfoOculta | undefined {
    return this.e.memoria ? infoDaMemoria(this.e.memoria) : undefined;
  }

  /** lê a mesa (só o que é público); o servidor chama a cada jogada, a partida local a cada decisão do bot */
  observar(g: G): void {
    if (this.e.memoria) observar(this.e.memoria, g, this.eu);
  }

  /** partida jogada neste processo (testes, baterias): monta o mundo e decide */
  answer(d: Decision, game: Game): Answer {
    this.rastro.observar(game);
    this.observar(game.g);
    const live = d as LiveDecision;
    const valida = (a: Answer) => validateShape(d, a) === null && (!live.validate || live.validate(a) === null);
    const r = this.imediata(d, buildView(game.g, this.eu, d), valida);
    if (r) return r;
    return this.decidir(this.contextoLocal(live, game));
  }

  /** contexto numa partida deste processo: cópias por fork (prioridade) ou refazendo a partida (outras decisões) */
  contextoLocal(d: LiveDecision, game: Game): Contexto {
    const info = this.infoOculta();
    const prazo = performance.now() + this.p.tempo;
    const sem = ramo(this.e.rng, 'mundo');
    if (d.kind === 'priority') {
      return new Contexto(d, () => determinizar(game, this.eu, [...sem] as RngState, info).g, (s) => determinizar(game, this.eu, [...s] as RngState, info), prazo);
    }
    const r = this.rastro.refazer(game);
    let cop: Copiador | null = null;
    const copia = r ? (s: RngState) => {
      cop ??= new Copiador(r);
      const f = cop.copia(this.eu, [...s] as RngState, info);
      return f && f.pending?.id === d.id ? f : null;
    } : null;
    return new Contexto(d, () => estadoOculto(game, this.eu, [...sem] as RngState, info), copia, prazo);
  }

  /**
   * Decisões óbvias, só com a vista do jogador (o que uma pessoa naquele assento vê): passar quando não é hora de
   * agir, seguir o plano da jogada escolhida, pagar. Null quando é preciso pensar.
   */
  imediata(d: Decision, v: GameView, valida: (a: Answer) => boolean): Answer | null {
    if (d.kind === 'priority') {
      this.e.plano = [];
      const acoes = significativas(d);
      if (!acoes.length || !this.momentoDeAgir(v)) return PASSAR;
      if (this.e.acoes.turno !== v.turn.number) this.e.acoes = { turno: v.turn.number, n: 0 };
      if (this.e.acoes.n >= 40) return PASSAR; // trava contra laços de habilidades
      if (this.e.passouEm.includes(this.chave(d, v))) return PASSAR;
      // acima de 150 objetos (fichas que se multiplicam a cada mágica), simular fica caro demais: o bot para de agir
      // e deixa o combate decidir a partida
      if (v.battlefield.length > 150) return PASSAR;
      return null;
    }
    if (d.kind === 'mulligan') {
      // a própria mão está na vista: fica com 2 a 5 terrenos (ou depois de duas trocas)
      const terrenos = v.hand.filter((o) => o.types.includes('Land')).length;
      return { kind: 'mulligan', keep: d.mulligans >= 2 || (terrenos >= 2 && terrenos <= 5) };
    }
    if (d.kind === 'attackers' || d.kind === 'blockers' || d.kind === 'select' || d.kind === 'arrange') {
      if (d.kind !== 'attackers' && this.e.plano.length) return this.doPlano(d, valida, publicaNaVista(d, v));
      return null;
    }
    // pagamento, número, dano: o plano, ou a escolha simples
    if (this.e.plano.length) { const a = this.doPlano(d, valida, true); if (a) return a; }
    if (d.kind === 'payment') {
      if (d.canAuto) return { kind: 'payment', auto: true };
      // não dá para pagar: desiste e não tenta a mesma jogada de novo neste passo
      if (this.e.tentativa) { this.e.falhas.push(this.e.tentativa); if (this.e.falhas.length > 60) this.e.falhas.shift(); }
      return d.canCancel ? { kind: 'payment', cancel: true } : { kind: 'payment', auto: true };
    }
    return null;
  }

  /**
   * A próxima resposta do plano (as escolhas da jogada simulada), se serve para esta decisão. As escolhas sobre cartas
   * que só quem decide vê (vidência, vigiar, busca, olhar o topo, cartas compradas no meio da resolução) foram feitas
   * na simulação sobre cartas sorteadas: essas saem do plano e são decididas de novo, sobre as cartas de verdade.
   */
  private doPlano(d: Decision, valida: (a: Answer) => boolean, publica: boolean): Answer | null {
    const a = this.e.plano[0];
    if (!a || a.kind !== d.kind) { this.e.plano = []; return null; }
    this.e.plano.shift();
    if (!publica) return null;
    if (valida(a)) return a;
    this.e.plano = [];
    return null;
  }

  private chave(d: D<'priority'>, v: GameView): string {
    return `${v.turn.number}|${v.turn.step}|${v.stack.map((x) => x.id).join(',')}|${v.hand.length}|${significativas(d).map((a) => a.id).join(',')}`;
  }

  private chance(x: number): boolean {
    return x >= 1 || (x > 0 && next(this.e.rng) < x);
  }

  private momentoDeAgir(v: GameView): boolean {
    const eu = this.eu;
    const topo = v.stack[0];
    if (topo) return topo.controller !== eu && this.chance(this.p.responde); // responder a oponentes
    if (v.turn.active === eu) {
      if (v.turn.step === 'main1' || v.turn.step === 'main2') return true;
      // truque depois dos bloqueios
      return this.p.agirNoCombate && v.turn.step === 'declareBlockers' && !!v.combat?.attackers.length;
    }
    if (v.turn.step === 'end') return this.chance(this.p.responde); // mágicas instantâneas no fim do turno do oponente
    if (this.p.agirNoCombate && (v.turn.step === 'declareAttackers' || v.turn.step === 'declareBlockers')) {
      const contraMim = v.combat?.attackers.some((a) => (a.target.kind === 'player' ? a.target.id === eu : v.battlefield.find((o) => o.id === a.target.id)?.controller === eu));
      return !!contraMim && this.chance(this.p.responde);
    }
    return false;
  }

  // ---------------------------------------------------------------- decisão pensada
  /** a decisão que precisa pensar, no mundo do bot */
  decidir(ctx: Contexto): Answer {
    const d = ctx.d;
    if (d.kind === 'priority') {
      this.e.plano = [];
      this.e.tentativa = null;
      const r = this.prioridade(ctx);
      if (r.kind === 'priority' && r.action !== 'pass') {
        this.e.acoes.n++;
        this.e.tentativa = `${ctx.g.state.turn.number}|${ctx.g.state.turn.step}|${r.action}`;
      }
      return r;
    }
    if (d.kind === 'attackers') {
      const s = ctx.g.state;
      // declaração de ataque repetida no mesmo combate: o pagamento falhou; fica só com o obrigatório
      if (this.e.ataque.turno === s.turn.number && this.e.ataque.combate === s.turn.combatCount) return defaultAnswer(d);
      this.e.ataque = { turno: s.turn.number, combate: s.turn.combatCount };
    }
    // o plano das outras decisões já passou pela resposta imediata (que também tira dele as escolhas escondidas)
    if (d.kind === 'attackers' && this.e.plano.length) {
      const a = this.e.plano.shift()!;
      if (a.kind === d.kind && ctx.valida(a)) return a;
      this.e.plano = [];
    }
    switch (d.kind) {
      case 'attackers':
        if (this.p.combate === 'simulado' && ctx.copia) return this.atacarSimulado(ctx);
        return this.p.combate === 'obvio' ? atacarObvio(d, ctx.g, this.eu, (a) => ctx.valida(a), this.e.rng, this.p.esquece) : atacar(d, ctx.g, this.eu, (a) => ctx.valida(a), this.e.rng, this.p.esquece, this.p.lider);
      case 'blockers':
        if (this.p.combate === 'simulado' && ctx.copia) return this.bloquearSimulado(ctx);
        return this.p.combate === 'obvio' ? bloquearObvio(d, ctx.g, this.eu, (a) => ctx.valida(a), this.e.rng) : bloquear(d, ctx.g, this.eu, (a) => ctx.valida(a));
      case 'select':
        if (this.p.escolhaSimulada && ctx.copia) return this.escolhaSimulada(ctx);
        return escolher(d, ctx.g, this.eu, this.e.rng, false, (a) => ctx.valida(a), this.p.erro);
      default:
        return escolher(d, ctx.g, this.eu, this.e.rng, false, (a) => ctx.valida(a), this.p.erro);
    }
  }

  private avaliacao(): OpcoesAvaliacao {
    return { papeis: this.p.oponenteResponde, lider: this.p.lider };
  }

  /** política para as minhas escolhas dentro da simulação; `variante` > 0 troca a primeira escolha de alvos */
  politicaMinha(variante: number, rng: RngState): Politica {
    let primeira = true;
    return (d: Decision, f: Game): Answer => {
      if (variante > 0 && primeira && d.kind === 'select') {
        primeira = false;
        if (this.p.mundos > 1) {
          const alt = alternativas(d, f.g, this.eu, (a) => (d as LiveDecision).validate?.(a) === null || !(d as LiveDecision).validate);
          if (alt[variante]) return alt[variante];
        }
        return escolher(d, f.g, this.eu, rng, true, okDe(d));
      }
      if (d.kind === 'select') primeira = false;
      return escolher(d, f.g, this.eu, rng, false, okDe(d));
    };
  }

  /** política dos outros jogadores dentro da simulação */
  politicaOutros(rng: RngState, longa = false): Politica {
    const responde = this.p.oponenteResponde;
    const eu = this.eu;
    const lider = this.p.lider;
    return (d: Decision, f: Game): Answer => {
      switch (d.kind) {
        case 'priority':
          if (longa) { const r = politicaRapida(d, f, rng); if (r) return r; }
          if (responde) { const r = resposta(d, f, eu, rng); if (r) return r; }
          return PASSAR;
        case 'payment': return d.canAuto ? { kind: 'payment', auto: true } : d.canCancel ? { kind: 'payment', cancel: true } : { kind: 'payment', auto: true };
        case 'select': return escolher(d, f.g, d.player, rng, false, okDe(d));
        case 'attackers': return longa || this.p.combate === 'simulado' ? atacar(d, f.g, d.player, okDe(d), rng, 0, lider) : defaultAnswer(d);
        case 'blockers': return this.p.combate === 'simulado' || longa ? bloquear(d, f.g, d.player, okDe(d)) : defaultAnswer(d);
        default: return escolher(d, f.g, d.player, rng, false, okDe(d));
      }
    };
  }

  // ---------------------------------------------------------------- prioridade
  private prioridade(ctx: Contexto): Answer {
    const d = ctx.d as D<'priority'>;
    const acoes = significativas(d).filter((a) => !this.e.falhas.includes(`${ctx.g.state.turn.number}|${ctx.g.state.turn.step}|${a.id}`));
    if (!acoes.length) return PASSAR;
    if (this.p.regras) return this.regras(ctx, acoes);
    const r = this.p.busca ? buscar(this, ctx, acoes) : this.rasa(ctx, acoes);
    if (r.kind === 'priority' && r.action === 'pass') {
      this.e.passouEm.push(this.chave(d, buildView(ctx.g, this.eu, d)));
      if (this.e.passouEm.length > 200) this.e.passouEm.shift();
    }
    return r;
  }

  /** Iniciante: terreno, depois a criatura (ou outra permanente) mais cara que der, quase nunca instantânea */
  private regras(ctx: Contexto, acoes: D<'priority'>['actions']): Answer {
    const g = ctx.g;
    const s = g.state;
    if (s.turn.active !== this.eu || (s.turn.step !== 'main1' && s.turn.step !== 'main2') || s.zones.stack.length) return PASSAR;
    // erros de quem está começando: às vezes esquece de jogar o terreno, às vezes conjura outra coisa que não a melhor
    const terreno = acoes.find((a) => a.kind === 'play');
    if (terreno && !this.chance(0.15)) return { kind: 'priority', action: terreno.id };
    const peso = (a: D<'priority'>['actions'][number]): number => {
      if (a.kind !== 'cast') return -1;
      if (a.id.endsWith(':command')) return 50;
      const o = a.obj !== undefined ? s.objects[a.obj] : undefined;
      if (!o) return -1;
      const info = papelDe(o.def);
      const mv = manaValue(g, a.obj!);
      if (info.instante && !isCreature(g, a.obj!)) return this.chance(0.1) ? mv : -1;
      if (isCreature(g, a.obj!)) return 30 + mv;
      if (!ehPermanente(g, a.obj!)) return this.chance(0.25) ? 10 + mv : -1;
      return 20 + mv;
    };
    const opcoes = acoes.map((a) => ({ a, w: peso(a) })).filter((x) => x.w >= 0).sort((x, y) => y.w - x.w);
    if (!opcoes.length) return PASSAR;
    const escolhida = opcoes.length > 1 && this.chance(0.25) ? opcoes[1 + int(this.e.rng, opcoes.length - 1)] : opcoes[0];
    return { kind: 'priority', action: escolhida.a.id };
  }

  /** busca rasa: cada candidata simulada até a pilha esvaziar (ou até o fim do combate, quando o bot age no combate) */
  rasa(ctx: Contexto, acoes: D<'priority'>['actions'], limiteCandidatas = 14): Answer {
    const r = this.avaliarCandidatas(ctx, acoes, limiteCandidatas);
    if (!r) return PASSAR;
    const { base, lista } = r;
    const boas = lista.filter((c) => c.valor > base + this.p.margem).sort((a, b) => b.valor - a.valor);
    if (!boas.length) return PASSAR;
    // erro humano (Fácil): às vezes fica com a segunda ou a terceira melhor
    let i = 0;
    if (this.p.erro > 0 && boas.length > 1 && this.chance(this.p.erro)) i = 1 + int(this.e.rng, Math.min(2, boas.length - 1));
    this.e.plano = boas[i].plano;
    return { kind: 'priority', action: boas[i].acao };
  }

  /**
   * Valor de passar e de cada candidata. Com um mundo por simulação (Fácil, Intermediário: o bot das fases anteriores)
   * cada simulação sorteia um mundo novo e fica o melhor valor de cada candidata; com vários mundos (Difícil em diante)
   * todas as candidatas são jogadas nos mesmos mundos e vale a média.
   */
  avaliarCandidatas(ctx: Contexto, acoes: D<'priority'>['actions'], limiteCandidatas = 14, prazoExtra?: number): { base: number; lista: { acao: string; valor: number; plano: Answer[]; valores: number[] }[] } | null {
    const g = ctx.g;
    const s = g.state;
    const copia = ctx.copia;
    if (!copia) return null;
    const inicio = performance.now();
    const prazo = Math.min(ctx.prazo, prazoExtra ?? Infinity);
    const objetos = s.zones.battlefield.length;
    // mesa enorme (fichas em cadeia): cada simulação custa mais; reduz a quantidade, sem perder o determinismo
    const limite = objetos <= 60 ? this.p.simulacoes : Math.max(3, Math.round(this.p.simulacoes * 60 / objetos));
    const noCombate = this.p.agirNoCombate && !!s.combat && ['declareAttackers', 'declareBlockers'].includes(s.turn.step);
    // Cartomante em diante: antes do combate do próprio turno, a jogada é avaliada depois dos ataques e bloqueios
    const antesDoCombate = this.p.olharCombate && s.turn.active === this.eu && s.turn.step === 'main1';
    const horizonte: Horizonte = noCombate || antesDoCombate ? 'combate' : 'pilha';
    const opts = { horizonte, avaliacao: this.avaliacao() };
    const candidatas = ordenar(acoes, g).slice(0, limiteCandidatas);
    const K = Math.max(1, this.p.mundos);
    let feitas = 0;
    const tempoOk = () => performance.now() < prazo && feitas < limite;

    if (K === 1) {
      // o bot das fases anteriores
      let base = avaliar(g, this.eu, opts.avaliacao);
      if (s.zones.stack.length || horizonte !== 'pilha') {
        const f = copia(ramo(this.e.rng, 'base'));
        if (f) { const r = simular(f, this.eu, PASSAR, this.politicaMinha(0, this.e.rng), this.politicaOutros(this.e.rng), opts); if (Number.isFinite(r.valor)) base = r.valor; }
      }
      const melhor = new Map<string, { acao: string; valor: number; plano: Answer[]; valores: number[] }>();
      for (let v = 0; v < this.p.variantes; v++) {
        for (const a of candidatas) {
          if (v > 0 && a.kind === 'play') continue;
          if (!tempoOk()) break;
          feitas++;
          const f = copia(ramo(this.e.rng, `c${feitas}`));
          if (!f) continue;
          const r = simular(f, this.eu, { kind: 'priority', action: a.id }, this.politicaMinha(v, this.e.rng), this.politicaOutros(this.e.rng), opts);
          // jogar terreno não precisa vencer a margem das outras jogadas
          const valor = a.kind === 'play' ? r.valor + 0.6 : r.valor;
          const atual = melhor.get(a.id);
          if (!atual || valor > atual.valor) melhor.set(a.id, { acao: a.id, valor, plano: r.plano, valores: [valor] });
        }
      }
      void inicio;
      return { base, lista: [...melhor.values()] };
    }

    // mesmos mundos para todas as candidatas (a diferença entre elas não depende da sorte do sorteio)
    const mundos = Array.from({ length: K }, (_, k) => ramo(this.e.rng, `m${k}`));
    const simulaEm = (k: number, primeira: Answer, variante: number) => {
      const f = copia(mundos[k]);
      if (!f) return null;
      const r2 = seedFrom(`p${k}:${mundos[k].join(':')}`);
      return simular(f, this.eu, primeira, this.politicaMinha(variante, r2), this.politicaOutros(r2), opts);
    };
    const bases: number[] = [];
    for (let k = 0; k < K; k++) {
      if (!s.zones.stack.length && horizonte === 'pilha') { bases.push(avaliar(g, this.eu, opts.avaliacao)); continue; }
      const r = simulaEm(k, PASSAR, 0);
      bases.push(r && Number.isFinite(r.valor) ? r.valor : avaliar(g, this.eu, opts.avaliacao));
    }
    const base = media(bases);
    const lista: { acao: string; valor: number; plano: Answer[]; valores: number[] }[] = [];
    // custo médio de uma simulação: uma candidata só começa se der para jogar todos os mundos dela até o prazo
    let gasto = 0;
    let sims = 0;
    const cabe = () => sims === 0 || performance.now() + K * (gasto / sims) <= prazo;
    for (let v = 0; v < this.p.variantes; v++) {
      for (const a of candidatas) {
        if (v > 0 && a.kind === 'play') continue;
        if (!tempoOk() || !cabe() || feitas + K > limite + K - 1) break;
        const valores: number[] = [];
        let plano: Answer[] = [];
        for (let k = 0; k < K; k++) {
          feitas++;
          const t0 = performance.now();
          const r = simulaEm(k, { kind: 'priority', action: a.id }, v);
          gasto += performance.now() - t0;
          sims++;
          if (!r) continue;
          valores.push(r.valor);
          if (k === 0) plano = r.plano;
        }
        if (!valores.length || valores.some((x) => !Number.isFinite(x))) continue;
        const valor = media(valores) + (a.kind === 'play' ? 0.6 : 0);
        const atual = lista.find((x) => x.acao === a.id);
        if (!atual) lista.push({ acao: a.id, valor, plano, valores });
        else if (valor > atual.valor) Object.assign(atual, { valor, plano, valores });
      }
    }
    return { base, lista };
  }

  // ---------------------------------------------------------------- combate simulado
  /** opções de ataque comparadas nos mesmos mundos, simulando bloqueios e dano até o fim do combate */
  private atacarSimulado(ctx: Contexto): Answer {
    const d = ctx.d as D<'attackers'>;
    const g = ctx.g;
    const ok = (a: Answer) => ctx.valida(a);
    const heur = atacar(d, g, this.eu, ok, this.e.rng, 0, this.p.lider);
    const opcoes = opcoesDeAtaque(d, g, this.eu, heur, this.p.lider).filter(ok);
    if (opcoes.length <= 1) return heur;
    return this.melhorOpcao(ctx, opcoes, 'combate', heur);
  }

  private bloquearSimulado(ctx: Contexto): Answer {
    const d = ctx.d as D<'blockers'>;
    const g = ctx.g;
    const ok = (a: Answer) => ctx.valida(a);
    const heur = bloquear(d, g, this.eu, ok);
    const opcoes = opcoesDeBloqueio(d, g, this.eu, heur).filter(ok);
    if (opcoes.length <= 1) return heur;
    return this.melhorOpcao(ctx, opcoes, 'combate', heur);
  }

  /** escolhas (sacrificar, alvos de efeito, sim ou não) comparadas em simulação no lugar das palavras do texto */
  private escolhaSimulada(ctx: Contexto): Answer {
    const d = ctx.d as D<'select'>;
    const ok = (a: Answer) => ctx.valida(a);
    const heur = escolher(d, ctx.g, this.eu, this.e.rng, false, ok, 0);
    const opcoes = alternativas(d, ctx.g, this.eu, ok).slice(0, 6);
    if (!opcoes.some((o) => JSON.stringify(o) === JSON.stringify(heur))) opcoes.unshift(heur);
    if (opcoes.length <= 1) return heur;
    return this.melhorOpcao(ctx, opcoes, ctx.g.state.combat ? 'combate' : 'pilha', heur);
  }

  private melhorOpcao(ctx: Contexto, opcoes: Answer[], horizonte: Horizonte, padrao: Answer): Answer {
    // combate e escolhas: o Difícil compara em 3 mundos; Cartomante e Magic God, em 5
    const K = Math.max(2, Math.min(5, this.p.mundos));
    const mundos = Array.from({ length: K }, (_, k) => ramo(this.e.rng, `o${k}`));
    const opts = { horizonte, avaliacao: this.avaliacao() };
    let melhor: { a: Answer; valor: number } | null = null;
    let gasto = 0;
    let sims = 0;
    for (const a of opcoes) {
      // a opção só começa se der para jogar todos os mundos dela até o prazo (a primeira, a heurística, sempre)
      if (melhor && (ctx.restante() < 0 || (sims > 0 && ctx.restante() < K * (gasto / sims)))) break;
      const valores: number[] = [];
      for (let k = 0; k < K; k++) {
        // o prazo acabou no meio de uma opção: ela fica de fora (a heurística, a primeira, é a resposta padrão)
        if (k > 0 && ctx.restante() < 0) break;
        const t0 = performance.now();
        const f = ctx.copia!(mundos[k]);
        if (!f) return padrao;
        const r2 = seedFrom(`q${k}:${mundos[k].join(':')}`);
        const r = simular(f, this.eu, a, this.politicaMinha(0, r2), this.politicaOutros(r2), opts);
        valores.push(r.valor);
        gasto += performance.now() - t0;
        sims++;
      }
      if (valores.length < K && melhor) break;
      if (valores.some((x) => !Number.isFinite(x))) continue;
      const valor = media(valores);
      if (!melhor || valor > melhor.valor + 1e-9) melhor = { a, valor };
    }
    return melhor?.a ?? padrao;
  }
}

/** a decisão só mostra o que é público (nenhuma carta que só quem decide vê: grimório, mão, virada para baixo) */
export function publicaNaVista(d: Decision, v: GameView): boolean {
  if (d.kind !== 'select' && d.kind !== 'arrange') return true;
  let publicos: Set<ObjId> | null = null;
  for (const it of d.items) {
    if (it.card) return false;
    if (it.obj === undefined) continue;
    publicos ??= new Set([
      ...v.battlefield.filter((o) => !o.faceDown), ...v.exile.filter((o) => !o.faceDown), ...v.command,
      ...v.players.flatMap((p) => p.graveyard),
    ].map((o) => o.id).concat(v.stack.map((x) => x.id)));
    if (!publicos.has(it.obj)) return false;
  }
  return true;
}

const media = (l: number[]) => l.reduce((t, x) => t + x, 0) / Math.max(1, l.length);
const okDe = (d: Decision) => (a: Answer) => { const v = (d as LiveDecision).validate; return !v || v(a) === null; };

function ehPermanente(g: G, id: ObjId): boolean {
  return chars(g, id).types.some((x) => ['Creature', 'Artifact', 'Enchantment', 'Planeswalker', 'Battle', 'Land'].includes(x));
}

/** ordem de tentativa: terrenos, comandante, mágicas mais caras, habilidades */
export function ordenar(acoes: D<'priority'>['actions'], g: G) {
  const peso = (a: D<'priority'>['actions'][number]): number => {
    if (a.kind === 'play') return 100;
    if (a.kind === 'cast' && a.id.endsWith(':command')) return 90;
    if (a.kind === 'cast' && a.obj !== undefined && g.state.objects[a.obj]) return 50 + manaValue(g, a.obj);
    return 10;
  };
  return [...acoes].sort((a, b) => peso(b) - peso(a)).slice(0, 14);
}

/** política rápida de prioridade para as jogadas longas (Magic God): terreno e a mágica mais cara que der no próprio turno */
export function politicaRapida(d: D<'priority'>, f: Game, rng: RngState): Answer | null {
  const s = f.state;
  if (s.turn.active !== d.player || (s.turn.step !== 'main1' && s.turn.step !== 'main2') || s.zones.stack.length) return null;
  const acoes = significativas(d);
  const terreno = acoes.find((a) => a.kind === 'play');
  if (terreno) return { kind: 'priority', action: terreno.id };
  const tentadas = (s.turnCounters[`rapida:${d.player}`] ?? 0);
  if (tentadas >= 4) return null;
  const casts = acoes.filter((a) => a.kind === 'cast').sort((a, b) => (b.obj !== undefined && s.objects[b.obj] ? manaValue(f.g, b.obj) : 5) - (a.obj !== undefined && s.objects[a.obj] ? manaValue(f.g, a.obj) : 5));
  const c = casts[int(rng, Math.max(1, Math.min(2, casts.length)))] ?? casts[0];
  if (!c) return null;
  s.turnCounters[`rapida:${d.player}`] = tentadas + 1;
  return { kind: 'priority', action: c.id };
}

/** resposta de um oponente dentro da simulação: anular a minha mágica ou remover a minha criatura, se tiver com quê */
function resposta(d: D<'priority'>, f: Game, eu: PlayerId, rng: RngState): Answer | null {
  const s = f.state;
  const topo = s.zones.stack[s.zones.stack.length - 1];
  const minhaNaPilha = topo !== undefined && s.objects[topo]?.stack?.controller === eu;
  const meuCombate = !!s.combat && s.turn.active === eu && ['declareBlockers', 'declareAttackers'].includes(s.turn.step);
  if (!minhaNaPilha && !meuCombate) return null;
  if ((s.turnCounters[`resp:${d.player}`] ?? 0) >= 1) return null;
  for (const a of d.actions) {
    if (a.kind !== 'cast' || a.obj === undefined || !s.objects[a.obj]) continue;
    const pp = papelDe(s.objects[a.obj].def);
    if (!pp.instante) continue;
    const serve = (minhaNaPilha && s.objects[topo].stack?.kind === 'spell' && pp.papeis.has('anula')) || pp.papeis.has('remocao');
    if (!serve || next(rng) > 0.75) continue;
    s.turnCounters[`resp:${d.player}`] = 1;
    return { kind: 'priority', action: a.id };
  }
  return null;
}

// ---------------------------------------------------------------- escolhas heurísticas

/** resposta heurística para qualquer decisão que não seja de prioridade */
export function escolher(d: Decision, gameOuG: Game | G, eu: PlayerId, rng: RngState, aleatorio: boolean, okExt?: (a: Answer) => boolean, erro = 0): Answer {
  const g = 'g' in gameOuG && (gameOuG as Game).g ? (gameOuG as Game).g : (gameOuG as G);
  const live = d as LiveDecision;
  const ok = okExt ?? ((a: Answer) => (!live.validate || live.validate(a) === null));
  switch (d.kind) {
    case 'priority': return PASSAR;
    case 'payment':
      if (d.canAuto) return { kind: 'payment', auto: true };
      if (d.canCancel) return { kind: 'payment', cancel: true };
      return { kind: 'payment', auto: true };
    case 'select': return selecionar(d, g, eu, rng, aleatorio, ok, erro);
    case 'number': {
      if (aleatorio) return { kind: 'number', value: d.min + int(rng, d.max - d.min + 1) };
      if (/vida/i.test(d.prompt)) return { kind: 'number', value: Math.max(d.min, Math.min(d.max, Math.floor(g.state.players[eu].life / 5))) };
      return { kind: 'number', value: d.max };
    }
    case 'attackers': return atacar(d, g, eu, ok, rng, 0, false);
    case 'blockers': return bloquear(d, g, eu, ok);
    case 'damage': return { kind: 'damage', assign: distribuirDano(d, g) };
    case 'arrange': return arrumar(d, g, eu);
    case 'mulligan': {
      const mao = g.state.zones.hand[eu];
      const terrenos = mao.filter((id) => isLand(g, id)).length;
      return { kind: 'mulligan', keep: d.mulligans >= 2 || (terrenos >= 2 && terrenos <= 5) };
    }
  }
}

/**
 * Dano de um atacante bloqueado por mais de uma criatura (ou com atropelar). Com atropelar: dano letal em cada
 * bloqueador e o resto no jogador (CR 702.19b). Sem: mata primeiro os bloqueadores mais valiosos que der, sem gastar
 * dano em quem já tem dano letal (letal 0) nem em indestrutível; o que sobra vai para um que ainda não morre.
 */
function distribuirDano(d: D<'damage'>, g: G): number[] {
  const assign = d.recipients.map(() => 0);
  let resto = d.amount;
  if (d.trample) {
    for (let i = 0; i < assign.length - 1 && resto > 0; i++) { const n = Math.min(resto, d.lethal[i]); assign[i] = n; resto -= n; }
    assign[assign.length - 1] += resto;
    return assign;
  }
  const s = g.state;
  const valor = (i: number) => { const r = d.recipients[i]; return r.kind === 'obj' && s.objects[r.id] ? valorPermanente(g, r.id) : 0; };
  const mataveis = d.recipients.map((_, i) => i)
    .filter((i) => { const r = d.recipients[i]; return d.lethal[i] > 0 && r.kind === 'obj' && !!s.objects[r.id] && !hasKw(g, r.id, 'indestructible'); })
    .sort((a, b) => valor(b) - valor(a));
  for (const i of mataveis) if (d.lethal[i] <= resto) { assign[i] = d.lethal[i]; resto -= d.lethal[i]; }
  if (resto > 0 && assign.length) assign[mataveis.find((i) => assign[i] === 0) ?? mataveis[0] ?? 0] += resto;
  return assign;
}

/** valor de uma carta minha na mão ou no grimório: terreno vale mais quando faltam terrenos; mágica, pelo custo e por
 *  quanto falta para conjurá-la */
function valorNaMao(g: G, id: ObjId, eu: PlayerId): number {
  const s = g.state;
  const terrenosMesa = s.zones.battlefield.filter((x) => controllerOf(g, x) === eu && isLand(g, x)).length;
  const terrenosMao = s.zones.hand[eu].filter((x) => isLand(g, x)).length;
  if (isLand(g, id)) {
    const total = terrenosMesa + terrenosMao;
    return total <= 3 ? 5 : total <= 5 ? 3.5 : total <= 7 ? 2 : 0.8;
  }
  const mv = manaValue(g, id);
  let v = 2 + 0.3 * Math.min(mv, 7);
  const falta = mv - (terrenosMesa + Math.min(terrenosMao, 2));
  if (falta > 2) v -= 0.6 * (falta - 2);
  const pp = papelDe(s.objects[id].def).papeis;
  if (pp.has('remocao') || pp.has('anula') || pp.has('compra') || pp.has('varredura')) v += 0.6;
  return v;
}

/** valor de um item de escolha do ponto de vista de `eu` (positivo = coisa minha valiosa) */
function valorItem(g: G, it: ChoiceItem, eu: PlayerId): { valor: number; meu: boolean } {
  const s = g.state;
  if (it.player !== undefined) return { valor: s.players[it.player].life, meu: it.player === eu };
  const id = it.obj ?? (Number.isFinite(Number(it.id)) ? Number(it.id) : undefined);
  const o = id !== undefined ? s.objects[id] : undefined;
  if (!o || id === undefined) return { valor: 0, meu: false };
  if (o.zone === 'battlefield') return { valor: isLand(g, id) && !isCreature(g, id) ? 2 : valorPermanente(g, id), meu: controllerOf(g, id) === eu };
  if (o.zone === 'stack') return { valor: 1 + manaValue(g, id), meu: controllerOf(g, id) === eu };
  // carta minha na mão ou no grimório: o que ela vale para mim agora
  if (o.owner === eu && (o.zone === 'hand' || o.zone === 'library')) return { valor: valorNaMao(g, id, eu), meu: true };
  // outra carta fora do campo: custo como medida (terrenos valem pouco)
  return { valor: isLand(g, id) ? 1 : 1 + manaValue(g, id), meu: o.owner === eu };
}

type Avaliado = { it: ChoiceItem; valor: number; meu: boolean };
/** o item não é de ninguém (modo, sim ou não) */
const neutro = (x: Avaliado) => x.it.player === undefined && x.it.obj === undefined && !Number.isFinite(Number(x.it.id));

/**
 * Ordem heurística dos itens de uma escolha. `certos`: quantos itens são do lado certo (dos oponentes num efeito contra,
 * meus num efeito a favor); a escolha não passa deles se não for obrigada.
 */
function ordemDaEscolha(d: D<'select'>, g: G, eu: PlayerId): { ids: string[]; perda: boolean; intencao: Intencao; certos: number; avaliados: Avaliado[] } {
  const itens = d.items.filter((i) => !i.disabled);
  const s = g.state;
  const minha = (id: ObjId) => { const o = s.objects[id]; return !!o && (o.zone === 'battlefield' || o.zone === 'stack' ? controllerOf(g, id) === eu : o.owner === eu); };
  const int = intencao(d, g, eu, minha);
  const avaliados: Avaliado[] = itens.map((it) => ({ it, ...valorItem(g, it, eu) }));
  let ordem: Avaliado[];
  let certos: number;
  if (int === 'perda') {
    // custo ou perda: as coisas menos valiosas
    ordem = [...avaliados].sort((a, b) => a.valor - b.valor);
    certos = ordem.length;
  } else if (int === 'contra') {
    // efeito ruim: nas coisas mais valiosas dos oponentes (jogador: quanto menos vida, melhor); se for obrigado a
    // escolher coisas minhas, as que menos fazem falta
    const nota = (x: Avaliado) => (x.it.player !== undefined ? 5 + 40 / (Math.max(0, x.valor) + 1) : x.valor);
    const deles = avaliados.filter((x) => !x.meu).sort((a, b) => nota(b) - nota(a));
    const meus = avaliados.filter((x) => x.meu).sort((a, b) => a.valor - b.valor);
    ordem = [...deles, ...meus];
    certos = deles.length;
  } else {
    // efeito bom: nas minhas coisas mais valiosas; nos oponentes, só se for obrigado, nas que menos valem
    const meus = avaliados.filter((x) => x.meu || neutro(x)).sort((a, b) => b.valor - a.valor);
    const deles = avaliados.filter((x) => !x.meu && !neutro(x)).sort((a, b) => a.valor - b.valor);
    ordem = [...meus, ...deles];
    certos = meus.length;
  }
  return { ids: ordem.map((x) => x.it.id), perda: int === 'perda', intencao: int, certos, avaliados };
}

/** quantos itens escolher: na perda, o mínimo; nos outros, os do lado certo (entre o mínimo e o máximo) */
function quantosEscolher(d: D<'select'>, max: number, o: { perda: boolean; certos: number }): number {
  return o.perda ? d.min : Math.max(d.min, Math.min(max, o.certos));
}

/**
 * Escolhas ordenadas: o fundo do grimório no mulligan de Londres (fica com a mão mais equilibrada), as cartas que voltam
 * da mão (Brainstorm: as piores, e das duas a melhor no topo) e a ordem dos gatilhos (como vieram).
 */
function ordenada(d: D<'select'>, g: G, eu: PlayerId): string[] {
  const itens = d.items.filter((i) => !i.disabled);
  const n = Math.max(d.min, Math.min(d.max, itens.length));
  if (/^Escolha \d+ carta\(s\) para pôr no fundo do grimório/.test(d.prompt)) return fundoDoMulligan(itens, g, n);
  if (!PERDA.test(d.prompt)) return itens.slice(0, n).map((i) => i.id);
  const piores = itens.map((it) => ({ id: it.id, v: valorItem(g, it, eu).valor })).sort((a, b) => a.v - b.v).slice(0, n);
  // a primeira escolhida fica por cima: das que voltam, a melhor primeiro
  return piores.sort((a, b) => b.v - a.v).map((x) => x.id);
}

/** mulligan de Londres: tira terrenos enquanto houver mais que uns 45% da mão; senão, a mágica mais cara */
function fundoDoMulligan(itens: ChoiceItem[], g: G, n: number): string[] {
  const resto = itens.filter((it) => it.obj !== undefined && g.state.objects[it.obj]);
  const fora: string[] = [];
  while (fora.length < n && resto.length) {
    const terrenos = resto.filter((it) => isLand(g, it.obj!));
    const ideal = Math.round(0.45 * (resto.length - 1));
    let i: number;
    if (terrenos.length > ideal) {
      // o terreno mais repetido (as cores ficam)
      const vezes = (it: ChoiceItem) => terrenos.filter((x) => g.state.objects[x.obj!].def === g.state.objects[it.obj!].def).length;
      i = resto.indexOf([...terrenos].sort((a, b) => vezes(b) - vezes(a))[0]);
    }
    else {
      const magias = resto.filter((it) => !isLand(g, it.obj!)).sort((a, b) => manaValue(g, b.obj!) - manaValue(g, a.obj!));
      i = resto.indexOf(magias[0] ?? resto[resto.length - 1]);
    }
    fora.push(resto[i].id);
    resto.splice(i, 1);
  }
  for (const it of itens) if (fora.length < n && !fora.includes(it.id)) fora.push(it.id);
  return fora;
}

function selecionar(d: D<'select'>, g: G, eu: PlayerId, rng: RngState, aleatorio: boolean, ok: (a: Answer) => boolean, erro = 0): Answer {
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
  if (d.ordered) return tenta(ordenada(d, g, eu)) ?? { kind: 'select', ids: itens.slice(0, Math.max(d.min, Math.min(max, itens.length))).map((it) => it.id) };
  // sim ou não: aceita, a não ser que seja pagar algo sem ganhar nada claro
  const sim = itens.find((i) => i.id === 'yes');
  const nao = itens.find((i) => i.id === 'no');
  if (sim && nao && itens.length === 2) return { kind: 'select', ids: [sim.id] };
  if (max === 0) return { kind: 'select', ids: [] };

  const o = ordemDaEscolha(d, g, eu);
  let ids = o.ids;
  // erro humano (níveis fracos): num efeito contra os oponentes, às vezes mira a coisa errada (mas nunca a própria)
  if (erro > 0 && o.intencao === 'contra' && d.max === 1 && next(rng) < erro) {
    const deles = ids.slice(0, o.certos);
    if (deles.length > 1) ids = [deles[1 + int(rng, deles.length - 1)], ...ids];
  }
  // do número preferido para baixo e, se nenhum servir, para cima
  const quantos = quantosEscolher(d, max, o);
  for (let n = quantos; n >= d.min; n--) { const a = tenta(ids.slice(0, n)); if (a) return a; }
  for (let n = quantos + 1; n <= max; n++) { const a = tenta(ids.slice(0, n)); if (a) return a; }
  for (let i = 0; i < 30; i++) {
    const n = d.min + int(rng, Math.max(1, max - d.min + 1));
    const a = tenta(shuffle(rng, [...ids]).slice(0, Math.min(n, max)));
    if (a) return a;
  }
  return { kind: 'select', ids: itens.slice(0, d.min).map((it) => it.id) };
}

/**
 * Respostas diferentes para uma escolha, da mais provável à menos (a primeira é a heurística). Com um alvo só, as
 * primeiras incluem sempre o item mais valioso dos oponentes e o meu mais valioso (a simulação decide entre eles).
 */
export function alternativas(d: Decision, g: G, eu: PlayerId, ok: (a: Answer) => boolean): Answer[] {
  if (d.kind !== 'select') return [];
  const itens = d.items.filter((i) => !i.disabled);
  const max = Math.min(d.max, itens.length);
  const out: Answer[] = [];
  const vistas = new Set<string>();
  const add = (ids: string[]) => {
    const a: Answer = { kind: 'select', ids };
    const k = [...ids].sort().join(',');
    if (vistas.has(k) || ids.length < d.min || ids.length > max || !ok(a)) return;
    vistas.add(k);
    out.push(a);
  };
  if (d.ordered) { add(ordenada(d, g, eu)); return out; }
  const o = ordemDaEscolha(d, g, eu);
  const { ids } = o;
  const n = quantosEscolher(d, max, o);
  if (max <= 1) {
    const objetos = o.avaliados.filter((x) => !neutro(x) && x.it.player === undefined);
    const melhorDeles = objetos.filter((x) => !x.meu).sort((a, b) => b.valor - a.valor)[0]?.it.id;
    const melhorMeu = objetos.filter((x) => x.meu).sort((a, b) => b.valor - a.valor)[0]?.it.id;
    add(n === 0 ? [] : ids.slice(0, 1));
    for (const id of [melhorDeles, melhorMeu]) if (id !== undefined) add([id]);
    for (const id of ids) add([id]);
    if (d.min === 0) add([]);
    return out;
  }
  add(ids.slice(0, n));
  // trocas de um item da escolha principal
  for (let i = n - 1; i >= 0 && out.length < 8; i--) for (let j = n; j < ids.length && out.length < 8; j++) add([...ids.slice(0, i), ...ids.slice(i + 1, n), ids[j]]);
  if (d.min < n) add(ids.slice(0, d.min));
  if (n < max) add(ids.slice(0, max));
  return out;
}

// ---------------------------------------------------------------- combate

/** dano de combate de uma criatura num golpe (CR 510.1a: pela resistência com Felothar, Assault Formation e afins) */
const danoGolpe = (g: G, id: ObjId): number => combatDamageAmount(g, id);
/** dano de combate total, com golpe duplo (CR 702.4) */
export const danoDe = (g: G, id: ObjId): number => danoGolpe(g, id) * (hasKw(g, id, 'double strike') ? 2 : 1);

function mata(g: G, de: ObjId, em: ObjId): boolean {
  const p = danoGolpe(g, de);
  if (p <= 0) return false;
  if (hasKw(g, em, 'indestructible')) return false;
  return hasKw(g, de, 'deathtouch') || danoDe(g, de) >= toughness(g, em) - (g.state.objects[em].damage ?? 0);
}

/** é comandante (o dano de combate dele conta para os 21, CR 903.10a) */
const ehComandante = (g: G, id: ObjId): boolean => { const c = g.state.objects[id]?.card; return c !== null && c !== undefined && !!g.state.cards[c]?.isCommander; };

/**
 * Os atacantes (com o dano que passa) matam o jogador `p`? Vida, 21 de dano do mesmo comandante (CR 903.10a) e 10
 * marcadores de veneno pelo tóxico (CR 702.164, 704.5c).
 */
export function letal(g: G, p: PlayerId, passam: { a: ObjId; dano?: number }[]): boolean {
  const j = g.state.players[p];
  let vida = 0;
  let veneno = 0;
  for (const x of passam) {
    const dano = x.dano ?? danoDe(g, x.a);
    if (dano <= 0) continue;
    vida += dano;
    veneno += toxicValue(g, x.a);
    const c = g.state.objects[x.a]?.card;
    if (ehComandante(g, x.a) && (j.commanderDamage[String(c)] ?? 0) + dano >= 21) return true;
  }
  return vida >= j.life || (veneno > 0 && (j.counters.poison ?? 0) + veneno >= 10);
}

/** perigo de um atacante para o jogador `p` (para bloquear e para supor quem o defensor bloqueia) */
function perigo(g: G, a: ObjId, p: PlayerId): number {
  const j = g.state.players[p];
  const dano = danoDe(g, a);
  if (dano <= 0) return 0;
  const c = g.state.objects[a]?.card;
  let x = dano / Math.max(1, j.life);
  if (ehComandante(g, a)) x += dano / Math.max(1, 21 - (j.commanderDamage[String(c)] ?? 0));
  const tox = toxicValue(g, a);
  if (tox) x += tox / Math.max(1, 10 - (j.counters.poison ?? 0));
  return x;
}

/**
 * Os atacantes que passam se o defensor `p` bloquear os mais perigosos com as criaturas que podem bloqueá-los
 * (evasão e restrições pelo motor, canBlock; ameaça pede dois bloqueadores).
 */
function quemPassa(g: G, p: PlayerId, atacantes: ObjId[]): ObjId[] {
  const s = g.state;
  const livres = s.zones.battlefield.filter((b) => !s.objects[b].tapped && !s.objects[b].phasedOut && controllerOf(g, b) === p && isCreature(g, b));
  const usados = new Set<ObjId>();
  const passam: ObjId[] = [];
  for (const a of [...atacantes].sort((x, y) => perigo(g, y, p) - perigo(g, x, p))) {
    const n = hasKw(g, a, 'menace') ? 2 : 1;
    const bs = livres.filter((b) => !usados.has(b) && canBlock(g, b, a));
    if (bs.length >= n) for (const b of bs.slice(0, n)) usados.add(b);
    else passam.push(a);
  }
  return passam;
}

const bloqueadoresDe = (g: G, p: PlayerId, atacante: ObjId) => g.state.zones.battlefield.filter((b) => !g.state.objects[b].tapped && !g.state.objects[b].phasedOut && controllerOf(g, b) === p && isCreature(g, b) && canBlock(g, b, atacante));

export function atacar(d: D<'attackers'>, g: G, eu: PlayerId, ok: (a: Answer) => boolean, rng?: RngState, esquece = 0, lider = false): Answer {
  const s = g.state;
  const vida = (t: TargetRef) => (t.kind === 'player' ? s.players[t.id].life : s.objects[t.id]?.counters.loyalty ?? 0);
  const dono = (t: TargetRef) => (t.kind === 'player' ? t.id : controllerOf(g, t.id));
  const ataques: [ObjId, TargetRef][] = [];
  // ameaça de cada oponente: mesa + vida; quem me atacou no último turno dele pesa mais (retaliação)
  const ameaca = new Map<PlayerId, number>();
  const forca = lider ? forcas(g) : null;
  for (const p of s.players) {
    if (p.id === eu || p.left || p.lost) continue;
    const mesa = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && controllerOf(g, id) === p.id && !isLand(g, id)).reduce((t, id) => t + valorPermanente(g, id), 0);
    const atacouMe = (s.lastTurnAttackedPlayers[p.id] ?? []).includes(eu) ? 15 : 0;
    // nível Difícil em diante: quem está ganhando é o alvo preferido
    ameaca.set(p.id, mesa + 0.3 * p.life + atacouMe + (forca ? 0.5 * (forca.get(p.id) ?? 0) : 0));
  }
  // ataque letal: se as criaturas que podem atacar um oponente o matam mesmo que ele bloqueie as mais perigosas com o
  // que pode bloqueá-las (vida, dano de comandante, veneno), ataca esse oponente com todas
  for (const p of s.players) {
    if (p.id === eu || p.left || p.lost) continue;
    const contra = d.candidates.filter((c) => c.targets.some((t, i) => t.kind === 'player' && t.id === p.id && !(c.costs?.[i] ?? 0)) && (!c.required?.length || c.required.some((t) => t.kind === 'player' && t.id === p.id)));
    if (contra.length && letal(g, p.id, quemPassa(g, p.id, contra.map((c) => c.obj)).map((a) => ({ a })))) {
      const todos: Answer = { kind: 'attackers', attacks: contra.map((c) => [c.obj, { kind: 'player', id: p.id }] as [ObjId, TargetRef]) };
      if (ok(todos)) return todos;
    }
  }
  // com pouca vida, segura uma parte das criaturas para bloquear
  const minhaVida = s.players[eu].life;
  let reserva = minhaVida <= 10 ? Math.ceil(d.candidates.length / 2) : 0;
  const ordem = [...d.candidates].sort((a, b) => danoDe(g, b.obj) - danoDe(g, a.obj));
  for (const c of ordem) {
    if (c.required?.length) {
      ataques.push([c.obj, [...c.required].sort((a, b) => vida(a) - vida(b))[0]]);
      continue;
    }
    const a = c.obj;
    if (danoGolpe(g, a) <= 0) continue;
    const vigilante = hasKw(g, a, 'vigilance');
    if (!vigilante && reserva > 0) { reserva--; continue; }
    // erro humano: esquece de atacar com esta criatura
    if (esquece > 0 && rng && next(rng) < esquece) continue;
    let melhor: { t: TargetRef; nota: number } | null = null;
    for (const [i, t] of c.targets.entries()) {
      // atacar com custo (Ghostly Prison e afins): não vale a pena para o bot
      if ((c.costs?.[i] ?? 0) > 0) continue;
      const def = dono(t);
      const bloqueadores = bloqueadoresDe(g, def, a);
      const primeiro = hasKw(g, a, 'first strike') || hasKw(g, a, 'double strike');
      const seguro = bloqueadores.every((b) => {
        if (!mata(g, b, a)) return true;
        if (primeiro && mata(g, a, b) && !hasKw(g, b, 'first strike')) return true;
        return mata(g, a, b) && valorPermanente(g, b) >= 0.8 * valorPermanente(g, a);
      });
      if (!seguro) continue;
      const v = vida(t);
      let nota = (ameaca.get(def) ?? 0) + (bloqueadores.length === 0 ? 5 : 0);
      // ataque que elimina (jogador, pela vida, comandante ou veneno; planeswalker)
      if (t.kind === 'player' ? letal(g, t.id, [{ a }]) : v > 0 && v <= danoDe(g, a)) nota += 60;
      if (t.kind === 'obj') nota -= 10;
      if (!melhor || nota > melhor.nota) melhor = { t, nota };
    }
    if (melhor) ataques.push([a, melhor.t]);
  }
  const resp: Answer = { kind: 'attackers', attacks: ataques };
  if (ok(resp)) return resp;
  return defaultAnswer(d);
}

/** Iniciante: ataca só com quem não tem quem o bloqueie, no oponente com menos vida (e às vezes esquece) */
function atacarObvio(d: D<'attackers'>, g: G, eu: PlayerId, ok: (a: Answer) => boolean, rng: RngState, esquece: number): Answer {
  const s = g.state;
  const ataques: [ObjId, TargetRef][] = [];
  for (const c of d.candidates) {
    if (c.required?.length) { ataques.push([c.obj, c.required[0]]); continue; }
    if (danoGolpe(g, c.obj) <= 0 || next(rng) < esquece) continue;
    // óbvio: ninguém do outro lado pode bloquear esta criatura
    const livres = c.targets.filter((t, i) => t.kind === 'player' && !(c.costs?.[i] ?? 0) && bloqueadoresDe(g, t.id, c.obj).length === 0);
    if (!livres.length) continue;
    livres.sort((a, b) => s.players[a.id].life - s.players[b.id].life);
    ataques.push([c.obj, livres[0]]);
  }
  const resp: Answer = { kind: 'attackers', attacks: ataques };
  return ok(resp) ? resp : defaultAnswer(d);
}

/** os atacantes que passam (com atropelar, o que sobra depois da resistência dos bloqueadores) */
function passando(g: G, atacantes: ObjId[], blocks: [ObjId, ObjId][]): { a: ObjId; dano?: number }[] {
  return atacantes.flatMap((a) => {
    const meus = blocks.filter(([, x]) => x === a);
    if (!meus.length) return [{ a }];
    if (!hasKw(g, a, 'trample')) return [];
    const barreira = meus.reduce((t, [b]) => t + Math.max(0, toughness(g, b) - (g.state.objects[b].damage ?? 0)), 0);
    return [{ a, dano: Math.max(0, danoDe(g, a) - barreira) }];
  });
}

export function bloquear(d: D<'blockers'>, g: G, eu: PlayerId, ok: (a: Answer) => boolean): Answer {
  const s = g.state;
  const atacantes = [...d.attackers].filter((a) => s.objects[a]).sort((a, b) => danoDe(g, b) - danoDe(g, a));
  const usados = new Set<ObjId>();
  const blocks: [ObjId, ObjId][] = [];
  const podem = (a: ObjId) => d.candidates.filter((c) => c.canBlock.includes(a) && !usados.has(c.obj)).map((c) => c.obj);
  const bloqueado = new Set<ObjId>();
  // primeiro golpe (CR 702.7): quem bate antes e mata não leva o dano de volta
  const antes = (x: ObjId) => hasKw(g, x, 'first strike') || hasKw(g, x, 'double strike');
  const derruba = (de: ObjId, em: ObjId) => mata(g, de, em) && !(antes(em) && !antes(de) && mata(g, em, de));
  // bloqueios bons: mata e sobrevive; trocas favoráveis
  for (const a of atacantes) {
    const cands = podem(a).sort((x, y) => valorPermanente(g, x) - valorPermanente(g, y));
    const bom = cands.find((b) => derruba(b, a) && !derruba(a, b));
    const troca = cands.find((b) => derruba(b, a) && valorPermanente(g, b) < valorPermanente(g, a));
    const b = bom ?? troca;
    if (b !== undefined) { blocks.push([b, a]); usados.add(b); bloqueado.add(a); }
  }
  // não morrer (vida, dano de comandante, veneno): bloqueia os mais perigosos com as criaturas menos valiosas (com
  // ameaça, duas: CR 702.111b)
  for (const a of [...atacantes].sort((x, y) => perigo(g, y, eu) - perigo(g, x, eu))) {
    if (!letal(g, eu, passando(g, atacantes, blocks))) break;
    if (bloqueado.has(a)) continue;
    const cands = podem(a).sort((x, y) => valorPermanente(g, x) - valorPermanente(g, y));
    const n = hasKw(g, a, 'menace') ? 2 : 1;
    if (cands.length < n) continue;
    for (const b of cands.slice(0, n)) { blocks.push([b, a]); usados.add(b); }
    bloqueado.add(a);
  }
  // bloqueios inválidos (ameaça com um bloqueador só etc.): fica com os de cada atacante que valem junto com os
  // anteriores. Antes tirava do fim da lista, e um bloqueio inválido no começo (o maior atacante vem primeiro)
  // levava embora todos os outros
  const valem: [ObjId, ObjId][] = [];
  for (const a of atacantes) {
    const deste = blocks.filter(([, x]) => x === a);
    if (deste.length && ok({ kind: 'blockers', blocks: [...valem, ...deste] })) valem.push(...deste);
  }
  return { kind: 'blockers', blocks: valem };
}

/** Iniciante: bloqueia para não morrer e, às vezes, quando o bloqueador mata e sobrevive */
function bloquearObvio(d: D<'blockers'>, g: G, eu: PlayerId, ok: (a: Answer) => boolean, rng: RngState): Answer {
  const s = g.state;
  const atacantes = [...d.attackers].filter((a) => s.objects[a]).sort((a, b) => danoDe(g, b) - danoDe(g, a));
  const usados = new Set<ObjId>();
  const blocks: [ObjId, ObjId][] = [];
  const podem = (a: ObjId) => d.candidates.filter((c) => c.canBlock.includes(a) && !usados.has(c.obj)).map((c) => c.obj);
  // bloqueio "de graça" (mata e sobrevive): às vezes nem vê
  for (const a of atacantes) {
    const b = podem(a).find((b) => mata(g, b, a) && !mata(g, a, b));
    if (b !== undefined && next(rng) < 0.3) { blocks.push([b, a]); usados.add(b); }
  }
  for (const a of atacantes) {
    if (!letal(g, eu, passando(g, atacantes, blocks))) break;
    if (blocks.some(([, x]) => x === a)) continue;
    const cands = podem(a).sort((x, y) => valorPermanente(g, x) - valorPermanente(g, y));
    if (!cands.length) continue;
    blocks.push([cands[0], a]);
    usados.add(cands[0]);
  }
  while (blocks.length) {
    const a: Answer = { kind: 'blockers', blocks: [...blocks] };
    if (ok(a)) return a;
    blocks.pop();
  }
  return { kind: 'blockers', blocks: [] };
}

/** opções de ataque para comparar: a heurística, nenhuma, todas, e a heurística com uma criatura a mais ou a menos */
function opcoesDeAtaque(d: D<'attackers'>, g: G, eu: PlayerId, heur: Answer, lider: boolean): Answer[] {
  if (heur.kind !== 'attackers') return [heur];
  const s = g.state;
  const obrig = defaultAnswer(d) as Extract<Answer, { kind: 'attackers' }>;
  const alvoPadrao = (c: D<'attackers'>['candidates'][number]): TargetRef | null => {
    const livres = c.targets.filter((_, i) => !(c.costs?.[i] ?? 0));
    if (!livres.length) return null;
    const f = lider ? forcas(g) : null;
    const nota = (t: TargetRef) => (t.kind === 'player' ? (f?.get(t.id) ?? 0) - 0.5 * s.players[t.id].life : -100);
    return [...livres].sort((a, b) => nota(b) - nota(a))[0];
  };
  const out: Answer[] = [heur, obrig];
  const todos: [ObjId, TargetRef][] = [];
  for (const c of d.candidates) {
    if (danoGolpe(g, c.obj) <= 0 && !c.required?.length) continue;
    const t = c.required?.length ? c.required[0] : alvoPadrao(c);
    if (t) todos.push([c.obj, t]);
  }
  out.push({ kind: 'attackers', attacks: todos });
  const h = heur.attacks;
  const porForca = [...h].sort((a, b) => danoDe(g, b[0]) - danoDe(g, a[0]));
  for (const x of porForca.slice(0, 3)) {
    if (d.candidates.find((c) => c.obj === x[0])?.required?.length) continue;
    out.push({ kind: 'attackers', attacks: h.filter((y) => y !== x) });
  }
  const fora = todos.filter(([o]) => !h.some(([y]) => y === o)).sort((a, b) => danoDe(g, b[0]) - danoDe(g, a[0]));
  for (const x of fora.slice(0, 3)) out.push({ kind: 'attackers', attacks: [...h, x] });
  const vistas = new Set<string>();
  return out.filter((a) => { const k = JSON.stringify((a as Extract<Answer, { kind: 'attackers' }>).attacks.map(([o, t]) => `${o}>${t.kind}${t.id}`).sort()); if (vistas.has(k)) return false; vistas.add(k); return true; });
}

/** opções de bloqueio: a heurística, nenhuma, a heurística sem cada bloqueio, e bloqueio duplo no maior atacante */
function opcoesDeBloqueio(d: D<'blockers'>, g: G, eu: PlayerId, heur: Answer): Answer[] {
  if (heur.kind !== 'blockers') return [heur];
  const out: Answer[] = [heur, { kind: 'blockers', blocks: [] }];
  const h = heur.blocks;
  for (const x of h.slice(0, 4)) out.push({ kind: 'blockers', blocks: h.filter((y) => y !== x) });
  const atacantes = [...d.attackers].filter((a) => g.state.objects[a]).sort((a, b) => danoDe(g, b) - danoDe(g, a));
  const usados = new Set(h.map(([b]) => b));
  for (const a of atacantes.slice(0, 2)) {
    // mais um bloqueador (o mais barato que sobra) no atacante
    const livre = d.candidates.filter((c) => c.canBlock.includes(a) && !usados.has(c.obj)).map((c) => c.obj).sort((x, y) => valorPermanente(g, x) - valorPermanente(g, y));
    if (livre.length) out.push({ kind: 'blockers', blocks: [...h, [livre[0], a]] });
    if (livre.length >= 2 && !h.some(([, x]) => x === a)) out.push({ kind: 'blockers', blocks: [...h, [livre[0], a], [livre[1], a]] });
  }
  const vistas = new Set<string>();
  return out.filter((a) => { const k = JSON.stringify((a as Extract<Answer, { kind: 'blockers' }>).blocks.map(([b, x]) => `${b}>${x}`).sort()); if (vistas.has(k)) return false; vistas.add(k); return true; });
}

// ---------------------------------------------------------------- vidência e afins

function arrumar(d: D<'arrange'>, g: G, eu: PlayerId): Answer {
  const s = g.state;
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
