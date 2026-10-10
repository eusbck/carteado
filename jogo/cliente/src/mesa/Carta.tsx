// Uma carta: a imagem é o visual principal; marcadores, dano e estado por cima.

import type { CSSProperties } from 'preact';
import { memo } from 'preact/compat';
import type { ObjView } from '../../../motor/view.ts';
import { info, nomeCarta, urlImagem } from '../cartas.ts';
import { IconeEscudo, IconeEspada } from '../icones.tsx';

/** 'bloqueavel': atacante que a sua criatura escolhida pode bloquear (anel azul que pulsa, diferente da 'mira' vermelha) */
export type Realce = 'acao' | 'escolhivel' | 'escolhido' | 'atacante' | 'bloqueador' | 'ativo' | 'mira' | 'bloqueavel' | null;
/** selo de combate: atacando, bloqueando, ou marcada para atacar mas ainda sem alvo */
export type Selo = 'espada' | 'escudo' | 'espera';

const NOME_SELO: Record<Selo, string> = { espada: 'atacando', escudo: 'bloqueando', espera: 'marcada para atacar, sem alvo' };

const MARCADORES: Record<string, string> = { '+1/+1': '+1/+1', '-1/-1': '−1/−1', loyalty: 'lealdade', poison: 'veneno', charge: 'carga', time: 'tempo', oil: 'óleo', stun: 'atordoamento', shield: 'escudo' };

export interface CartaProps {
  o: ObjView;
  realce?: Realce;
  selo?: Selo;
  /** número entre as de nome igual na decisão de combate ("#2"; o painel diz "Zumbi #2") */
  numero?: number;
  /** terreno deitado no campo: peça baixa e larga com a arte recortada (tamanho em --tw/--th, do campo); virado, fica
   *  apagado com o {T} (sem a classe .virada: não gira 90° e as contas de arrastar continuam as de uma carta de pé) */
  deitada?: boolean;
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

/** força/resistência; se a criatura causa dano de combate pela resistência (Felothar…), uma espada em ouro na frente
 *  e a resistência em ouro: é esse o número que vira dano */
function ForcaResistencia({ o }: { o: ObjView }) {
  if (!o.damageByToughness) return <>{o.power}/{o.toughness}</>;
  return <><span class="pt-espada"><IconeEspada /></span>{o.power}/<span class="pt-dano">{o.toughness}</span></>;
}

/** estilo igual chave a chave (a mesa monta um objeto novo a cada desenho, com os mesmos valores) */
function mesmoEstilo(a: CSSProperties | undefined, b: CSSProperties | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every((k) => (a as Record<string, unknown>)[k] === (b as Record<string, unknown>)[k]);
}

/**
 * A carta só se desenha de novo quando algo dela muda: o objeto da vista (que a loja reaproveita quando chega
 * igual), o realce, o selo, a classe, o estilo ou um dos tratadores (que a mesa mantém fixos). Passar o mouse numa
 * carta ou uma mensagem do servidor que muda uma carta só não redesenha as outras cem.
 */
export const Carta = memo(CartaBase, (a, b) =>
  a.o === b.o && a.realce === b.realce && a.selo === b.selo && a.numero === b.numero && a.deitada === b.deitada && a.classe === b.classe && mesmoEstilo(a.estilo, b.estilo)
  && a.onClick === b.onClick && a.onZoom === b.onZoom && a.onPointerDown === b.onPointerDown && a.onDoubleClick === b.onDoubleClick && a.onMenu === b.onMenu);

function CartaBase({ o, realce = null, selo, numero, deitada, onClick, onZoom, onPointerDown, onDoubleClick, onMenu, estilo, classe }: CartaProps) {
  const oculta = !o.def;
  const img = oculta ? null : urlImagem(o.copyOfDef ?? o.def, o.face, 'p');
  const nome = oculta ? o.name : nomeCarta(o.def, o.name);
  const pendente = !oculta && !!info(o.def)?.pendente;
  const criatura = o.types.includes('Creature');
  const marcadores = Object.entries(o.counters).filter(([, n]) => n > 0);
  const virada = o.tapped ? (deitada ? 'deitada-virada' : 'virada') : '';
  const classes = ['carta', deitada ? 'deitada' : '', virada, onPointerDown ? 'arrastavel' : '', criatura && o.sick ? 'enjoo' : '', realce ? `realce-${realce}` : '', onClick ? 'clicavel' : '', o.phasedOut ? 'em-fase' : '', classe ?? ''].filter(Boolean).join(' ');
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
        {img ? <img src={img} alt={nome} loading="lazy" decoding="async" draggable={false} /> : oculta ? <div class="verso" /> : (
          <div class="sem-arte">
            <strong>{nome}</strong>
            <span>{o.types.join(' ')}</span>
            {o.power !== null && <span class="pt"><ForcaResistencia o={o} /></span>}
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
      {criatura && o.power !== null && img && <span class={o.damageByToughness ? 'carta-pt pela-resistencia' : 'carta-pt'}><ForcaResistencia o={o} /></span>}
      {selo && <span class={`selo-combate ${selo}`} title={NOME_SELO[selo]}>{selo === 'escudo' ? <IconeEscudo /> : <IconeEspada />}</span>}
      {numero !== undefined && <span class="carta-n" aria-hidden="true">#{numero}</span>}
      {deitada && <span class="tile-nome" aria-hidden="true">{nome}</span>}
      {deitada && o.tapped && <img class="tile-t" src="/simbolo/T" alt="" aria-hidden="true" draggable={false} />}
    </div>
  );
}
