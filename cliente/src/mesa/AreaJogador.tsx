// Área de um jogador: cabeçalho (vida, contadores, zonas) e o campo de batalha em fileiras.

import type { ObjView, PlayerView } from '../../../motor/view.ts';
import { nomeCarta } from '../cartas.ts';
import { Carta, type Realce } from './Carta.tsx';
import { Simbolos } from './Simbolos.tsx';

export interface AreaProps {
  j: PlayerView;
  objs: ObjView[];
  anexos: Map<number, ObjView[]>;
  comandantes: ObjView[];
  exilio: ObjView[];
  eu: boolean;
  ativo: boolean;
  decidindo: boolean;
  compacto: boolean;
  realce: (o: ObjView) => Realce;
  legenda: (o: ObjView) => string | undefined;
  onCarta: (o: ObjView) => void;
  onZoom: (o: ObjView | null) => void;
  jogadorRealce: 'escolhivel' | 'escolhido' | null;
  onJogador?: () => void;
  onZona: (zona: 'graveyard' | 'exile') => void;
}

/** terrenos e fichas idênticos ficam num leque (cada carta continua clicável) */
function agrupar(objs: ObjView[], anexos: Map<number, ObjView[]>): ObjView[][] {
  const grupos: ObjView[][] = [];
  const chave = (o: ObjView) => (o.types.includes('Land') || o.token) && !anexos.has(o.id)
    ? `${o.def}|${o.name}|${o.tapped}|${JSON.stringify(o.counters)}|${o.damage}|${o.sick}|${o.power}/${o.toughness}` : null;
  const porChave = new Map<string, ObjView[]>();
  for (const o of objs) {
    const k = chave(o);
    if (k === null) { grupos.push([o]); continue; }
    const g = porChave.get(k);
    if (g) g.push(o);
    else { const novo = [o]; porChave.set(k, novo); grupos.push(novo); }
  }
  return grupos;
}

function Fileira({ titulo, objs, p }: { titulo: string; objs: ObjView[]; p: AreaProps }) {
  if (objs.length === 0) return null;
  return (
    <div class="fileira" aria-label={titulo}>
      {agrupar(objs, p.anexos).map((g) => {
        if (g.length > 1) {
          return (
            <div class={`grupo ${g[0].tapped ? 'grupo-virado' : ''}`} key={g[0].id} aria-label={`${g.length} × ${g[0].name}`}>
              <span class="grupo-n">×{g.length}</span>
              {g.map((o) => <Carta key={o.id} o={o} realce={p.realce(o)} legenda={p.legenda(o)} onClick={p.onCarta} onZoom={p.onZoom} />)}
            </div>
          );
        }
        const o = g[0];
        const anexos = p.anexos.get(o.id) ?? [];
        return (
          <div class={`pilha-anexos ${anexos.length ? 'com-anexos' : ''}`} key={o.id} style={{ '--anexos': anexos.length } as Record<string, number>}>
            {anexos.map((a, i) => (
              <div class="anexo" key={a.id} style={{ '--i': i } as Record<string, number>}>
                <Carta o={a} realce={p.realce(a)} legenda={p.legenda(a)} onClick={p.onCarta} onZoom={p.onZoom} />
              </div>
            ))}
            <Carta o={o} realce={p.realce(o)} legenda={p.legenda(o)} onClick={p.onCarta} onZoom={p.onZoom} />
          </div>
        );
      })}
    </div>
  );
}

export function AreaJogador(p: AreaProps) {
  const { j } = p;
  const terrenos = p.objs.filter((o) => o.types.includes('Land') && !o.types.includes('Creature'));
  const criaturas = p.objs.filter((o) => o.types.includes('Creature'));
  const outros = p.objs.filter((o) => !terrenos.includes(o) && !criaturas.includes(o));
  const contadores = Object.entries(j.counters).filter(([, n]) => n > 0);
  const classes = ['area', p.eu ? 'area-eu' : 'area-oponente', p.ativo ? 'area-ativa' : '', p.decidindo ? 'area-decidindo' : '', j.left ? 'area-fora' : '', p.compacto ? 'compacta' : ''].filter(Boolean).join(' ');
  return (
    <section class={classes} aria-label={`Área de ${j.name}`}>
      <header class="area-topo">
        <button
          type="button"
          class={`jogador ${p.jogadorRealce ? `realce-${p.jogadorRealce}` : ''}`}
          onClick={p.onJogador}
          disabled={!p.onJogador}
          aria-label={`${j.name}, ${j.life} de vida`}
        >
          <span class="jogador-nome">{j.name}</span>
          <span class="jogador-vida">{j.life}</span>
        </button>
        <div class="area-info">
          {p.ativo && <span class="etiqueta destaque">turno</span>}
          {p.decidindo && <span class="etiqueta decidindo">decidindo</span>}
          {j.monarch && <span class="etiqueta">monarca</span>}
          {j.left && <span class="etiqueta alerta">{j.won ? 'venceu' : 'fora da partida'}</span>}
          {contadores.map(([k, n]) => <span class="etiqueta" key={k}>{n} {k === 'poison' ? 'veneno' : k}</span>)}
          <span class="contagem" title="Cartas na mão">mão {j.handCount}</span>
          <span class="contagem" title="Cartas no grimório">grimório {j.libraryCount}</span>
          <button type="button" class="contagem botao-zona" onClick={() => p.onZona('graveyard')}>cemitério {j.graveyard.length}</button>
          <button type="button" class="contagem botao-zona" onClick={() => p.onZona('exile')}>exílio {p.exilio.length}</button>
          {j.commanderTax > 0 && <span class="contagem" title="Imposto de comandante (CR 903.8)">imposto {j.commanderTax}</span>}
          {j.manaPool && <span class="reserva" title="Reserva de mana"><Simbolos custo={j.manaPool} tam={15} /></span>}
        </div>
        {j.commanderDamage.filter((d) => d.amount > 0).length > 0 && (
          <div class="dano-cmd" title="Dano de comandante recebido (CR 903.10a)">
            {j.commanderDamage.filter((d) => d.amount > 0).map((d) => <span key={d.from}>{nomeCarta(d.from, d.from)}: {d.amount}</span>)}
          </div>
        )}
      </header>
      <div class="area-corpo">
        {p.comandantes.length > 0 && (
          <div class="zona-comando" aria-label="Zona de comando">
            {p.comandantes.map((o) => <Carta key={o.id} o={o} realce={p.realce(o)} legenda={p.legenda(o)} onClick={p.onCarta} onZoom={p.onZoom} />)}
          </div>
        )}
        <div class="campo">
          <Fileira titulo="Criaturas" objs={criaturas} p={p} />
          <Fileira titulo="Outros permanentes" objs={outros} p={p} />
          <Fileira titulo="Terrenos" objs={terrenos} p={p} />
          {p.objs.length === 0 && <p class="vazio">Nenhum permanente</p>}
        </div>
      </div>
    </section>
  );
}
