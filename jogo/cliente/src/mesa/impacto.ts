// Os efeitos que todos veem quando chega uma vista nova: o ataque declarado (a investida), o dano de combate (o golpe),
// quem morre voando para o cemitério ou o exílio, e a vida que muda. Os planos vêm de golpes.ts; aqui eles viram tela.
//
// Regras de desempenho (a primeira prévia derrubava o FPS):
// - só transform e opacity animam. Brilho, sombra e gradiente são desenhados uma vez em elementos próprios e só a
//   opacidade deles muda; nada de filter, box-shadow animado, mistura de cores ou canvas;
// - tudo é agendado de uma vez quando a vista chega: as medidas são lidas juntas (um layout só), os elementos nascem
//   invisíveis (opacidade 0 no estilo) e todas as animações começam no mesmo quadro, com `delay` e sem `fill` (o estilo
//   invisível vale até a vez de cada uma). Durante o golpe não se cria nada nem se mede nada; só os sons saem por
//   setTimeout;
// - duas camadas: os campos das áreas dão o tranco (só translate; dentro deles não há nada com desfoque de fundo, e a
//   faixa de fases, as colunas e os selos de vidro ficam parados; a exceção pequena é a vida que treme ao perder vida,
//   como antes); o que voa ou acende fica numa camada fixa por cima, que não treme;
// - poucos elementos: no máximo 12 cópias de carta por vista (as outras só dão um empurrão), lascas contadas, nenhuma
//   no modo Desempenho; todo elemento sai quando a última animação dele acaba; com a aba escondida, nada.

import type { ObjId, PlayerId } from '../../../motor/types.ts';
import type { GameView, ObjView } from '../../../motor/view.ts';
import { tocar } from '../sons.ts';
import { danoDe, type Golpe, type PlanoCombate } from './golpes.ts';

// ---------------------------------------------------------------- tempos (os da prévia aprovada)
/** duração de um golpe: recua, dispara, congela no impacto, volta */
export const T_GOLPE = 560;
/** frações de T_GOLPE: fim do recuo, o impacto, a parada no impacto (≈ 70 ms) e a volta até 0,8 da distância */
const RECUO = 0.26, IMPACTO = 0.4, PARADA = 0.13, VOLTA = 0.1;
/** intervalo entre um atacante e o seguinte (com muitos atacantes, menor: a leva inteira cabe em ~1,1 s) */
const ESCALONA = 120, LEVA_MAX = 1100;
const BRANCO = 140, LAMPEJO = 200, ONDA = 360, RISCO = 220, LASCA = 420, LASCA_VARIA = 120, TRANCO = 300, CLARAO = 110;
const VINHETA = 650, NUMERO_GOLPE = 1200, NUMERO = 1250, CONTRA = 280;
/** morte: racha, treme e voa; começa um pouco depois do impacto que a matou */
const MORTE = 900, MORTE_DEPOIS = 140, MORTE_SEM_GOLPE = 60, SOME = 400;
/** ataque declarado: a investida de cada atacante e o anel vermelho que acende e apaga */
const INVESTIDA = 380, INVESTIDA_ESCALONA = 60, ANEL = 620, ANEL_DEPOIS = 150;
const VIDA_BRILHO = 900, AVATAR_BRILHO = 750, TREME_VIDA = 420, TRANCO_AVATAR = 380, AREA_BRILHO = 900;
/** contas: cópias de carta por vista, lascas por golpe e no total, sons de impacto por vista */
const MAX_COPIAS = 12, LASCAS_GOLPE = 12, MAX_LASCAS = 30, MAX_SONS = 8;

const VERMELHO = '224, 70, 79', VERDE = '63, 174, 106';

export interface Opcoes {
  eu: PlayerId;
  /** "reduzir movimento" do sistema: sem cópias voando, sem tranco, sem lascas nem clarões; o alvo pisca e os números aparecem */
  reduzir: boolean;
  /** modo Desempenho: sem lascas, clarão de tela mais fraco e tranco menor */
  leve: boolean;
  /** efeitos visuais ligados (desligados: só os sons) */
  efeitos: boolean;
}

// ---------------------------------------------------------------- medidas
/** uma carta na tela: centro, tamanho em pé (sem o giro), giro (virada 90°, inclinada 12°), a caixa e a imagem */
export interface Foto { cx: number; cy: number; w: number; h: number; rot: number; r: { width: number; height: number }; img: string | null }

export function medirCarta(el: HTMLElement): Foto {
  const r = el.getBoundingClientRect();
  // o giro final pela classe (no meio da transição de virar, o giro lido ainda é o de antes)
  const rot = el.classList.contains('inclinada') ? 12 : el.classList.contains('virada') ? 90 : 0;
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: el.offsetWidth, h: el.offsetHeight, rot, r: { width: r.width, height: r.height }, img: el.querySelector('img')?.getAttribute('src') ?? null };
}

/** onde estava cada criatura do campo (a que sair na próxima vista voa dali) */
export function fotografar(v: GameView): Map<ObjId, Foto> {
  const m = new Map<ObjId, Foto>();
  const criaturas = new Set(v.battlefield.filter((o) => o.types.includes('Creature')).map((o) => o.id));
  if (!criaturas.size) return m;
  for (const el of document.querySelectorAll<HTMLElement>('.campo [data-obj]')) {
    const id = Number(el.dataset.obj);
    if (criaturas.has(id)) m.set(id, medirCarta(el));
  }
  return m;
}

const cartaNaMesa = (id: ObjId) => document.querySelector<HTMLElement>(`.campo [data-obj="${id}"]`);
const area = (p: PlayerId) => document.querySelector<HTMLElement>(`[data-jogador="${p}"]`);
const caixa = (el: Element) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
type Caixa = ReturnType<typeof caixa>;
const meio = (c: Caixa) => [c.x + c.w / 2, c.y + c.h / 2] as const;

/** cemitério ou exílio do dono, conforme a zona que cresceu; null se foi para a mão ou o grimório */
function zonaDestino(a: GameView, v: GameView, o: ObjView): Element | null {
  const zonas = area(o.owner)?.querySelectorAll('.botao-zona .slot');
  const cem = (x: GameView) => x.players.find((p) => p.id === o.owner)?.graveyard.length ?? 0;
  const exi = (x: GameView) => x.exile.filter((e) => e.owner === o.owner).length;
  if (cem(v) > cem(a)) return zonas?.[0] ?? null;
  if (exi(v) > exi(a)) return zonas?.[1] ?? null;
  return null;
}

// ---------------------------------------------------------------- a camada dos efeitos
let camada: HTMLDivElement | null = null;
/** a camada fixa por cima da mesa (não treme), criada uma vez; os elementos saem dela quando acabam */
function fx(): HTMLDivElement {
  if (!camada?.isConnected) {
    camada = document.createElement('div');
    camada.className = 'fx-camada';
    camada.setAttribute('aria-hidden', 'true');
    document.body.appendChild(camada);
  }
  return camada;
}

/** um elemento do efeito na camada, invisível até a animação dele começar (ou à vista desde já: `visivel`) */
function novo(classe: string, x: number, y: number, w?: number, h?: number, visivel = false): HTMLDivElement {
  const e = document.createElement('div');
  e.className = classe;
  const s = e.style;
  s.left = `${Math.round(x)}px`;
  s.top = `${Math.round(y)}px`;
  if (w !== undefined) s.width = `${Math.round(w)}px`;
  if (h !== undefined) s.height = `${Math.round(h)}px`;
  if (!visivel) s.opacity = '0';
  fx().appendChild(e);
  return e;
}

const pendentes = new WeakMap<Element, number>();
/** anima um elemento da camada; ele sai quando a última animação dele acaba */
function anima(e: HTMLElement, quadros: Keyframe[], o: KeyframeAnimationOptions): void {
  const a = e.animate(quadros, o);
  pendentes.set(e, (pendentes.get(e) ?? 0) + 1);
  const fim = () => { const n = (pendentes.get(e) ?? 1) - 1; pendentes.set(e, n); if (n <= 0) e.remove(); };
  a.onfinish = fim;
  a.oncancel = fim;
}

/** uma cópia da carta na camada (centro e giro dela); `visivel`: já à vista, no lugar da carta que sumiu da mesa */
function copia(f: Foto, visivel: boolean, classe = 'fx-carta'): HTMLDivElement {
  const e = novo(classe, f.cx - f.w / 2, f.cy - f.h / 2, f.w, f.h, visivel);
  e.style.borderRadius = `${(f.w * 0.055).toFixed(1)}px`;
  if (f.rot) e.style.transform = `rotate(${f.rot}deg)`;
  if (f.img) { const i = document.createElement('img'); i.src = f.img; i.alt = ''; e.appendChild(i); }
  return e;
}

/** uma camada pronta dentro da cópia (branco do impacto, escuro da morte): só a opacidade dela anima */
function veu(pai: HTMLElement, classe: string): HTMLDivElement {
  const e = document.createElement('div');
  e.className = classe;
  pai.appendChild(e);
  return e;
}

// ---------------------------------------------------------------- o que muda a cada vista
interface GolpeMedido {
  g: Golpe;
  de: Foto;
  /** a carta do atacante ainda na mesa (para escondê-la enquanto a cópia voa, ou empurrá-la) */
  el: HTMLElement | null;
  /** caixas do alvo: os bloqueadores (cartas) ou a vida do jogador ou o planeswalker */
  alvos: { f: Foto | null; el: HTMLElement | null; id?: ObjId }[];
  vida: Caixa | null;
  ux: number; uy: number; chega: number;
  /** o ponto do impacto */
  x: number; y: number;
  atraso: number; t: number;
}

/** números, brilhos e tremidas de uma vida que mudou, já medidos */
interface VidaMedida { p: PlayerId; d: number; t: number; vida: Caixa; local: boolean; retratos: Caixa[]; avatar: HTMLElement | null; vidaEl: HTMLElement; area: Caixa | null; noGolpe: boolean }

export function efeitosDaVista(a: GameView, v: GameView, plano: PlanoCombate, fotos: Map<ObjId, Foto>, o: Opcoes): void {
  const visual = o.efeitos && typeof document !== 'undefined' && !document.hidden;
  const mov = visual && !o.reduzir;

  // ------------------------------------------------ o que mudou (sem medir nada ainda)
  const vidaAntes = new Map(a.players.map((p) => [p.id, p.life]));
  const mudancas = v.players.map((p) => ({ p: p.id, d: p.life - (vidaAntes.get(p.id) ?? p.life) })).filter((x) => x.d !== 0);
  const antes = new Map(a.battlefield.map((x) => [x.id, x]));
  const agora = new Set(v.battlefield.map((x) => x.id));
  const danoCriatura = v.battlefield.filter((x) => (antes.get(x.id)?.damage ?? x.damage) < x.damage);
  const lealdade = v.battlefield.filter((x) => (antes.get(x.id)?.counters.loyalty ?? 0) > (x.counters.loyalty ?? 0));
  const sairam = a.battlefield.filter((x) => !agora.has(x.id) && x.types.includes('Creature'));

  // ------------------------------------------------ o tempo de cada golpe (vale também só para os sons)
  const n = plano.golpes.length;
  const passo = n > 1 ? Math.min(ESCALONA, LEVA_MAX / (n - 1)) : 0;
  const tempos = plano.golpes.map((_, i) => ({ atraso: Math.round(i * passo), t: Math.round(i * passo + T_GOLPE * IMPACTO) }));
  /** o último impacto em cada jogador e o do golpe de cada criatura envolvida */
  const tJogador = new Map<PlayerId, number>();
  const tCriatura = new Map<ObjId, number>();
  plano.golpes.forEach((g, i) => {
    const t = tempos[i].t;
    if (g.alvo.tipo === 'jogador') tJogador.set(g.alvo.id, t);
    else if (g.alvo.tipo === 'bloqueadores') for (const b of g.alvo.ids) tCriatura.set(b, t);
    else tCriatura.set(g.alvo.id, t);
    tCriatura.set(g.atacante, t);
  });
  const primeiro = tempos.length ? tempos[0].t : 0;
  const quando = (p: PlayerId) => tJogador.get(p) ?? primeiro;

  // ------------------------------------------------ sons (com ou sem efeitos visuais)
  if (!document.hidden) {
    if (plano.declarados.length && !n) tocar('investida');
    plano.golpes.slice(0, MAX_SONS).forEach((g, i) => setTimeout(() => tocar('impacto', g.alvo.tipo === 'jogador' ? 1 : 0.9), tempos[i].t));
  }
  const danos = mudancas.filter((x) => x.d < 0), curas = mudancas.filter((x) => x.d > 0);
  if (danos.length) { const t = Math.min(...danos.map((x) => quando(x.p))), f = danos.some((x) => x.p === o.eu) ? 1 : 0.55; if (t) setTimeout(() => tocar('dano', f), t); else tocar('dano', f); }
  if (curas.length) { const t = primeiro, f = curas.some((x) => x.p === o.eu) ? 1 : 0.55; if (t) setTimeout(() => tocar('vida', f), t); else tocar('vida', f); }
  if (!visual) return;

  // ------------------------------------------------ medidas, todas juntas (um layout só)
  const fotoDe = (id: ObjId): { f: Foto | null; el: HTMLElement | null } => {
    const el = cartaNaMesa(id);
    return el ? { f: medirCarta(el), el } : { f: fotos.get(id) ?? null, el: null };
  };
  const vidaDe = (p: PlayerId) => area(p)?.querySelector<HTMLElement>('.vida-n') ?? null;
  const golpes: GolpeMedido[] = [];
  plano.golpes.forEach((g, i) => {
    const { f: de, el } = fotoDe(g.atacante);
    if (!de) return;
    let alvos: GolpeMedido['alvos'] = [], vida: Caixa | null = null;
    if (g.alvo.tipo === 'jogador') { const e = vidaDe(g.alvo.id); vida = e ? caixa(e) : null; if (!vida) { const ar = area(g.alvo.id); vida = ar ? caixa(ar) : null; } }
    else alvos = (g.alvo.tipo === 'bloqueadores' ? g.alvo.ids : [g.alvo.id]).map((id) => ({ ...fotoDe(id), id }));
    const comCaixa = alvos.filter((x) => x.f) as { f: Foto }[];
    if (!vida && !comCaixa.length) return;
    // o centro do alvo e a altura dele (para encostar na borda)
    const [x1, y1] = vida ? meio(vida) : [comCaixa.reduce((s, x) => s + x.f.cx, 0) / comCaixa.length, comCaixa.reduce((s, x) => s + x.f.cy, 0) / comCaixa.length];
    const hAlvo = vida ? vida.h : Math.max(...comCaixa.map((x) => x.f.r.height));
    const d = Math.hypot(x1 - de.cx, y1 - de.cy) || 1, ux = (x1 - de.cx) / d, uy = (y1 - de.cy) / d;
    const chega = Math.max(0, d - hAlvo * 0.45 - de.r.height * 0.32);
    const alcance = chega + de.r.height * 0.32;
    golpes.push({ g, de, el, alvos, vida, ux, uy, chega, x: de.cx + ux * alcance, y: de.cy + uy * alcance, ...tempos[i] });
  });
  const campos = mov ? [...document.querySelectorAll<HTMLElement>('[data-jogador] > .campo')] : [];
  const vinhetas = new Map<PlayerId, Caixa>();
  for (const g of golpes) if (g.g.alvo.tipo === 'jogador' && !vinhetas.has(g.g.alvo.id)) { const ar = area(g.g.alvo.id); if (ar) vinhetas.set(g.g.alvo.id, caixa(ar)); }
  const vidas: VidaMedida[] = [];
  for (const m of mudancas) {
    const ar = area(m.p), ve = vidaDe(m.p);
    if (!ar || !ve) continue;
    vidas.push({ p: m.p, d: m.d, t: m.d < 0 ? quando(m.p) : primeiro, vida: caixa(ve), local: !!ve.closest('.avatar-local'), vidaEl: ve, avatar: ar.querySelector<HTMLElement>('.avatar'),
      retratos: o.leve ? [] : [...ar.querySelectorAll('.avatar-retrato, .avatar-inicial')].map(caixa), area: o.leve || tJogador.has(m.p) ? null : caixa(ar), noGolpe: tJogador.has(m.p) });
  }
  const numerosCriatura: { x: number; y: number; texto: string; t: number; golpe: boolean; dano: number }[] = [];
  for (const c of [...danoCriatura, ...lealdade]) {
    const el = cartaNaMesa(c.id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const dano = c.damage - (antes.get(c.id)?.damage ?? 0) || (antes.get(c.id)?.counters.loyalty ?? 0) - (c.counters.loyalty ?? 0);
    numerosCriatura.push({ x: r.left + r.width / 2 - 16, y: r.top - 6, texto: `−${dano}`, t: tCriatura.get(c.id) ?? primeiro, golpe: tCriatura.has(c.id), dano });
  }
  // quem morreu: de onde (a foto da vista de antes), para onde, e quando (o impacto que o matou)
  // (a ficha deixa de existir: racha e some no lugar; a carta que voltou para a mão ou o grimório não tem efeito)
  const mortes = sairam.flatMap((c) => {
    const f = fotos.get(c.id), destino = zonaDestino(a, v, c);
    if (!f || (!destino && !c.token)) return [];
    return [{ c, f, destino: destino ? caixa(destino) : null, t: tCriatura.get(c.id) }];
  });
  // o ataque declarado (com o dano junto na mesma vista, fica só o golpe)
  const declarados = n ? [] : plano.declarados.slice(0, MAX_COPIAS).flatMap((x) => {
    const el = cartaNaMesa(x.id);
    const alvo = x.alvo.tipo === 'jogador' ? vidaDe(x.alvo.id) ?? area(x.alvo.id) : cartaNaMesa(x.alvo.id);
    return el && alvo ? [{ el, f: medirCarta(el), alvo: meio(caixa(alvo)) }] : [];
  });

  // ------------------------------------------------ daqui para baixo só se cria e se anima (nada mais é medido)
  declarados.forEach((x, i) => investida(x.el, x.f, x.alvo, i * INVESTIDA_ESCALONA, mov));
  // os campos que vão tremer viram camada já (o custo de criar a camada fica fora do quadro do impacto)
  if (campos.length && golpes.length) {
    for (const c of campos) c.style.willChange = 'transform';
    const fimTudo = tempos[tempos.length - 1].t + TRANCO + 50;
    setTimeout(() => { for (const c of campos) c.style.willChange = ''; }, fimTudo);
  }
  let lascas = 0;
  let clarao: HTMLDivElement | undefined;
  const morreNoGolpe = new Map<ObjId, { atraso: number; fimCopia: number | null; recua?: { ux: number; uy: number; t: number } }>();
  golpes.forEach((g, i) => {
    const comCopia = mov && i < MAX_COPIAS;
    // ---- a carta voa (uma cópia na camada de cima: o campo cortaria a original e tremeria junto)
    if (comCopia) {
      const em = (k: number, s = 1, giro = 0) => `translate(${(g.ux * k).toFixed(1)}px,${(g.uy * k).toFixed(1)}px) rotate(${g.de.rot + giro}deg) scale(${s})`;
      // sem a carta na mesa (o atacante morreu nesta vista), a cópia fica no lugar dela até o golpe
      const c = copia(g.de, !g.el);
      anima(c, [
        { transform: em(0), opacity: 1 },
        { transform: em(-26, 1.07, -g.ux * 4), offset: RECUO, easing: 'cubic-bezier(.2,.9,.3,1)' },
        { transform: em(g.chega, 1.15, g.ux * 5), offset: IMPACTO, easing: 'cubic-bezier(.8,0,1,.4)' },
        { transform: em(g.chega, 1.15, g.ux * 5), offset: IMPACTO + PARADA },
        { transform: em(g.chega * 0.8, 1.04, -g.ux * 2), offset: IMPACTO + PARADA + VOLTA },
        { transform: em(0), opacity: 1 },
      ], { duration: T_GOLPE, delay: g.atraso });
      g.el?.animate([{ opacity: 0 }, { opacity: 0 }], { duration: T_GOLPE, delay: g.atraso });
    } else if (mov && g.el) {
      // além das 12 cópias: um empurrão da própria carta na direção do alvo
      const k = Math.min(34, g.chega * 0.25);
      g.el.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${(g.ux * k).toFixed(1)}px,${(g.uy * k).toFixed(1)}px)`, offset: 0.4 }, { transform: 'translate(0,0)' }], { duration: 460, delay: g.atraso, easing: 'ease-in-out' });
    }
    if (g.g.morreu) morreNoGolpe.set(g.g.atacante, { atraso: g.atraso, fimCopia: comCopia ? g.atraso + T_GOLPE : null });

    // ---- o alvo fica branco por um instante (a vida: o anel vermelho em volta)
    if (g.vida) anima(novo('fx-anel-vida', g.vida.x - 3, g.vida.y - 3, g.vida.w + 6, g.vida.h + 6), [{ opacity: 1 }, { opacity: 0 }], { duration: BRANCO, delay: g.t, easing: 'ease-out' });
    for (const x of g.alvos) {
      if (!x.f) continue;
      const b = copia({ ...x.f, img: null }, false, 'fx-branco-carta');
      anima(b, [{ opacity: 1, transform: `rotate(${x.f.rot}deg)` }, { opacity: 0, transform: `rotate(${x.f.rot}deg)` }], { duration: BRANCO, delay: g.t, easing: 'ease-out' });
      // os bloqueadores recuam com a pancada (o que morre, na cópia que fica no lugar dele)
      if (mov && x.el) x.el.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${(g.ux * 18).toFixed(1)}px,${(g.uy * 18).toFixed(1)}px) rotate(-5deg)`, offset: 0.3 }, { transform: 'translate(0,0)' }], { duration: CONTRA, delay: g.t });
      else if (mov && x.id !== undefined) morreNoGolpe.set(x.id, { atraso: 0, fimCopia: null, recua: { ux: g.ux, uy: g.uy, t: g.t } });
    }
    if (!mov || i >= MAX_COPIAS) return;

    // ---- clarão, onda e risco no ponto do impacto
    const raio = 46 + g.g.dano * 7;
    const lampejo = novo('fx-lampejo', g.x - raio, g.y - raio, raio * 2, raio * 2);
    anima(lampejo, [{ transform: 'scale(.3)', opacity: 1 }, { transform: 'scale(1.25)', opacity: 0 }], { duration: LAMPEJO, delay: g.t, easing: 'cubic-bezier(.1,.8,.3,1)' });
    const ro = raio * 1.3;
    anima(novo('fx-onda', g.x - ro, g.y - ro, ro * 2, ro * 2), [{ transform: 'scale(.15)', opacity: 0.95 }, { transform: 'scale(1)', opacity: 0 }], { duration: ONDA, delay: g.t, easing: 'cubic-bezier(.15,.8,.3,1)' });
    const larg = 150 + g.g.dano * 18, ang = (Math.atan2(g.uy, g.ux) * 180) / Math.PI + 90 + (Math.random() - 0.5) * 30;
    anima(novo('fx-risco', g.x - larg / 2, g.y - 2.5, larg, 5), [
      { transform: `rotate(${ang.toFixed(1)}deg) scaleX(.1)`, opacity: 1 },
      { transform: `rotate(${ang.toFixed(1)}deg) scaleX(1)`, opacity: 1, offset: 0.35 },
      { transform: `rotate(${ang.toFixed(1)}deg) scaleX(1.1) scaleY(.2)`, opacity: 0 },
    ], { duration: RISCO, delay: g.t, easing: 'ease-out' });
    // ---- lascas voando para a frente, num cone
    if (!o.leve) {
      const qtd = Math.min(LASCAS_GOLPE, 5 + g.g.dano, MAX_LASCAS - lascas);
      lascas += Math.max(0, qtd);
      for (let k = 0; k < qtd; k++) {
        const ang2 = Math.atan2(g.uy, g.ux) + (Math.random() - 0.5) * 2, vel = 50 + Math.random() * 90, rot = Math.random() * 360;
        const dx = Math.cos(ang2) * vel, dy = Math.sin(ang2) * vel;
        anima(novo('fx-lasca', g.x - 2, g.y - 6.5), [
          { transform: `rotate(${rot.toFixed(0)}deg)`, opacity: 1 },
          { transform: `translate(${(dx * 0.7).toFixed(1)}px,${(dy * 0.7).toFixed(1)}px) rotate(${(rot + 120).toFixed(0)}deg) scale(.9)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${dx.toFixed(1)}px,${(dy + 26).toFixed(1)}px) rotate(${(rot + 200).toFixed(0)}deg) scale(.4)`, opacity: 0 },
        ], { duration: LASCA + Math.random() * LASCA_VARIA, delay: g.t, easing: 'cubic-bezier(.2,.7,.4,1)' });
      }
    }
    // ---- o tranco dos campos na direção do golpe, que morre rápido (só translate). Composição 'replace': o tranco
    // seguinte toma o lugar do anterior (somar com 'add' tiraria a animação do compositor e ela rodaria na linha principal)
    const amp = (g.g.dano >= 5 ? 9 : g.g.dano >= 4 ? 7 : 4) * (o.leve ? 0.6 : 1);
    const p = (k: number, lado = 0) => `translate(${(g.ux * amp * k + g.uy * amp * lado).toFixed(1)}px,${(g.uy * amp * k - g.ux * amp * lado).toFixed(1)}px)`;
    for (const c of campos) c.animate([
      { transform: 'translate(0,0)' }, { transform: p(1), offset: 0.12 }, { transform: p(-0.7, 0.4), offset: 0.3 },
      { transform: p(0.35), offset: 0.52 }, { transform: p(-0.12), offset: 0.75 }, { transform: 'translate(0,0)' },
    ], { duration: TRANCO, delay: g.t, easing: 'linear' });
    // ---- a tela inteira pisca nos golpes fortes (um elemento só para a vista inteira)
    if (g.g.dano >= 4) anima(clarao ??= novo('fx-clarao', 0, 0), [{ opacity: o.leve ? 0.1 : 0.2 }, { opacity: 0 }], { duration: CLARAO, delay: g.t, easing: 'ease-out' });
  });
  // ---- a área de quem levou golpe fica vermelha nas bordas, do primeiro ao último golpe nele (uma por jogador)
  for (const [p, vi] of vinhetas) {
    const ts = golpes.slice(0, MAX_COPIAS).filter((g) => g.g.alvo.tipo === 'jogador' && g.g.alvo.id === p).map((g) => g.t);
    if (!mov || !ts.length) continue;
    const de = Math.min(...ts), dura = Math.max(...ts) - de + VINHETA;
    anima(novo('fx-vinheta', vi.x, vi.y, vi.w, vi.h), [{ opacity: 0 }, { opacity: 1, offset: (VINHETA * 0.12) / dura }, { opacity: 1, offset: 1 - VINHETA * 0.88 / dura }, { opacity: 0 }], { duration: dura, delay: de, easing: 'ease-out' });
  }

  // ------------------------------------------------ números e vida
  for (const nc of numerosCriatura) numero(nc.texto, nc.x, nc.y, 'dano pequeno', nc.t, nc.golpe && mov, nc.golpe ? nc.dano : 0);
  // quem morreu num golpe ganha o número no lugar onde estava (a carta já saiu da vista)
  for (const g of golpes) {
    if (g.g.alvo.tipo === 'bloqueadores' && g.alvos.length === 1) {
      const x = g.alvos[0];
      if (x.f && !x.el) numero(`−${g.g.dano}`, x.f.cx - 16, x.f.cy - x.f.r.height / 2 - 6, 'dano pequeno', g.t, mov, g.g.dano);
    }
    if (g.g.morreu && g.g.alvo.tipo === 'bloqueadores') {
      const contra = g.g.alvo.ids.reduce((s, id) => s + (antes.get(id) ? danoDe(antes.get(id)!) : 0), 0);
      if (contra > 0) numero(`−${contra}`, g.de.cx - 16, g.de.cy - g.de.r.height / 2 - 6, 'dano pequeno', g.t, mov, contra);
    }
  }
  for (const m of vidas) efeitoVida(m, o, mov);

  // ------------------------------------------------ mortes: rachar, tremer e voar para o cemitério ou o exílio
  for (const m of mortes) {
    const noGolpe = morreNoGolpe.get(m.c.id);
    let inicio: number, visivel = true;
    if (noGolpe?.fimCopia != null) { inicio = noGolpe.fimCopia; visivel = false; } // o atacante volta do golpe e então morre
    else if (m.t !== undefined) inicio = m.t + MORTE_DEPOIS;
    else inicio = primeiro ? primeiro + MORTE_DEPOIS : MORTE_SEM_GOLPE;
    morte(m.f, m.destino, inicio, visivel, mov, noGolpe?.recua);
  }
}

/** um número que aparece no tempo `t`: no golpe, batendo (cresce com o dano); fora dele, subindo como sempre */
function numero(texto: string, x: number, y: number, classe: string, t: number, bate: boolean, dano: number): void {
  const e = novo(`fx-numero ${classe}`, x, y);
  e.textContent = texto;
  const reduzir = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (bate) {
    e.style.fontSize = `${Math.round(28 * (1 + Math.min(1.1, (dano - 1) * 0.16)))}px`;
    anima(e, [
      { transform: 'translate(0,-6px) scale(2.3) rotate(-8deg)', opacity: 0 },
      { transform: 'translate(0,0) scale(.9) rotate(2deg)', opacity: 1, offset: 0.08 },
      { transform: 'translate(0,-3px) scale(1.06) rotate(0deg)', opacity: 1, offset: 0.15 },
      { transform: 'translate(0,-10px) scale(1)', opacity: 1, offset: 0.72 },
      { transform: 'translate(0,-28px) scale(.96)', opacity: 0 },
    ], { duration: NUMERO_GOLPE, delay: t, easing: 'ease-out' });
  } else if (reduzir) {
    anima(e, [{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], { duration: NUMERO, delay: t, easing: 'ease-out' });
  } else {
    anima(e, [
      { transform: 'translate(0,8px) scale(.7)', opacity: 0 },
      { transform: 'translate(0,0) scale(1.08)', opacity: 1, offset: 0.14 },
      { transform: 'translate(0,-24px) scale(1.02)', opacity: 1, offset: 0.7 },
      { transform: 'translate(0,-34px) scale(1)', opacity: 0 },
    ], { duration: NUMERO, delay: t, easing: 'ease-out' });
  }
}

/** a vida que mudou: número, brilho na vida e no retrato, tremida e tranco do avatar, e a área vermelha nas bordas.
 * Os brilhos são desenhados uma vez e só acendem e apagam; no modo Desempenho ficam de fora */
function efeitoVida(m: VidaMedida, o: Opcoes, mov: boolean): void {
  const dano = m.d < 0;
  const cor = dano ? VERMELHO : VERDE;
  // na sua área a vida fica embaixo do avatar, na base da mesa: o número sai à direita dela; nos outros, embaixo
  const [x, y] = m.local ? [m.vida.x + m.vida.w + 10, m.vida.y + m.vida.h / 2 - 18] : [m.vida.x + m.vida.w / 2 - 22, m.vida.y + m.vida.h + 4];
  numero(dano ? `−${-m.d}` : `+${m.d}`, x, y, dano ? 'dano' : 'vida', m.t, dano && m.noGolpe && mov, -m.d);
  if (!o.leve) {
    const b = novo('fx-brilho-vida', m.vida.x, m.vida.y, m.vida.w, m.vida.h);
    b.style.setProperty('--c', cor);
    anima(b, [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: VIDA_BRILHO, delay: m.t, easing: 'ease-out' });
    for (const r of m.retratos) anima(novo(dano ? 'fx-retrato-dano' : 'fx-retrato-cura', r.x, r.y, r.w, r.h), [{ opacity: 0 }, { opacity: 1, offset: dano ? 0.15 : 0.3 }, { opacity: 0 }], { duration: AVATAR_BRILHO, delay: m.t, easing: 'ease-out' });
    if (dano && m.area) anima(novo('fx-brilho-area', m.area.x, m.area.y, m.area.w, m.area.h), [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0 }], { duration: AREA_BRILHO, delay: m.t, easing: 'ease-out' });
  }
  if (dano && mov) {
    m.vidaEl.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(2px)' }, { transform: 'translateX(0)' }], { duration: TREME_VIDA, delay: m.t, easing: 'ease-out' });
    m.avatar?.animate([{ transform: 'scale(1)' }, { transform: 'scale(.93)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }], { duration: TRANCO_AVATAR, delay: m.t, easing: 'ease-out' });
  }
}

/** a carta que morreu: fica no lugar (`visivel`) até a vez dela, racha (clarão branco), escurece, treme e voa para a zona
 * (sem zona, a ficha que deixa de existir: some no lugar) */
function morte(f: Foto, destino: Caixa | null, inicio: number, visivel: boolean, mov: boolean, recua?: { ux: number; uy: number; t: number }): void {
  const c = copia(f, visivel, 'fx-carta fx-morte');
  if (!mov) { anima(c, [{ opacity: 1 }, { opacity: 0 }], { duration: SOME, delay: inicio, easing: 'ease-out' }); return; }
  const branco = veu(c, 'fx-branco'), escuro = veu(c, 'fx-escuro');
  const g = (s: string) => `${s} rotate(${f.rot}deg)`;
  if (recua) anima(c, [{ transform: g('translate(0,0)') }, { transform: `translate(${(recua.ux * 18).toFixed(1)}px,${(recua.uy * 18).toFixed(1)}px) rotate(${f.rot - 5}deg)`, offset: 0.3 }, { transform: g('translate(0,0)') }], { duration: CONTRA, delay: recua.t });
  branco.animate([{ opacity: 0 }, { opacity: 0.9, offset: 0.1 }, { opacity: 0, offset: 0.3 }, { opacity: 0 }], { duration: MORTE, delay: inicio });
  escuro.animate([{ opacity: 0 }, { opacity: 0, offset: 0.25 }, { opacity: 1 }], { duration: MORTE, delay: inicio });
  const [x1, y1] = destino ? meio(destino) : [f.cx, f.cy - 30];
  const dx = x1 - f.cx, dy = y1 - f.cy;
  anima(c, [
    { transform: `translate(0,0) rotate(${f.rot}deg) scale(1)`, opacity: 1 },
    { transform: `translate(-6px,2px) rotate(${f.rot - 2}deg) scale(1.03)`, opacity: 1, offset: 0.07 },
    { transform: `translate(6px,-2px) rotate(${f.rot + 2}deg) scale(1.03)`, opacity: 1, offset: 0.14 },
    { transform: `translate(0,-12px) rotate(${f.rot - 6}deg) scale(1.05)`, opacity: 1, offset: 0.3 },
    { transform: `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) rotate(${f.rot + 18}deg) scale(.42)`, opacity: 0 },
  ], { duration: MORTE, delay: inicio, easing: 'cubic-bezier(.4,0,.6,1)' });
}

/** o ataque declarado: o atacante novo toma impulso e avança um pouco na direção do alvo, e um anel vermelho acende e
 * apaga em volta dele, acompanhando a investida (o anel fixo de atacante continua na carta) */
function investida(el: HTMLElement, f: Foto, alvo: readonly [number, number], atraso: number, mov: boolean): void {
  const d = Math.hypot(alvo[0] - f.cx, alvo[1] - f.cy) || 1, ux = (alvo[0] - f.cx) / d, uy = (alvo[1] - f.cy) / d;
  const quadros = (giro: number): Keyframe[] => {
    const t = (k: number, s: number) => `translate(${(ux * k).toFixed(1)}px,${(uy * k).toFixed(1)}px)${giro ? ` rotate(${giro}deg)` : ''} scale(${s})`;
    return [{ transform: t(0, 1) }, { transform: t(-8, 0.96), offset: 0.3 }, { transform: t(26, 1.07), offset: 0.58, easing: 'cubic-bezier(.7,0,1,.5)' }, { transform: t(0, 1) }];
  };
  const anel = novo('fx-anel', f.cx - f.w / 2 - 3, f.cy - f.h / 2 - 3, f.w + 6, f.h + 6);
  anel.style.borderRadius = `${(f.w * 0.07).toFixed(1)}px`;
  if (f.rot) anel.style.transform = `rotate(${f.rot}deg)`;
  if (mov) {
    el.animate(quadros(0), { duration: INVESTIDA, delay: atraso, easing: 'cubic-bezier(.3,.7,.3,1)' });
    anima(anel, quadros(f.rot), { duration: INVESTIDA, delay: atraso, easing: 'cubic-bezier(.3,.7,.3,1)' });
  }
  // acende depois que a carta terminou de virar (a transição de virar leva ~0,2 s)
  anima(anel, [{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], { duration: ANEL, delay: atraso + ANEL_DEPOIS, easing: 'ease-out' });
}
