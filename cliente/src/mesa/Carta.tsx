// Uma carta na mesa: a imagem é o visual principal; marcadores, dano e estado por cima.

import type { ObjView } from '../../../motor/view.ts';
import { info, nomeCarta, urlImagem } from '../cartas.ts';

export type Realce = 'acao' | 'escolhivel' | 'escolhido' | 'atacante' | 'bloqueador' | 'ativo' | 'mira' | null;

const MARCADORES: Record<string, string> = { '+1/+1': '+1/+1', '-1/-1': '−1/−1', loyalty: 'lealdade', poison: 'veneno' };

export interface CartaProps {
  o: ObjView;
  realce?: Realce;
  legenda?: string;
  onClick?: (o: ObjView) => void;
  onZoom?: (o: ObjView | null) => void;
}

export function Carta({ o, realce = null, legenda, onClick, onZoom }: CartaProps) {
  const oculta = !o.def;
  const img = oculta ? null : urlImagem(o.copyOfDef ?? o.def, o.face, 'p');
  const nome = oculta ? o.name : nomeCarta(o.def, o.name);
  const pendente = !oculta && !!info(o.def)?.pendente;
  const criatura = o.types.includes('Creature');
  const marcadores = Object.entries(o.counters).filter(([, n]) => n > 0);
  const classes = ['carta', o.tapped ? 'virada' : '', realce ? `realce-${realce}` : '', onClick ? 'clicavel' : '', o.phasedOut ? 'em-fase' : ''].filter(Boolean).join(' ');
  return (
    <div
      class={classes}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={nome}
      title={oculta ? nome : undefined}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(o); } : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(o); } } : undefined}
      onMouseEnter={onZoom && !oculta ? () => onZoom(o) : undefined}
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
      {(marcadores.length > 0 || o.damage > 0 || pendente || o.goaded || o.sick || o.commander) && (
        <div class="carta-etiquetas">
          {marcadores.map(([k, n]) => <span key={k} class={`marca marca-${k === '-1/-1' ? 'menos' : k === '+1/+1' ? 'mais' : 'outro'}`}>{n} {MARCADORES[k] ?? k}</span>)}
          {o.damage > 0 && <span class="marca marca-dano">{o.damage} de dano</span>}
          {criatura && o.sick && <span class="marca marca-enjoo">enjoo</span>}
          {o.goaded && <span class="marca marca-outro">provocada</span>}
          {pendente && <span class="marca marca-pendente">manual</span>}
        </div>
      )}
      {criatura && o.power !== null && img && <span class="carta-pt">{o.power}/{o.toughness}</span>}
      {legenda && <span class="carta-legenda">{legenda}</span>}
    </div>
  );
}
