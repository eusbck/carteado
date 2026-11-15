// O palco do Como jogar: zonas desenhadas em linha clara, cartas estilizadas e uma câmera. O desenho é feito uma vez;
// depois o motor só escreve transform e opacity em cada carta, a cada quadro, seguindo o ponto do filme que a rolagem
// pede (com uma perseguição suave, para a rodinha do mouse não dar trancos). Nada aqui redesenha pelo Preact enquanto
// a página rola.

import { useEffect, useRef } from 'preact/hooks';
import { CartaArte } from './CartaArte.tsx';
import { ARTES, ATORES, BIB, CAMPO, CARTA, CEM, CMD, MARCAS, MUNDO, VIDA_EU, VIDA_OP, cenaEm, estadoEm, marcaEm } from './filme.ts';
import type { Textos } from './textos.ts';

/** irPara: persegue um ponto do filme (suave); tocar: anda até o ponto num ritmo fixo, quadro a quadro */
export interface Motor { irPara(pos: number, imediato?: boolean): void; tocar(alvo: number, msPorQuadro: number): void }

const semMovimento = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const MARCA_IDS = Object.keys(MARCAS);
const px = (p: { x: number; y: number }) => ({ left: `${p.x}px`, top: `${p.y}px` });

export function Palco({ t, registrar }: { t: Textos['palco']; registrar: (m: Motor) => void }) {
  const caixa = useRef<HTMLDivElement>(null);
  const mundo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiz = caixa.current!, mu = mundo.current!;
    const cartas = ATORES.map((id) => {
      const el = raiz.querySelector<HTMLElement>(`[data-ator="${id}"]`)!;
      return { id, el, giro: el.querySelector<HTMLElement>('.tc-giro')!, sombra: el.querySelector<HTMLElement>('.tc-sombra')!, brilho: el.querySelector<HTMLElement>('.tc-brilho')!, z: '', ult: '' };
    });
    const marcas = MARCA_IDS.map((id) => ({ id, el: raiz.querySelector<HTMLElement>(`[data-marca="${id}"]`)!, ult: '' }));
    let ultMundo = '', ultVeu = '', ultVidaO = '', ultCmd = '';
    const vidaEu = raiz.querySelector<HTMLElement>('.tp-vida.eu strong')!, vidaOp = raiz.querySelector<HTMLElement>('.tp-vida.op strong')!;
    const vidas = [...raiz.querySelectorAll<HTMLElement>('.tp-vida')];
    const comando = raiz.querySelector<HTMLElement>('.tp-zona.comando')!;
    const veu = raiz.querySelector<HTMLElement>('.tp-veu')!;
    const fases = [...raiz.querySelectorAll<HTMLElement>('.tp-fases li')];
    const faixa = raiz.querySelector<HTMLElement>('.tp-fases')!;
    const calmo = semMovimento();

    let W = 0, H = 0, escala = 1;
    let cur = 0, alvo = 0, raf = 0, antes = 0;
    /** a cena tocando: de onde, para onde, quando começou e quanto dura */
    let toque: { de: number; para: number; t0: number; dur: number } | null = null;
    let ultVida = '', ultFase = -2;

    const desenhar = (pos: number) => {
      const c = cenaEm(pos);
      const tm = `translate(${W / 2}px, ${H / 2}px) scale(${escala * c.cam.z}) translate(${-c.cam.x}px, ${-c.cam.y}px)`;
      if (tm !== ultMundo) { mu.style.transform = tm; ultMundo = tm; }
      for (const k of cartas) {
        const e = estadoEm(pos, k.id, calmo);
        const chave = `${e.x.toFixed(2)}|${e.y.toFixed(2)}|${e.r.toFixed(2)}|${e.s.toFixed(3)}|${e.face.toFixed(3)}|${e.o.toFixed(3)}|${e.brilho.toFixed(3)}|${e.voo.toFixed(3)}`;
        if (chave === k.ult) continue;
        k.ult = chave;
        k.el.style.transform = `translate3d(${e.x - CARTA.w / 2}px, ${e.y - CARTA.h / 2}px, 0) rotate(${e.r}deg) scale(${e.s})`;
        k.el.style.opacity = String(e.o);
        const z = String(Math.round(e.z));
        if (z !== k.z) { k.el.style.zIndex = z; k.z = z; }
        k.giro.style.transform = `rotateY(${(1 - e.face) * 180}deg)`;
        k.sombra.style.transform = `translate(${4 + e.voo * 16}px, ${7 + e.voo * 30}px) scale(${1 + e.voo * 0.08})`;
        k.sombra.style.opacity = String(0.45 - e.voo * 0.15);
        k.brilho.style.opacity = String(e.brilho);
      }
      for (const m of marcas) {
        const e = marcaEm(pos, m.id);
        const chave = `${e.o.toFixed(3)}|${e.x.toFixed(1)}|${e.y.toFixed(1)}`;
        if (chave === m.ult) continue;
        m.ult = chave;
        m.el.style.opacity = String(e.o);
        m.el.style.transform = `translate(${e.x}px, ${e.y}px) translate(-50%, -50%) scale(${0.7 + 0.3 * e.o})`;
      }
      const v = `${c.vida[0]}|${c.vida[1]}`;
      if (v !== ultVida) { vidaEu.textContent = String(c.vida[0]); vidaOp.textContent = String(c.vida[1]); ultVida = v; }
      const vo = c.vidaO.toFixed(3), co = c.comandoO.toFixed(3), ve = c.veu.toFixed(3);
      if (vo !== ultVidaO) { for (const el of vidas) el.style.opacity = vo; ultVidaO = vo; }
      if (co !== ultCmd) { comando.style.opacity = co; ultCmd = co; }
      if (ve !== ultVeu) { veu.style.opacity = ve; ultVeu = ve; }
      if (c.fase !== ultFase) {
        fases.forEach((f, i) => f.classList.toggle('atual', i === c.fase));
        faixa.classList.toggle('fora', c.fase < 0);
        ultFase = c.fase;
      }
    };

    const medir = () => {
      W = raiz.clientWidth; H = raiz.clientHeight;
      ultMundo = '';
      escala = Math.min(W / MUNDO.w, H / MUNDO.h);
      desenhar(cur);
    };
    const ro = new ResizeObserver(medir);
    ro.observe(raiz);
    medir();

    // persegue o ponto pedido: perto de 0,12 s para alcançar, sem passar do ponto
    const tick = (agora: number) => {
      const dt = Math.min(64, agora - antes);
      antes = agora;
      if (toque) {
        const t = Math.min(1, (agora - toque.t0) / toque.dur);
        cur = toque.de + (toque.para - toque.de) * t;
        if (t >= 1) { cur = alvo = toque.para; toque = null; }
      } else {
        cur += (alvo - cur) * (1 - Math.exp(-dt / 120));
        if (Math.abs(alvo - cur) < 0.0008) cur = alvo;
      }
      desenhar(cur);
      raf = cur === alvo && !toque ? 0 : requestAnimationFrame(tick);
      if (!raf) delete raiz.dataset.tocando;
    };
    registrar({
      tocar(para, msPorQuadro) {
        alvo = para;
        if (calmo) { cancelAnimationFrame(raf); raf = 0; toque = null; cur = para; desenhar(para); return; }
        toque = { de: cur, para, t0: performance.now(), dur: Math.max(1, Math.abs(para - cur) * msPorQuadro) };
        if (!raf) { antes = performance.now(); raf = requestAnimationFrame(tick); raiz.dataset.tocando = '1'; }
      },
      irPara(pos, imediato) {
        toque = null;
        alvo = pos;
        if (imediato || calmo) { cancelAnimationFrame(raf); raf = 0; cur = pos; desenhar(pos); return; }
        if (!raf) { antes = performance.now(); raf = requestAnimationFrame(tick); }
      },
    });
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const campo = { left: `${CAMPO.x1}px`, top: `${CAMPO.y1}px`, width: `${CAMPO.x2 - CAMPO.x1}px`, height: `${CAMPO.y2 - CAMPO.y1}px` };
  return (
    <div class="tp" ref={caixa} role="img" aria-label={t.rotulo}>
      <div class="tp-mundo" ref={mundo} style={{ width: `${MUNDO.w}px`, height: `${MUNDO.h}px` }}>
        <ol class="tp-fases fora" aria-hidden="true" style={{ left: `${CAMPO.x1}px`, width: `${CAMPO.x2 - CAMPO.x1}px` }}>
          {t.fases.map((f, i) => <li key={i}>{f}</li>)}
        </ol>
        <div class="tp-campo" style={campo}><i class="tp-meio" /><span class="tp-lado op">{t.oponente}</span><span class="tp-lado eu">{t.voce}</span></div>
        <div class="tp-zona" style={px(BIB)}><span>{t.grimorio}</span></div>
        <div class="tp-zona" style={px(CEM)}><span>{t.cemiterio}</span></div>
        <div class="tp-zona comando" style={px(CMD)}><span>{t.comando}</span></div>
        {[0, 1, 2, 3].map((i) => <div key={i} class="tp-pilha" style={{ left: `${BIB.x - 6 + i * 1.5}px`, top: `${BIB.y + 8 - i * 2.5}px` }} />)}
        <div class="tp-vida op" style={px(VIDA_OP)}><strong>40</strong><span>{t.oponente}</span></div>
        <div class="tp-vida eu" style={px(VIDA_EU)}><strong>40</strong><span>{t.voce}</span></div>
        <div class="tp-veu" />
        {ATORES.map((id) => (
          <div key={id} class="tc" data-ator={id} style={{ width: `${CARTA.w}px`, height: `${CARTA.h}px` }}>
            <div class="tc-sombra" />
            <div class="tc-giro">
              <div class="tc-frente"><CartaArte arte={ARTES[id]} /></div>
              <div class="tc-verso verso" />
            </div>
            <div class="tc-brilho" />
          </div>
        ))}
        {MARCA_IDS.map((id) => {
          const m = MARCAS[id];
          return <span key={id} class={`tp-marca ${m.tipo}`} data-marca={id}>{(t.marcas as Record<string, string>)[m.t] ?? m.t}</span>;
        })}
      </div>
    </div>
  );
}
