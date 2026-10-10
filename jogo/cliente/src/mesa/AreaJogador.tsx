// Área de um jogador: arte do comandante ao fundo, nome, o avatar com a vida (no canto de cima à direita; o seu pode
// ficar à esquerda, acima do Comando), o campo de batalha com cada permanente na sua posição e a fileira de zonas
// (comando, mão, grimório, cemitério, exílio). Na sua área o campo vai até a base e a mão (abaixada em repouso), as
// zonas e o retrato ficam por cima dele.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ObjId } from '../../../motor/types.ts';
import type { ObjView, PlayerView } from '../../../motor/view.ts';
import { nomeCarta } from '../cartas.ts';
import type { AvatarCliente } from '../avatares.ts';
import { arrumarCampo, type Vao } from './arrumacao.ts';
import { Avatar } from './Avatar.tsx';
import { Carta, type Realce, type Selo } from './Carta.tsx';
import { useMesmo } from './estavel.ts';
import { medirArea, type LadoAvatar } from './geometriaArea.ts';
import { Simbolos } from './Simbolos.tsx';

/** a mesma lista de retângulos (a área se desenha de novo a cada vista; a arrumação só se refaz se eles mudarem) */
const mesmosVaos = (a: Vao[], b: Vao[]) => a.length === b.length && a.every((r, i) => r.x0 === b[i].x0 && r.x1 === b[i].x1 && r.y0 === b[i].y0 && r.y1 === b[i].y1);

/** como a carta aparece no combate: selo e, para quem você está marcando para atacar, inclinada; `numero` entre as de
 *  nome igual na decisão ("#2"); `alheia`: atacante que ataca outro jogador, enquanto você bloqueia (fica apagada) */
export interface EstadoCombate { selo?: Selo; inclinada?: boolean; ativa?: boolean; numero?: number; alheia?: boolean }

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
  /** bot pensando há mais de um segundo (fase 9) */
  pensando?: boolean;
  /** nível do bot, mostrado junto do nome ("ROBSON · Cartomante") */
  nivel?: string | null;
  compacta: boolean;
  duelo: boolean;
  cor: string;
  fundo: string | null;
  /** retrato do jogador (o escolhido ou o do comandante do deck); null: medalhão com a inicial */
  avatar: AvatarCliente | null;
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
  /** uma decisão pede cartas da sua mão: ela fica erguida (sem isso, descansa abaixada e sobe com o mouse) */
  maoAberta?: boolean;
  /** onde fica o seu retrato (Configurações): no canto de cima à direita (padrão) ou à esquerda, acima do Comando */
  avatarLado?: LadoAvatar;
  /** terrenos deitados (Configurações › Terrenos no campo) */
  deitados?: boolean;
  /** o terreno que acabou de entrar enquanto a carta jogada ainda se transforma nele (fica escondido até ela chegar) */
  chegando?: ObjId | null;
  /** largura à direita do campo que fica livre para a coluna da pilha e das decisões */
  reservaDireita?: number;
  /** posições escolhidas (de 0 a 1 dentro do campo), pelo id do objeto */
  posicoes?: Record<string, [number, number]>;
  /** carta sendo arrastada agora (fica apagada no lugar de origem) */
  arrastando?: ObjId | null;
  /** permanentes que você soltou do arrasto: nascem sem a animação de surgir (a carta arrastada pousou ali) */
  pousadas?: ReadonlySet<ObjId>;
  /** começo de arrasto de uma permanente sua no campo */
  onPegarCampo?: (o: ObjView, ev: PointerEvent, el: HTMLElement) => void;
  /** botão apertado no espaço vazio do seu campo (retângulo de seleção) */
  onPegarCampoVazio?: (ev: PointerEvent, campo: HTMLElement) => void;
  /** permanentes suas selecionadas (ficam marcadas, com os anexos delas) */
  selecionadas?: ReadonlySet<ObjId>;
  /** ordem em que você soltou as cartas que arrumou (a maior fica por cima) */
  ordemZ?: Record<string, number>;
  /** começo de arrasto e duplo clique numa carta da sua mão */
  onPegarMao?: (o: ObjView, ev: PointerEvent, el: HTMLElement) => void;
  onDuploMao?: (o: ObjView, r: DOMRect) => void;
  /** carta que você está conjurando, tracejada onde você soltou (x e y de 0 a 1 no campo) */
  conjurando?: { o: ObjView; x: number; y: number } | null;
  /** clique direito numa carta, e no espaço vazio da área */
  onMenuCarta?: (o: ObjView, ev: MouseEvent) => void;
  onMenuArea?: (ev: MouseEvent) => void;
  /** decisão de combate aberta que passa por esta área: os leques de criaturas abrem (arrumacao.ts) */
  lequeLargo?: boolean;
  /** o combate declarado, na chave dos leques: quem ataca um jogador não fica no leque de quem ataca outro */
  chaveCombate?: ReadonlyMap<ObjId, string>;
  /** clique no selo ×n de um leque (com as cartas dele à vista): marcar ou desmarcar o leque para atacar */
  onLeque?: (ids: ObjId[]) => void;
}

const NOME_CONTADOR: Record<string, string> = { poison: 'veneno', energy: 'energia', experience: 'experiência', rad: 'radiação' };

/** posições guardadas e ordem de quem não tem nenhuma: sempre o mesmo objeto (a arrumação não se refaz à toa) */
const SEM_POSICOES: Record<string, [number, number]> = {};
const SEM_ORDEM: Record<string, number> = {};

function useTamanho<T extends HTMLElement>(): [{ current: T | null }, { w: number; h: number }] {
  const ref = useRef<T>(null);
  const [t, setT] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setT((a) => (a.w === el.clientWidth && a.h === el.clientHeight ? a : { w: el.clientWidth, h: el.clientHeight }));
    medir();
    // recolher ou abrir a barra lateral anima a largura da mesa por uns 220 ms: medir a cada quadro refazia a
    // arrumação e reiniciava o deslize de todas as cartas a cada quadro. A área mede uma vez, no fim da animação, e as
    // cartas deslizam uma vez até o lugar novo
    const mesa = el.closest('.mesa');
    let animando = false;
    const daMesa = (ev: Event) => ev.target === mesa && (ev as TransitionEvent).propertyName === 'grid-template-columns';
    const comeca = (ev: Event) => { if (daMesa(ev)) animando = true; };
    const acaba = (ev: Event) => { if (daMesa(ev)) { animando = false; medir(); } };
    mesa?.addEventListener('transitionrun', comeca);
    mesa?.addEventListener('transitionend', acaba);
    mesa?.addEventListener('transitioncancel', acaba);
    const ro = new ResizeObserver(() => { if (!animando) medir(); });
    ro.observe(el);
    return () => {
      ro.disconnect();
      mesa?.removeEventListener('transitionrun', comeca);
      mesa?.removeEventListener('transitionend', acaba);
      mesa?.removeEventListener('transitioncancel', acaba);
    };
  }, []);
  return [ref, t];
}

export function AreaJogador(p: AreaProps) {
  const { j } = p;
  const comandantes = p.comandantes.filter((o) => !o.emblem);
  const emblemas = p.comandantes.filter((o) => o.emblem);
  const [ref, tam] = useTamanho<HTMLElement>();

  // medidas que dependem do tamanho da área (geometriaArea.ts): na sua, o campo vai até a base e a mão, as zonas e o
  // retrato ficam por cima dele; a arrumação padrão deixa livres só os retângulos deles em repouso
  const mao = p.mao ?? [];
  const n = mao.length;
  const lado: LadoAvatar = p.avatarLado ?? 'canto';
  const m = medirArea({ w: tam.w, h: tam.h, eu: !!p.mao, compacta: p.compacta, duelo: p.duelo, lado, nMao: n, emblemas: emblemas.length > 0, reservaDireita: p.reservaDireita });
  const { wz, topo, campoW, campoH, livreW, wBase, wMin, tamAvatar } = m;
  // as mesmas medidas, a mesma lista de retângulos (a arrumação não se refaz à toa)
  const vaosNovos = m.vaos;
  const vaos = useMesmo(vaosNovos, mesmosVaos);

  // quem tem posição escolhida fica onde a pessoa pôs; os outros seguem a arrumação padrão
  const posicoes = p.posicoes ?? SEM_POSICOES;
  const ordemZ = p.ordemZ ?? SEM_ORDEM;
  const arr = useMemo(() => arrumarCampo(p.objs, p.anexos, posicoes, ordemZ, { W: campoW, livreW, H: campoH, wBase, wMin, vaos },
    { largo: p.lequeLargo, combate: p.chaveCombate, deitados: p.deitados }),
  [p.objs, p.anexos, posicoes, ordemZ, campoW, livreW, campoH, wBase, wMin, vaos, p.lequeLargo, p.chaveCombate, p.deitados]);
  const todosNoCampo = useMemo(() => [...p.objs, ...p.objs.flatMap((o) => p.anexos.get(o.id) ?? [])], [p.objs, p.anexos]);
  // as cartas de cada leque (sem as postas noutro lugar): no leque, a marcada para atacar sobe mais (a borda de cima
  // fica à vista acima da vizinha) e o hover não traz ninguém para cima (a faixa que aparece é a que recebe o clique).
  // O selo dos terrenos deitados conta os virados
  const leques = useMemo(() => {
    const virados = new Set(todosNoCampo.filter((o) => o.tapped).map((o) => o.id));
    return arr.leques.map((g) => {
      const ids = g.ids.filter((id) => !posicoes[id]);
      return { ...g, ids, virados: g.deitado ? ids.filter((id) => virados.has(id)).length : 0 };
    }).filter((g) => g.ids.length > 1);
  }, [arr, posicoes, todosNoCampo]);
  const emLeque = useMemo(() => new Set(leques.flatMap((g) => g.ids)), [leques]);

  const contadores = Object.entries(j.counters).filter(([, n]) => n > 0);
  const danoCmd = j.commanderDamage.filter((d) => d.amount > 0);
  const ladoClasse = p.mao ? (lado === 'canto' ? 'avatar-no-canto' : 'avatar-a-esquerda') : '';
  const classes = ['area', p.eu ? 'area-eu' : 'area-oponente', ladoClasse, p.ativo ? 'area-ativa' : '', p.decidindo ? 'area-decidindo' : '', j.left ? 'area-fora' : '', p.compacta ? 'compacta' : '', p.jogadorRealce ? `alvo-${p.jogadorRealce}` : ''].filter(Boolean).join(' ');
  const topoCemiterio = j.graveyard[j.graveyard.length - 1];
  // na sua área, a reserva fica do lado da vida (à esquerda ela cairia embaixo da faixa de fases)
  const reserva = <span class="selo reserva" title="Reserva de mana"><span class="rot">Reserva</span><Simbolos custo={j.manaPool} tam={16} /></span>;
  const topoExilio = p.exilio[p.exilio.length - 1];

  // leque da mão: cabe entre os grupos de zonas; em repouso só a faixa de cima das cartas aparece. O mouse numa carta
  // ergue a mão inteira; ela só desce um pouco depois de o mouse sair (atravessar o vão entre duas cartas não a fecha)
  const [erguida, setErguida] = useState(false);
  const relogioMao = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (relogioMao.current) clearTimeout(relogioMao.current); }, []);
  const erguer = () => {
    if (relogioMao.current) { clearTimeout(relogioMao.current); relogioMao.current = null; }
    setErguida(true);
  };
  // entrar e sair do leque inteiro (passar de uma carta para a vizinha não conta como sair)
  const baixar = () => {
    if (relogioMao.current) clearTimeout(relogioMao.current);
    relogioMao.current = setTimeout(() => { relogioMao.current = null; setErguida(false); }, 320);
  };
  const mm = m.mao;
  const meio = (n - 1) / 2;
  const estiloMao = mm ? {
    '--wm': `${mm.wm}px`, '--passo': `${Math.round(mm.passo - mm.wm)}px`, '--mao-baixo': `${mm.baixo}px`, '--mao-repouso': `${mm.repouso}px`,
  } : undefined;

  return (
    <section ref={ref} class={`${classes} ${p.onCliqueArea ? 'area-clicavel' : ''}`} data-jogador={j.id} aria-label={`Área de ${j.name}`}
      style={{ '--cor': p.cor, '--zonas-h': `${m.baixo}px`, '--wz': `${wz}px`, '--zonas-alt': `${m.zonasH + 8}px`, '--tam-avatar': `${tamAvatar}px`, '--reserva-direita': `${p.reservaDireita ?? 0}px`, '--topo-campo': `${topo}px`,
        ...(mm ? { '--mao-visivel': `${mm.baixo + mm.hm - mm.repouso}px`, '--mao-topo': `${mm.baixo + mm.hm}px` } : {}) }}
      onClick={p.onCliqueArea ? (e) => { if (!(e.target as HTMLElement).closest('[data-obj], button')) p.onCliqueArea!(); } : undefined}
      onContextMenu={p.onMenuArea ? (e) => { e.preventDefault(); p.onMenuArea!(e); } : undefined}>
      {p.fundo && <div class="area-fundo" style={{ backgroundImage: `url(${p.fundo})` }} />}
      <header class="area-topo">
        <div class="area-selos">
          <button type="button" class="tag-jogador" onClick={p.onJogador} disabled={!p.onJogador} aria-label={`${j.name}${p.nivel ? `, bot ${p.nivel}` : ''}, ${j.life} de vida`}>{j.name}{p.nivel && <span class="nivel-bot"> · {p.nivel}</span>}</button>
          {p.ativo && <span class="selo turno">turno</span>}
          {p.pensando && !p.eu ? <span class="selo decidindo pensando">pensando…</span> : p.decidindo && !p.eu && <span class="selo decidindo">decidindo</span>}
          {j.monarch && <span class="selo">monarca</span>}
          {j.left && <span class="selo etiqueta alerta">{j.won ? 'venceu' : 'fora da partida'}</span>}
          {contadores.map(([k, q]) => <span class="selo" key={k}>{q} {NOME_CONTADOR[k] ?? k}</span>)}
          {j.manaPool && !p.eu && reserva}
        </div>
        <div class="vida">
          {j.manaPool && p.eu && reserva}
          {danoCmd.length > 0 && (
            <div class="dano-cmd" title="Dano de comandante recebido (CR 903.10a)">
              {danoCmd.map((d) => <span key={d.from}>{nomeCarta(d.from, d.from).split(',')[0]} · {d.amount}</span>)}
            </div>
          )}
        </div>
      </header>

      {tam.w > 0 && (
        <Avatar jogador={j.id} avatar={p.avatar} vida={j.life} nome={j.name} local={false} lugar={p.mao && lado === 'esquerda' ? 'esquerda' : undefined}
          ativo={p.ativo} fora={j.left} tamanho={tamAvatar} cor={p.cor} onVida={p.onJogador} />
      )}

      <div class="campo" aria-label="Campo de batalha" data-larg={livreW} data-alt={campoH} data-carta-w={arr.w} data-tile-w={arr.tile.w} data-tile-h={arr.tile.h}
        style={{ '--tw': `${arr.tile.w}px`, '--th': `${arr.tile.h}px` }}
        onPointerDown={p.onPegarCampoVazio ? (e) => { if (!(e.target as HTMLElement).closest('[data-obj], .grupo-n')) p.onPegarCampoVazio!(e, e.currentTarget as HTMLElement); } : undefined}>
        {todosNoCampo.map((o) => {
          const pos = arr.pos.get(o.id);
          if (!pos) return null;
          const c = p.combate(o);
          const selecionada = !!p.selecionadas && (p.selecionadas.has(o.id) || (o.attachedTo !== null && p.selecionadas.has(o.attachedTo)));
          const classe = [p.arrastando === o.id ? 'sendo-arrastada' : '', p.pousadas?.has(o.id) ? 'pousada' : '', p.chegando === o.id ? 'chegando' : '', c?.inclinada ? 'inclinada' : '', c?.ativa ? 'combate-ativa' : '', c?.alheia ? 'combate-alheio' : '', emLeque.has(o.id) ? 'no-leque' : '', selecionada ? 'selecionada' : ''].filter(Boolean).join(' ');
          return (
            <Carta key={o.id} o={o} realce={p.realce(o)} selo={c?.selo} numero={c?.numero} deitada={arr.deitadas.has(o.id)} onClick={p.onCarta} onZoom={p.onZoom} onMenu={p.onMenuCarta}
              onPointerDown={p.onPegarCampo} classe={classe || undefined}
              estilo={{ left: `${pos.x}px`, top: `${pos.y}px`, zIndex: pos.z, '--w': `${arr.w}px` }} />
          );
        })}
        {leques.map((g) => {
          const estilo = { left: `${g.x}px`, top: `${g.y}px` };
          // marcando atacantes: o selo de um leque de criaturas marca (ou desmarca) o leque inteiro
          const criaturas = !!p.onLeque && todosNoCampo.some((o) => o.id === g.ids[0] && o.types.includes('Creature'));
          return criaturas
            ? <button key={g.ids[0]} type="button" class="grupo-n clicavel" style={estilo} title="Marcar ou desmarcar o leque inteiro para atacar" aria-label={`Leque de ${g.ids.length}: marcar ou desmarcar para atacar`}
                onClick={(e) => { e.stopPropagation(); p.onLeque!(g.ids); }}>×{g.ids.length}</button>
            : <span key={g.ids[0]} class="grupo-n" style={estilo} aria-label={g.virados ? `${g.ids.length} iguais, ${g.virados} virados` : undefined}>
                ×{g.ids.length}{g.virados > 0 && <> · {g.virados}<img class="grupo-t" src="/simbolo/T" alt="" /></>}
              </span>;
        })}
        {p.conjurando && (
          <Carta o={p.conjurando.o} classe="conjurando" estilo={{ left: `${p.conjurando.x * livreW}px`, top: `${p.conjurando.y * campoH}px`, zIndex: 450, '--w': `${arr.w}px` }} />
        )}
        {p.objs.length === 0 && !p.compacta && <p class="campo-vazio">Nenhum permanente</p>}
      </div>

      <footer class="zonas">
        <div class="zonas-grupo">
          <div class="zona" aria-label="Zona de comando">
            <span class="zona-rotulo">Comando</span>
            <div class={`slot ${comandantes.length > 1 ? 'slot-pilha' : ''}`}>
              {comandantes.map((o) => <Carta key={o.id} o={o} realce={p.realce(o)} onClick={p.onCarta} onZoom={p.onZoom} onMenu={p.onMenuCarta} />)}
              {j.commanderTax > 0 && <span class="slot-imposto" title="Imposto de comandante (CR 903.8)">+{j.commanderTax}</span>}
            </div>
          </div>
          {/* emblemas (CR 114): não são cartas; o nome e as habilidades aparecem no zoom */}
          {emblemas.length > 0 && (
            <div class="zona" aria-label="Emblemas">
              <span class="zona-rotulo">{emblemas.length > 1 ? <>Emblemas <b>({emblemas.length})</b></> : 'Emblema'}</span>
              <div class="emblemas">
                {emblemas.map((o) => (
                  <button key={o.id} type="button" class="emblema" aria-label={`Emblema: ${o.abilities.join(' ')}`}
                    onMouseEnter={(e) => p.onZoom(o, (e.currentTarget as HTMLElement).getBoundingClientRect())} onMouseLeave={() => p.onZoom(null)}
                    onClick={(e) => p.onZoom(o, (e.currentTarget as HTMLElement).getBoundingClientRect())}>
                    <span class="emblema-icone" aria-hidden="true">✦</span>{o.name.replace(/^Emblema d[aeo] /, '')}
                  </button>
                ))}
              </div>
            </div>
          )}
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

      {/* rótulo da mão: centralizado acima da faixa que aparece do leque */}
      {mm && <h2 class="mao-titulo mao-rotulo">Mão <b>({n})</b></h2>}
      {mm && (
        <section class={`mao ${p.maoAberta ? 'aberta' : ''} ${erguida ? 'erguida' : ''}`} aria-label="Sua mão" style={estiloMao}>
          <div class="mao-cartas" onPointerEnter={erguer} onPointerLeave={baixar}>
            {n === 0 && <span class="mao-vazia">Sem cartas na mão</span>}
            {mao.map((o, i) => (
              <Carta key={o.id} o={o} realce={p.realce(o)} onClick={p.onCarta} onZoom={p.onZoom} onMenu={p.onMenuCarta} onPointerDown={p.onPegarMao} onDoubleClick={p.onDuploMao}
                classe={p.arrastando === o.id ? 'sendo-arrastada' : undefined}
                estilo={{ '--r': `${((i - meio) * mm.giro).toFixed(2)}deg`, '--y': `${Math.round((i - meio) ** 2 * mm.curva)}px` }} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
