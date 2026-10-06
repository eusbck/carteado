// Uma carta: a imagem é o visual principal; marcadores, dano e estado por cima.

import type { CSSProperties } from 'preact';
import type { ObjView } from '../../../motor/view.ts';
import { info, nomeCarta, urlImagem } from '../cartas.ts';

export type Realce = 'acao' | 'escolhivel' | 'escolhido' | 'atacante' | 'bloqueador' | 'ativo' | 'mira' | null;

const MARCADORES: Record<string, string> = { '+1/+1': '+1/+1', '-1/-1': '−1/−1', loyalty: 'lealdade', poison: 'veneno', charge: 'carga', time: 'tempo', oil: 'óleo', stun: 'atordoamento', shield: 'escudo' };

export interface CartaProps {
  o: ObjView;
  realce?: Realce;
  legenda?: string;
  /** a legenda é de bloqueio (cor diferente da de ataque) */
  legendaBloqueio?: boolean;
  /** recebe também o retângulo da carta na tela (para abrir o menu ao lado dela) */
  onClick?: (o: ObjView, r: DOMRect) => void;
  onZoom?: (o: ObjView | null, r?: DOMRect) => void;
  /** começo de um possível arrasto (a carta e o elemento dela) */
  onPointerDown?: (o: ObjView, ev: PointerEvent, el: HTMLElement) => void;
  onDoubleClick?: (o: ObjView, r: DOMRect) => void;
  /** clique direito */
  onMenu?: (o: ObjView, ev: MouseEvent) => void;
  estilo?: CSSProperties;
  classe?: string;
}

export function Carta({ o, realce = null, legenda, legendaBloqueio, onClick, onZoom, onPointerDown, onDoubleClick, onMenu, estilo, classe }: CartaProps) {
  const oculta = !o.def;
  const img = oculta ? null : urlImagem(o.copyOfDef ?? o.def, o.face, 'p');
  const nome = oculta ? o.name : nomeCarta(o.def, o.name);
  const pendente = !oculta && !!info(o.def)?.pendente;
  const criatura = o.types.includes('Creature');
  const marcadores = Object.entries(o.counters).filter(([, n]) => n > 0);
  const classes = ['carta', o.tapped ? 'virada' : '', onPointerDown ? 'arrastavel' : '', criatura && o.sick ? 'enjoo' : '', realce ? `realce-${realce}` : '', onClick ? 'clicavel' : '', o.phasedOut ? 'em-fase' : '', classe ?? ''].filter(Boolean).join(' ');
  const rect = (e: Event) => (e.currentTarget as HTMLElement).getBoundingClientRect();
  return (
    <div
      class={classes}
      style={estilo}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={nome}
      title={oculta ? nome : undefined}
      data-obj={o.id}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(o, rect(e)); } : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(o, rect(e)); } } : undefined}
      onPointerDown={onPointerDown ? (e) => onPointerDown(o, e, e.currentTarget as HTMLElement) : undefined}
      onDblClick={onDoubleClick ? (e) => { e.stopPropagation(); onDoubleClick(o, rect(e)); } : undefined}
      onContextMenu={onMenu ? (e) => { e.preventDefault(); e.stopPropagation(); onMenu(o, e); } : undefined}
      onMouseEnter={onZoom && !oculta ? (e) => onZoom(o, rect(e)) : undefined}
      onMouseLeave={onZoom ? () => onZoom(null) : undefined}
    >
      <div class="carta-face">
        {img ? <img src={img} alt={nome} loading="lazy" draggable={false} /> : oculta ? <div class="verso" /> : (
          <div class="sem-arte">
            <strong>{nome}</strong>
            <span>{o.types.join(' ')}</span>
            {o.power !== null && <span class="pt">{o.power}/{o.toughness}</span>}
          </div>
        )}
      </div>
      {(marcadores.length > 0 || o.damage > 0 || pendente || o.goaded) && (
        <div class="carta-etiquetas">
          {marcadores.map(([k, n]) => <span key={k} class={`marca marca-${k === '-1/-1' ? 'menos' : k === '+1/+1' ? 'mais' : 'outro'}`}>{k === '+1/+1' ? `+${n}` : k === '-1/-1' ? `−${n}` : `${n} ${MARCADORES[k] ?? k}`}</span>)}
          {o.damage > 0 && <span class="marca marca-dano">{o.damage} de dano</span>}
          {o.goaded && <span class="marca marca-outro">provocada</span>}
          {pendente && <span class="marca marca-pendente">manual</span>}
        </div>
      )}
      {criatura && o.power !== null && img && <span class="carta-pt">{o.power}/{o.toughness}</span>}
      {legenda && <span class={`carta-legenda ${legendaBloqueio ? 'bloqueio' : ''}`}>{legenda}</span>}
    </div>
  );
}
