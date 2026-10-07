// Área de um jogador: arte do comandante ao fundo, nome e vida, o campo de batalha com cada
// permanente na sua posição e a fileira de zonas (comando, mão, grimório, cemitério, exílio).

import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ObjId } from '../../../motor/types.ts';
import type { ObjView, PlayerView } from '../../../motor/view.ts';
import { nomeCarta } from '../cartas.ts';
import { IconeVida } from '../icones.tsx';
import { arrumar } from './arrumacao.ts';
import { Carta, type Realce, type Selo } from './Carta.tsx';
import { Simbolos } from './Simbolos.tsx';

/** como a carta aparece no combate: selo e, para quem você está marcando para atacar, inclinada */
export interface EstadoCombate { selo: Selo; inclinada?: boolean; ativa?: boolean }

export interface AreaProps {
  j: PlayerView;
  /** permanentes que o jogador controla, sem as Auras e Equipamentos presos a algo */
  objs: ObjView[];
  anexos: Map<ObjId, ObjView[]>;
  comandantes: ObjView[];
  exilio: ObjView[];
  eu: boolean;
  ativo: boolean;
  decidindo: boolean;
  compacta: boolean;
  duelo: boolean;
  cor: string;
  fundo: string | null;
  realce: (o: ObjView) => Realce;
  combate: (o: ObjView) => EstadoCombate | undefined;
  onCarta: (o: ObjView, r: DOMRect) => void;
  onZoom: (o: ObjView | null, r?: DOMRect) => void;
  jogadorRealce: 'escolhivel' | 'escolhido' | null;
  onJogador?: () => void;
  /** clique no espaço da área (não numa carta): escolher este jogador como alvo de um ataque */
  onCliqueArea?: () => void;
  onZona: (zona: 'graveyard' | 'exile') => void;
  /** a sua mão (só na sua área) */
  mao?: ObjView[];
  /** largura à direita do campo que fica livre para a coluna da pilha e das decisões */
  reservaDireita?: number;
  /** posições escolhidas (de 0 a 1 dentro do campo), pelo id do objeto */
  posicoes?: Record<string, [number, number]>;
  /** carta sendo arrastada agora (fica apagada no lugar de origem) */
  arrastando?: ObjId | null;
  /** começo de arrasto de uma permanente sua no campo */
  onPegarCampo?: (o: ObjView, ev: PointerEvent, el: HTMLElement) => void;
  /** começo de arrasto e duplo clique numa carta da sua mão */
  onPegarMao?: (o: ObjView, ev: PointerEvent, el: HTMLElement) => void;
  onDuploMao?: (o: ObjView, r: DOMRect) => void;
  /** carta que você está conjurando, tracejada onde você soltou (x e y de 0 a 1 no campo) */
  conjurando?: { o: ObjView; x: number; y: number } | null;
  /** clique direito numa carta, e no espaço vazio da área */
  onMenuCarta?: (o: ObjView, ev: MouseEvent) => void;
  onMenuArea?: (ev: MouseEvent) => void;
}

const PROPORCAO = 88 / 63;
const limitar = (min: number, x: number, max: number) => Math.round(Math.max(min, Math.min(max, x)));

const NOME_CONTADOR: Record<string, string> = { poison: 'veneno', energy: 'energia', experience: 'experiência', rad: 'radiação' };

function useTamanho<T extends HTMLElement>(): [{ current: T | null }, { w: number; h: number }] {
  const ref = useRef<T>(null);
  const [t, setT] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setT((a) => (a.w === el.clientWidth && a.h === el.clientHeight ? a : { w: el.clientWidth, h: el.clientHeight }));
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, t];
}

export function AreaJogador(p: AreaProps) {
  const { j } = p;
  const [ref, tam] = useTamanho<HTMLElement>();

  // medidas que dependem do tamanho da área
  const wz = p.compacta ? (p.duelo ? limitar(44, tam.h * .13, 56) : limitar(34, tam.h * .1, 42)) : limitar(54, tam.h * .13, 76);
  const zonasH = Math.round(wz * PROPORCAO) + 26;
  const wm = limitar(78, tam.h * .21, 120);
  // a sua área começa abaixo da faixa de fases (os selos de combate sobem um pouco acima das cartas)
  const topo = p.compacta ? 44 : 58;
  const baixo = p.mao ? Math.max(zonasH + 4, Math.round(wm * PROPORCAO * .78) + 22) : zonasH;
  const campoW = Math.max(0, tam.w - 24 - (p.reservaDireita ?? 0));
  const campoH = Math.max(0, tam.h - topo - baixo);
  const wBase = p.compacta ? (p.duelo ? limitar(54, tam.h * .19, 84) : limitar(40, tam.h * .15, 62)) : limitar(62, tam.h * .17, 92);

  // quem tem posição escolhida fica onde a pessoa pôs; os outros seguem a arrumação padrão
  const posicoes = p.posicoes ?? {};
  const livres = useMemo(() => p.objs.filter((o) => !posicoes[o.id]), [p.objs, posicoes]);
  const arr = useMemo(() => {
    const a = arrumar(livres, p.anexos, campoW, campoH, wBase, p.compacta ? 28 : 40);
    const passoAnexo = Math.round(a.w * .2);
    let z = 200;
    for (const o of p.objs) {
      const q = posicoes[o.id];
      if (!q) continue;
      const presos = p.anexos.get(o.id) ?? [];
      const x = Math.round(q[0] * campoW), y = Math.round(q[1] * campoH);
      presos.forEach((an, i) => a.pos.set(an.id, { x, y: y - (presos.length - i) * passoAnexo, z: z++ }));
      a.pos.set(o.id, { x, y, z: z++ });
    }
    return a;
  }, [livres, p.objs, p.anexos, posicoes, campoW, campoH, wBase, p.compacta]);
  const todosNoCampo = useMemo(() => [...p.objs, ...p.objs.flatMap((o) => p.anexos.get(o.id) ?? [])], [p.objs, p.anexos]);

  const contadores = Object.entries(j.counters).filter(([, n]) => n > 0);
  const danoCmd = j.commanderDamage.filter((d) => d.amount > 0);
  const classes = ['area', p.eu ? 'area-eu' : 'area-oponente', p.ativo ? 'area-ativa' : '', p.decidindo ? 'area-decidindo' : '', j.left ? 'area-fora' : '', p.compacta ? 'compacta' : '', p.jogadorRealce ? `alvo-${p.jogadorRealce}` : ''].filter(Boolean).join(' ');
  const topoCemiterio = j.graveyard[j.graveyard.length - 1];
  // na sua área, a reserva fica do lado da vida (à esquerda ela cairia embaixo da faixa de fases)
  const reserva = <span class="selo reserva" title="Reserva de mana"><span class="rot">Reserva</span><Simbolos custo={j.manaPool} tam={16} /></span>;
  const topoExilio = p.exilio[p.exilio.length - 1];

  // leque da mão: cabe entre os grupos de zonas
  const mao = p.mao ?? [];
  const n = mao.length;
  const livre = Math.max(wm, tam.w - 2 * (3 * (wz + 12) + 30));
  const passo = n > 1 ? Math.min(wm * .74, (livre - wm) / (n - 1)) : wm;
  const meio = (n - 1) / 2;
  const giro = Math.min(3, 24 / Math.max(n, 1));
  const curva = meio > 0 ? Math.min(2.4, 22 / (meio * meio)) : 0;

  return (
    <section ref={ref} class={`${classes} ${p.onCliqueArea ? 'area-clicavel' : ''}`} data-jogador={j.id} style={{ '--cor': p.cor, '--zonas-h': `${baixo}px`, '--wz': `${wz}px` }} aria-label={`Área de ${j.name}`}
      onClick={p.onCliqueArea ? (e) => { if (!(e.target as HTMLElement).closest('[data-obj], button')) p.onCliqueArea!(); } : undefined}
      onContextMenu={p.onMenuArea ? (e) => { e.preventDefault(); p.onMenuArea!(e); } : undefined}>
      {p.fundo && <div class="area-fundo" style={{ backgroundImage: `url(${p.fundo})` }} />}
      <header class="area-topo">
        <div class="area-selos">
          <button type="button" class="tag-jogador" onClick={p.onJogador} disabled={!p.onJogador} aria-label={`${j.name}, ${j.life} de vida`}>{j.name}</button>
          {p.ativo && <span class="selo turno">turno</span>}
          {p.decidindo && !p.eu && <span class="selo decidindo">decidindo</span>}
          {j.monarch && <span class="selo">monarca</span>}
          {j.left && <span class="selo etiqueta alerta">{j.won ? 'venceu' : 'fora da partida'}</span>}
          {contadores.map(([k, q]) => <span class="selo" key={k}>{q} {NOME_CONTADOR[k] ?? k}</span>)}
          {j.manaPool && !p.eu && reserva}
        </div>
        <div class="vida">
          {j.manaPool && p.eu && reserva}
          <button type="button" class="vida-n" onClick={p.onJogador} disabled={!p.onJogador} title="Vida" aria-label={`Vida de ${j.name}: ${j.life}`}><IconeVida />{j.life}</button>
          {danoCmd.length > 0 && (
            <div class="dano-cmd" title="Dano de comandante recebido (CR 903.10a)">
              {danoCmd.map((d) => <span key={d.from}>{nomeCarta(d.from, d.from).split(',')[0]} · {d.amount}</span>)}
            </div>
          )}
        </div>
      </header>

      <div class="campo" aria-label="Campo de batalha">
        {todosNoCampo.map((o) => {
          const pos = arr.pos.get(o.id);
          if (!pos) return null;
          const c = p.combate(o);
          const classe = [p.arrastando === o.id ? 'sendo-arrastada' : '', c?.inclinada ? 'inclinada' : '', c?.ativa ? 'combate-ativa' : ''].filter(Boolean).join(' ');
          return (
            <Carta key={o.id} o={o} realce={p.realce(o)} selo={c?.selo} onClick={p.onCarta} onZoom={p.onZoom} onMenu={p.onMenuCarta}
              onPointerDown={p.onPegarCampo} classe={classe || undefined}
              estilo={{ left: `${pos.x}px`, top: `${pos.y}px`, zIndex: pos.z, '--w': `${arr.w}px` }} />
          );
        })}
        {arr.leques.map((g, i) => <span key={i} class="grupo-n" style={{ left: `${g.x}px`, top: `${g.y}px` }}>×{g.n}</span>)}
        {p.conjurando && (
          <Carta o={p.conjurando.o} classe="conjurando" estilo={{ left: `${Math.round(p.conjurando.x * campoW)}px`, top: `${Math.round(p.conjurando.y * campoH)}px`, zIndex: 450, '--w': `${Math.round(arr.w * 1.1)}px` }} />
        )}
        {p.objs.length === 0 && !p.compacta && <p class="campo-vazio">Nenhum permanente</p>}
      </div>

      <footer class="zonas">
        <div class="zonas-grupo">
          <div class="zona" aria-label="Zona de comando">
            <span class="zona-rotulo">Comando</span>
            <div class={`slot ${p.comandantes.length > 1 ? 'slot-pilha' : ''}`}>
              {p.comandantes.map((o) => <Carta key={o.id} o={o} realce={p.realce(o)} onClick={p.onCarta} onZoom={p.onZoom} onMenu={p.onMenuCarta} />)}
              {j.commanderTax > 0 && <span class="slot-imposto" title="Imposto de comandante (CR 903.8)">+{j.commanderTax}</span>}
            </div>
          </div>
        </div>
        {!p.eu && (
          <div class="zona" aria-label={`Mão de ${j.name}`}>
            <span class="zona-rotulo">Mão <b>({j.handCount})</b></span>
            <div class="mao-fechada">
              {j.handCount === 0 ? <span class="mao-fechada-vazia" /> : Array.from({ length: Math.min(j.handCount, 7) }, (_, i) => <div key={i} class="carta"><div class="carta-face"><div class="verso" /></div></div>)}
            </div>
          </div>
        )}
        <div class="zonas-grupo">
          <div class="zona" aria-label="Grimório">
            <span class="zona-rotulo">Grimório <b>({j.libraryCount})</b></span>
            <div class="slot">{j.libraryCount > 0 && <div class="carta"><div class="carta-face"><div class="verso" /></div></div>}</div>
          </div>
          <button type="button" class="zona botao-zona" onClick={() => p.onZona('graveyard')} aria-label={`Cemitério de ${j.name}, ${j.graveyard.length} cartas`}>
            <span class="zona-rotulo">Cemitério <b>({j.graveyard.length})</b></span>
            <div class="slot">{topoCemiterio && <Carta o={topoCemiterio} realce={p.realce(topoCemiterio)} onZoom={p.onZoom} />}</div>
          </button>
          <button type="button" class="zona botao-zona" onClick={() => p.onZona('exile')} aria-label={`Exílio de ${j.name}, ${p.exilio.length} cartas`}>
            <span class="zona-rotulo">Exílio <b>({p.exilio.length})</b></span>
            <div class="slot">{topoExilio && <Carta o={topoExilio} realce={p.realce(topoExilio)} onZoom={p.onZoom} />}</div>
          </button>
        </div>
      </footer>

      {p.mao && (
        <section class="mao" aria-label="Sua mão" style={{ '--wm': `${wm}px`, '--passo': `${Math.round(passo - wm)}px`, '--mao-baixo': `${-Math.round(wm * PROPORCAO * .2)}px` }}>
          <h2 class="mao-titulo">Mão <b>({n})</b></h2>
          <div class="mao-cartas">
            {n === 0 && <span class="mao-vazia">Sem cartas na mão</span>}
            {mao.map((o, i) => (
              <Carta key={o.id} o={o} realce={p.realce(o)} onClick={p.onCarta} onZoom={p.onZoom} onMenu={p.onMenuCarta} onPointerDown={p.onPegarMao} onDoubleClick={p.onDuploMao}
                classe={p.arrastando === o.id ? 'sendo-arrastada' : undefined}
                estilo={{ '--r': `${((i - meio) * giro).toFixed(2)}deg`, '--y': `${Math.round((i - meio) ** 2 * curva)}px` }} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
