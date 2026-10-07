// Efeitos que todos veem: dano e vida (número flutuando, tremida e brilho na vida), criaturas que
// saem do campo indo para o cemitério ou o exílio, atacantes avançando no dano de combate, e os
// sons de cada coisa. Tudo sai da diferença entre uma vista e a seguinte, então vale também para
// as jogadas dos outros. Os elementos dos efeitos ficam fora da mesa e somem sozinhos.

import { useLayoutEffect, useRef } from 'preact/hooks';
import type { GameView, ObjView } from '../../../motor/view.ts';
import { tocar } from '../sons.ts';

const movimentoReduzido = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const centro = (r: DOMRect) => [r.left + r.width / 2, r.top + r.height / 2] as const;

function numero(texto: string, x: number, y: number, classe: string, atraso = 0): void {
  setTimeout(() => {
    const e = document.createElement('div');
    e.className = `numero-efeito ${classe}`;
    e.textContent = texto;
    e.style.left = `${Math.round(x)}px`;
    e.style.top = `${Math.round(y)}px`;
    document.body.appendChild(e);
    setTimeout(() => e.remove(), 1500);
  }, atraso);
}

function animar(el: Element | null, quadros: Keyframe[], opcoes: KeyframeAnimationOptions): void {
  if (el && 'animate' in el) (el as HTMLElement).animate(quadros, opcoes);
}

/** vida que mudou: número ao lado da vida, tremida e brilho vermelho (dano) ou brilho verde (vida) */
function efeitoVida(jogador: number, delta: number, eu: boolean, reduzir: boolean, atraso: number): void {
  const area = document.querySelector(`[data-jogador="${jogador}"]`);
  const vida = area?.querySelector('.vida-n');
  if (!vida) return;
  const r = vida.getBoundingClientRect();
  // na sua área a vida fica no alto à direita da faixa; o número sai à esquerda dela; nos outros, embaixo
  const [x, y] = eu ? [r.left - 74, r.top + r.height / 2 - 18] : [r.left + r.width / 2 - 22, r.bottom + 4];
  numero(delta < 0 ? `−${-delta}` : `+${delta}`, x, y, `${delta < 0 ? 'dano' : 'vida'} ${reduzir ? 'parado' : ''}`, atraso);
  setTimeout(() => {
    const cor = delta < 0 ? '242, 85, 85' : '34, 211, 107';
    animar(vida, [
      { boxShadow: `0 0 0 0 rgba(${cor}, 0)` },
      { boxShadow: `0 0 0 2px rgba(${cor}, .95), 0 0 28px 6px rgba(${cor}, .55)`, offset: 0.25 },
      { boxShadow: `0 0 0 0 rgba(${cor}, 0)` },
    ], { duration: 900, easing: 'ease-out' });
    if (delta < 0 && !reduzir) {
      animar(vida, [{ translate: '0 0' }, { translate: '-5px 0' }, { translate: '5px 0' }, { translate: '-3px 0' }, { translate: '2px 0' }, { translate: '0 0' }], { duration: 420, easing: 'ease-out' });
    }
    if (delta < 0) animar(area!, [{ boxShadow: 'inset 0 0 0 0 rgba(242, 85, 85, 0)' }, { boxShadow: 'inset 0 0 110px rgba(242, 85, 85, .42)', offset: 0.2 }, { boxShadow: 'inset 0 0 0 0 rgba(242, 85, 85, 0)' }], { duration: 900, easing: 'ease-out' });
  }, atraso);
}

/** a carta que saiu do campo "voa" até o cemitério ou o exílio do dono */
function efeitoSaida(r: DOMRect, img: string | null, destino: Element | null, reduzir: boolean): void {
  if (!img) return;
  const f = document.createElement('div');
  f.className = 'fantasma-efeito';
  f.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
  f.innerHTML = `<img src="${img}" alt="">`;
  document.body.appendChild(f);
  const fim = () => f.remove();
  if (reduzir || !destino) {
    f.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 450, easing: 'ease-out' }).onfinish = fim;
    return;
  }
  const [x0, y0] = centro(r);
  const [x1, y1] = centro(destino.getBoundingClientRect());
  f.animate([
    { translate: '0 0', scale: '1', rotate: '0deg', opacity: 0.95, filter: 'grayscale(0)' },
    { translate: `0 -10px`, scale: '1.04', rotate: '-4deg', opacity: 0.95, filter: 'grayscale(.4)', offset: 0.18 },
    { translate: `${x1 - x0}px ${y1 - y0}px`, scale: '.42', rotate: '14deg', opacity: 0, filter: 'grayscale(.9)' },
  ], { duration: 720, easing: 'cubic-bezier(.4, 0, .6, 1)' }).onfinish = fim;
}

interface Foto { r: DOMRect; img: string | null }

/**
 * Liga os efeitos e os sons à vista da partida. `efeitos` desliga só a parte visual (os sons têm
 * as próprias chaves); "reduzir movimento" do sistema tira tremidas e deslocamentos.
 */
export function useEfeitos(v: GameView, eu: number, efeitos: boolean): void {
  const anterior = useRef<GameView | null>(null);
  const fotos = useRef(new Map<number, Foto>());

  useLayoutEffect(() => {
    const a = anterior.current;
    anterior.current = v;
    const fotografar = () => {
      const m = new Map<number, Foto>();
      for (const el of document.querySelectorAll<HTMLElement>('.campo [data-obj]')) {
        m.set(Number(el.dataset.obj), { r: el.getBoundingClientRect(), img: el.querySelector('img')?.getAttribute('src') ?? null });
      }
      fotos.current = m;
    };
    if (!a || a === v) { fotografar(); return; }

    if (a.turn.number > 0 && v.turn.number !== a.turn.number) tocar('turno', v.turn.active === eu ? 1 : 0.7);

    const reduzir = movimentoReduzido();
    const vidaAntes = new Map(a.players.map((p) => [p.id, p.life]));
    const mudancas = v.players.map((p) => ({ id: p.id, d: p.life - (vidaAntes.get(p.id) ?? p.life) })).filter((x) => x.d !== 0);
    const antes = new Map(a.battlefield.map((o) => [o.id, o]));
    const danoCriatura = v.battlefield.filter((o) => (antes.get(o.id)?.damage ?? o.damage) < o.damage);
    const agora = new Set(v.battlefield.map((o) => o.id));
    const sairam = a.battlefield.filter((o) => !agora.has(o.id) && o.types.includes('Creature'));

    const danos = mudancas.filter((x) => x.d < 0);
    const curas = mudancas.filter((x) => x.d > 0);
    if (danos.length) tocar('dano', danos.some((x) => x.id === eu) ? 1 : 0.55);
    if (curas.length) tocar('vida', curas.some((x) => x.id === eu) ? 1 : 0.55);

    if (efeitos) {
      // dano de combate: os atacantes da vista anterior avançam na direção de quem atacaram
      const combate = a.combat?.attackers ?? [];
      const houveDano = danos.length > 0 || danoCriatura.length > 0 || sairam.length > 0;
      const avancam = combate.length > 0 && houveDano && !reduzir;
      if (avancam) {
        for (const at of combate) {
          const el = document.querySelector(`.campo [data-obj="${at.id}"]`);
          const alvo = at.target.kind === 'player' ? document.querySelector(`[data-jogador="${at.target.id}"] .vida-n`) : document.querySelector(`[data-obj="${at.target.id}"]`);
          if (!el || !alvo) continue;
          const [x0, y0] = centro(el.getBoundingClientRect());
          const [x1, y1] = centro(alvo.getBoundingClientRect());
          const dist = Math.hypot(x1 - x0, y1 - y0) || 1;
          const passo = Math.min(34, dist * 0.25);
          animar(el, [{ translate: '0 0' }, { translate: `${((x1 - x0) / dist) * passo}px ${((y1 - y0) / dist) * passo}px`, offset: 0.4 }, { translate: '0 0' }], { duration: 460, easing: 'ease-in-out' });
        }
      }
      const atraso = avancam ? 190 : 0;
      for (const m of mudancas) efeitoVida(m.id, m.d, m.id === eu, reduzir, atraso);
      for (const o of danoCriatura) {
        const el = document.querySelector(`.campo [data-obj="${o.id}"]`);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        numero(`−${o.damage - (antes.get(o.id)?.damage ?? 0)}`, r.left + r.width / 2 - 16, r.top - 6, `dano pequeno ${reduzir ? 'parado' : ''}`, atraso);
      }
      // quem morreu ou foi exilado sai voando para a zona do dono
      for (const o of sairam) {
        const foto = fotos.current.get(o.id);
        if (!foto) continue;
        const destino = zonaDestino(a, v, o);
        if (destino === null) continue;
        setTimeout(() => efeitoSaida(foto.r, foto.img, destino, reduzir), atraso + 60);
      }
    }
    fotografar();
  }, [v]);
}

/** cemitério ou exílio do dono, conforme a zona que cresceu; null se foi para a mão ou o grimório */
function zonaDestino(a: GameView, v: GameView, o: ObjView): Element | null {
  const area = document.querySelector(`[data-jogador="${o.owner}"]`);
  const zonas = area?.querySelectorAll('.botao-zona .slot');
  const cem = (x: GameView) => x.players.find((p) => p.id === o.owner)?.graveyard.length ?? 0;
  const exi = (x: GameView) => x.exile.filter((e) => e.owner === o.owner).length;
  if (cem(v) > cem(a)) return zonas?.[0] ?? null;
  if (exi(v) > exi(a)) return zonas?.[1] ?? null;
  return null;
}
