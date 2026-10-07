// A mesa: as áreas dos jogadores (com a sua mão), a faixa de fases, a coluna com a pilha e a
// decisão pendente, e a barra lateral retrátil com o registro. Na mesa real (padrão) a interface
// não orienta: brilhos, avisos e pagamento automático são auxílios que cada um liga nas
// Configurações (ou que a sala proíbe). As regras continuam no motor.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { StopSettings } from '../../../motor/autopass.ts';
import type { Decision, ManualAction, ObjId, PaymentSource, PriorityAction, Step, TargetRef } from '../../../motor/types.ts';
import type { GameView, ObjView, PlayerView } from '../../../motor/view.ts';
import { nomeCarta, traduzir, urlFundo, urlImagem } from '../cartas.ts';
import { IconeAjuste, IconeConceder, IconeRecolher as IconeSeta, IconeConfig, IconeDesfazer, IconeFimTurno, IconeParadas, IconePassar, IconeRecolher, IconeRegistro, IconeSair, Marca } from '../icones.tsx';
import { loja, useLoja } from '../loja.ts';
import { reservaPaga } from '../mana.ts';
import { Janela } from '../Janela.tsx';
import { AUXILIOS, auxiliosAtivos, auxiliosDoNivel, mudarPreferencias, NIVEIS, usePreferencias, type Auxilios, type Preferencias } from '../preferencias.ts';
import { ETAPAS, FASES } from '../pt.ts';
import { acompanharArrasto, dentro, mostrarFantasma, useFantasma } from './arrastar.ts';
import { useMusica } from '../musica.ts';
import { AreaJogador, type EstadoCombate } from './AreaJogador.tsx';
import { ConfigSom } from './ConfigSom.tsx';
import { Carta, type Realce } from './Carta.tsx';
import { Decisao, type EstadoUi } from './Decisao.tsx';
import { PedidoDesfazer } from './Desfazer.tsx';
import { useEfeitos } from './Efeitos.tsx';
import { Setas, type Seta } from './Setas.tsx';
import { MaoInicial } from './MaoInicial.tsx';
import { Manual, type PegarCarta, type Tipo as TipoManual } from './Manual.tsx';
import { Paradas } from './Paradas.tsx';
import { avisoPrioridade } from './prioridade.ts';
import { NIVEL_PADRAO, nomeNivel } from '../../../bots/niveis.ts';
import { TextoComSimbolos } from './Simbolos.tsx';
import { Zoom } from './Zoom.tsx';

type Modal = { tipo: 'zona'; jogador: number; zona: 'graveyard' | 'exile' } | { tipo: 'paradas' } | { tipo: 'conceder' } | { tipo: 'config' } | { tipo: 'carta'; o: ObjView } | null;
type ItemMenu =
  | { tipo?: 'acao'; id: string; label: string; fazer: () => void; legal?: boolean; desativado?: boolean }
  | { tipo: 'grupo'; id: string; label: string }
  | { tipo: 'sub'; id: string; label: string; itens: ItemMenu[]; desativado?: boolean }
  | { tipo: 'contador'; id: string; label: string; menos: () => void; mais: () => void; desativado?: boolean };
interface Menu { titulo: string; itens: ItemMenu[]; x: number; y: number }

const DESTINOS: [Extract<ManualAction, { k: 'mover' }>['to'], string][] = [
  ['battlefield', 'Campo'], ['hand', 'Mão'], ['graveyard', 'Cemitério'], ['exile', 'Exílio'], ['libraryTop', 'Topo do grimório'], ['libraryBottom', 'Fundo do grimório'],
];
const MARCAS_CARTA: [string, string][] = [['+1/+1', '+1/+1'], ['-1/-1', '−1/−1'], ['loyalty', 'Lealdade'], ['charge', 'Carga'], ['shield', 'Escudo'], ['stun', 'Atordoamento'], ['time', 'Tempo'], ['oil', 'Óleo']];
const MARCAS_JOGADOR: [string, string][] = [['poison', 'Veneno'], ['energy', 'Energia'], ['experience', 'Experiência'], ['rad', 'Radiação']];

/** menu flutuante (clique na carta ou clique direito), com grupos, submenus e contadores −/+ */
function MenuFlutuante({ menu, fechar }: { menu: Menu; fechar: () => void }) {
  const [aberto, setAberto] = useState<string | null>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const caixaSub = useRef<HTMLDivElement>(null);
  const [sub, setSub] = useState<{ itens: ItemMenu[]; x: number; y: number } | null>(null);
  // a altura real só se sabe depois de desenhar: sobe o menu se ele passar da borda de baixo
  useLayoutEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom > innerHeight - 8) el.style.top = `${Math.max(8, innerHeight - 8 - r.height)}px`;
  }, [menu]);
  useLayoutEffect(() => {
    const el = caixaSub.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom > innerHeight - 8) el.style.top = `${Math.max(8, innerHeight - 8 - r.height)}px`;
  }, [sub]);
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar(); };
    addEventListener('keydown', tecla);
    return () => removeEventListener('keydown', tecla);
  }, [fechar]);
  const abrir = (it: Extract<ItemMenu, { tipo: 'sub' }>, el: HTMLElement) => {
    if (it.desativado) return;
    const r = el.getBoundingClientRect();
    const x = r.right + 220 < innerWidth ? r.right + 4 : r.left - 224;
    setAberto(it.id);
    setSub({ itens: it.itens, x, y: Math.min(r.top - 6, innerHeight - 40 - it.itens.length * 36) });
  };
  const linha = (it: ItemMenu, emSub: boolean) => {
    if (it.tipo === 'grupo') return <p key={it.id} class="menu-grupo">{it.label}</p>;
    if (it.tipo === 'contador') {
      return (
        <div key={it.id} class={`menu-contador ${it.desativado ? 'desativado' : ''}`}>
          <span>{it.label}</span>
          <button class="botao pequeno icone" aria-label={`Tirar um marcador ${it.label}`} disabled={it.desativado} onClick={it.menos}>−</button>
          <button class="botao pequeno icone" aria-label={`Pôr um marcador ${it.label}`} disabled={it.desativado} onClick={it.mais}>+</button>
        </div>
      );
    }
    if (it.tipo === 'sub') {
      return (
        <button key={it.id} class={`botao menu-item ${aberto === it.id ? 'aberto' : ''}`} role="menuitem" disabled={it.desativado}
          onMouseEnter={emSub ? undefined : (e) => abrir(it, e.currentTarget as HTMLElement)} onClick={(e) => abrir(it, e.currentTarget as HTMLElement)}>
          <span>{it.label}</span><IconeSeta />
        </button>
      );
    }
    return (
      <button key={it.id} class={`botao menu-item ${it.legal ? 'acao' : ''}`} role="menuitem" disabled={it.desativado}
        onMouseEnter={emSub ? undefined : () => { setAberto(null); setSub(null); }} onClick={() => { fechar(); it.fazer(); }}>
        <TextoComSimbolos texto={traduzir(it.label)} />
      </button>
    );
  };
  return (
    <>
      <div ref={caixa} class="menu-acoes" role="menu" style={{ left: `${menu.x}px`, top: `${menu.y}px` }} onClick={(ev) => ev.stopPropagation()} onContextMenu={(ev) => ev.preventDefault()}>
        <p class="menu-titulo">{menu.titulo}</p>
        {menu.itens.map((it) => linha(it, false))}
        <button class="botao menu-item fantasma" onClick={fechar}>Cancelar</button>
      </div>
      {sub && (
        <div ref={caixaSub} class="menu-acoes submenu" role="menu" style={{ left: `${sub.x}px`, top: `${sub.y}px` }} onClick={(ev) => ev.stopPropagation()} onContextMenu={(ev) => ev.preventDefault()}>
          {sub.itens.map((it) => linha(it, true))}
        </div>
      )}
    </>
  );
}

/** cor de cada jogador na sua tela: você em amarelo, os outros na ordem dos assentos */
const CORES = ['var(--amarelo)', 'var(--vermelho)', 'var(--azul)', 'var(--roxo)'];
const PARAVEIS = new Set<Step>(ETAPAS.map((e) => e.id).filter((s) => !['untap', 'cleanup', 'firstStrikeDamage'].includes(s)));
const CHAVE_LATERAL = 'commander-da-mesa:lateral-recolhida';

/** o tremido discreto de "isso não pode" (sem explicação na mesa real) */
export function tremer(el: Element | null | undefined): void {
  if (!el || !('animate' in el)) return;
  (el as HTMLElement).animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(2px)' }, { transform: 'translateX(0)' }], { duration: 340, easing: 'ease-out' });
}
const elCarta = (id: ObjId) => document.querySelector(`[data-obj="${id}"]`);
const mesmoAlvo = (a: TargetRef, b: TargetRef) => a.kind === b.kind && a.id === b.id;

function lerRecolhida(): boolean {
  try { return localStorage.getItem(CHAVE_LATERAL) === '1'; } catch { return false; }
}
function guardarRecolhida(v: boolean): void {
  try { localStorage.setItem(CHAVE_LATERAL, v ? '1' : '0'); } catch { /* sem armazenamento */ }
}

function rotuloDecisao(d: Decision): string {
  switch (d.kind) {
    case 'payment': return 'Pagamento';
    case 'attackers': case 'blockers': case 'damage': return 'Fase de combate';
    case 'mulligan': return 'Início da partida';
    case 'priority': return 'Prioridade';
    default: return 'Sua escolha';
  }
}

interface FaixaProps {
  v: GameView;
  eu: number;
  d: Decision | null;
  enviando: boolean;
  paradas: StopSettings | null;
  cor: (p: number) => string;
  /** há jogada sua deste turno para desfazer */
  desfazivel: boolean;
  /** pedido de desfazer aberto: a mesa está parada */
  parada: boolean;
  /** bot pensando há mais de um segundo */
  pensando: number | null;
}

function FaixaFases({ v, eu, d, enviando, paradas, cor, desfazivel, parada, pensando }: FaixaProps) {
  const passo = v.turn.step;
  const iFase = FASES.findIndex((f) => f.etapas.includes(passo));
  const contexto = v.turn.active === eu ? 'myTurn' : 'othersTurn';
  const temParada = (s: Step) => !!paradas?.[contexto].includes(s);
  const alternar = (s: Step) => {
    if (!paradas || !PARAVEIS.has(s)) return;
    const lista = temParada(s) ? paradas[contexto].filter((x) => x !== s) : [...paradas[contexto], s];
    const novo = { ...paradas, [contexto]: lista };
    loja.mudar({ paradas: novo });
    loja.enviar({ t: 'paradas', paradas: novo });
  };
  const dica = (s: Step) => `${temParada(s) ? 'Não parar' : 'Parar'} aqui ${contexto === 'myTurn' ? 'no seu turno' : 'no turno dos outros'}`;
  const nomeEtapa = (s: Step) => ETAPAS.find((e) => e.id === s)!;

  const desfazer = desfazivel && !v.gameOver
    ? <button class="botao icone desfazer" title="Desfazer a minha última jogada" aria-label="Desfazer a minha última jogada" onClick={() => loja.enviar({ t: 'desfazer' })}><IconeDesfazer /></button>
    : null;
  // parada nas mágicas dos oponentes: à vista na faixa, porque fora dela a mesa anda sozinha no turno dos outros
  const pilhaOponente = !!paradas?.stopOnOpponentStack;
  const alternarPilha = () => {
    if (!paradas) return;
    const novo = { ...paradas, stopOnOpponentStack: !pilhaOponente };
    loja.mudar({ paradas: novo });
    loja.enviar({ t: 'paradas', paradas: novo });
  };
  const aviso = parada || enviando ? null : avisoPrioridade(v, eu, d);
  let acao;
  if (v.gameOver) acao = <span class="prioridade">Partida<b>encerrada</b></span>;
  else if (parada) acao = <span class="prioridade">Mesa <b>parada</b></span>;
  else if (d && enviando) acao = <span class="prioridade"><b>Enviando…</b></span>;
  else if (d?.kind === 'priority') {
    acao = (<>
      <span class="prioridade">Você tem <b>prioridade</b></span>
      {desfazer}
      <button class="botao cheio" onClick={() => loja.responder(d.id, { kind: 'priority', action: 'pass' })}><IconePassar />Passar</button>
      <button class="botao icone" title="Passar até o fim do turno" aria-label="Passar até o fim do turno" onClick={() => { loja.enviar({ t: 'passarTurno' }); loja.responder(d.id, { kind: 'priority', action: 'pass' }); }}><IconeFimTurno /></button>
    </>);
  } else if (d) acao = <><span class="prioridade">Sua vez de <b>decidir</b></span>{desfazer}</>;
  else if (v.waiting && pensando === v.waiting.player) acao = <><span class="prioridade pensando" style={{ '--cor': cor(v.waiting.player) }}><b>{v.players[v.waiting.player]?.name}</b> está pensando…</span>{desfazer}</>;
  else if (v.waiting) acao = <><span class="prioridade" style={{ '--cor': cor(v.waiting.player) }}>Esperando <b>{v.players[v.waiting.player]?.name}…</b></span>{desfazer}</>;
  else if (desfazer) acao = desfazer;

  return (
    <div class={`fases ${aviso ? 'esperando-voce' : ''}`} aria-label="Fases do turno">
      <div class="fases-turno turno-linha" title={`Turno de ${v.players[v.turn.active].name}`}><span class="rot">Turno</span><strong>{v.turn.number}</strong></div>
      <ol class="fases-lista">
        {FASES.map((f, i) => {
          const atual = i === iFase;
          const principal = f.etapas.length === 1;
          const s0 = f.etapas[0];
          const classe = `fase ${atual ? 'atual' : i < iFase ? 'passada' : ''} ${principal && temParada(s0) ? 'parada' : ''}`;
          const etapas = atual && !principal ? f.etapas.filter((s) => s !== 'firstStrikeDamage' || passo === s) : [];
          const iEtapa = f.etapas.indexOf(passo);
          return (
            <li key={f.id} class={classe} title={principal ? dica(s0) : f.nome} onClick={principal ? () => alternar(s0) : undefined} style={principal ? { cursor: 'pointer' } : undefined}>
              <span class="longo">{f.nome}</span><span class="curto">{f.curto}</span>
              {etapas.length > 0 && (
                <ol class="etapas">
                  {etapas.map((s) => {
                    const k = f.etapas.indexOf(s);
                    const cls = `etapa ${s === passo ? 'atual' : k < iEtapa ? 'passada' : ''} ${temParada(s) ? 'parada' : ''}`;
                    return PARAVEIS.has(s)
                      ? <li key={s}><button type="button" class={cls} title={dica(s)} onClick={() => alternar(s)}>{nomeEtapa(s).curto}</button></li>
                      : <li key={s} class={cls} title={nomeEtapa(s).nome}>{nomeEtapa(s).curto}</li>;
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
      <button type="button" class={`parar-pilha ${pilhaOponente ? 'ligada' : ''}`} aria-pressed={pilhaOponente} onClick={alternarPilha}
        title={pilhaOponente ? 'A mesa para quando um oponente conjura uma mágica ou ativa uma habilidade. Clique para não parar.' : 'A mesa não para nas mágicas dos oponentes. Clique para parar e poder responder.'}>
        <IconeParadas /><span>Mágicas dos oponentes</span>
      </button>
      {acao && <div class="fases-acao">{acao}</div>}
      {aviso && (
        <div class="aviso-prioridade" role="status" style={{ '--cor': cor(aviso.jogador) }}>
          {aviso.texto}<b>{aviso.destaque}</b>{aviso.resto}
        </div>
      )}
    </div>
  );
}

/** avisos curtos do que acabou de acontecer (jogadas, ataques, ajustes manuais) */
function Avisos({ v, cor, doServidor }: { v: GameView; cor: (p: number) => string; doServidor: { id: number; texto: string }[] }) {
  const [lista, setLista] = useState<{ id: number; texto: string; quem: number | null }[]>([]);
  const anterior = useRef<GameView['log'] | null>(null);
  const seq = useRef(0);
  useEffect(() => {
    const ant = anterior.current;
    anterior.current = v.log;
    if (!ant) return;
    // o registro encolheu (uma jogada foi desfeita): os avisos do que voltou saem
    if (v.log.length < ant.length) { setLista([]); return; }
    const ultima = ant[ant.length - 1];
    let k = -1;
    if (ultima) for (let i = v.log.length - 1; i >= 0; i--) if (v.log[i].turn === ultima.turn && v.log[i].text === ultima.text) { k = i; break; }
    const novas = v.log.slice(k + 1).filter((l) => / (joga|conjura|ativa|revela) |ataca:|perde a partida|vence a partida|\(ajuste manual\)/.test(l.text));
    if (!novas.length) return;
    const itens = novas.slice(-3).map((l) => ({ id: seq.current++, texto: traduzir(l.text), quem: v.players.find((p) => l.text.startsWith(`${p.name} `) || l.text.startsWith(`${p.name}:`))?.id ?? null }));
    setLista((a) => [...a, ...itens].slice(-3));
    const ids = new Set(itens.map((i) => i.id));
    setTimeout(() => setLista((a) => a.filter((x) => !ids.has(x.id))), 5000);
  }, [v.log]);
  if (!lista.length && !doServidor.length) return null;
  return (
    <div class="avisos" aria-live="polite">
      {doServidor.map((a) => <div key={`s${a.id}`} class="aviso aviso-mesa">{traduzir(a.texto)}</div>)}
      {lista.map((a) => {
        const nome = a.quem !== null ? v.players[a.quem].name : null;
        return (
          <div key={a.id} class="aviso" style={{ '--cor': a.quem !== null ? cor(a.quem) : 'var(--texto)' }}>
            {nome ? <><b>{nome}</b>{a.texto.slice(nome.length)}</> : a.texto}
          </div>
        );
      })}
    </div>
  );
}

/** a carta que segue o ponteiro durante um arrasto, e a área onde soltar */
function CamadaArrasto({ neutra }: { neutra: boolean }) {
  const f = useFantasma();
  if (!f) return null;
  return (
    <>
      {f.alvo && f.texto && (
        <div class={`alvo-soltar ${f.valido ? '' : 'invalido'}`} style={{ left: `${f.alvo.left}px`, top: `${f.alvo.top}px`, width: `${f.alvo.width}px`, height: `${f.alvo.height}px` }}>
          <span>{f.texto}</span>
        </div>
      )}
      <div class={`arrasto-fantasma ${f.voltando ? 'voltando' : ''} ${neutra ? 'neutra' : ''}`} style={{ left: `${f.x}px`, top: `${f.y}px` }}>
        <Carta o={{ ...f.o, tapped: !!f.virada }} estilo={{ '--w': `${f.w}px` }} />
      </div>
    </>
  );
}

/** Configurações › Auxílios, Efeitos e sons, Mesa */
function Configuracoes({ pref, salaProibe, fechar, reorganizar }: { pref: Preferencias; salaProibe: boolean; fechar: () => void; reorganizar: () => void }) {
  const marcados = auxiliosDoNivel(pref.nivel, pref.personalizado);
  const editavel = pref.nivel === 'personalizado' && !salaProibe;
  const escolherNivel = (n: Preferencias['nivel']) => {
    // ao passar para Personalizado, as caixas começam como o nível que estava valendo
    if (n === 'personalizado' && pref.nivel !== 'personalizado') mudarPreferencias({ nivel: n, personalizado: marcados });
    else mudarPreferencias({ nivel: n });
  };
  return (
    <Janela titulo="Configurações" classe="config" fechar={fechar}>
      <section class="bloco-config" aria-labelledby="cfg-aux">
        <p class="rot" id="cfg-aux">Auxílios <span class="rot-nota">só para você, guardado neste navegador</span></p>
        {salaProibe && <p class="aviso-sala"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>Esta sala não permite auxílios: todos jogam em Mesa real.</p>}
        <div class={`niveis ${salaProibe ? 'travado' : ''}`} role="radiogroup" aria-label="Nível de auxílios">
          {NIVEIS.map((n) => (
            <button key={n.id} type="button" role="radio" aria-checked={pref.nivel === n.id} class={`nivel ${pref.nivel === n.id ? 'ativo' : ''}`} disabled={salaProibe} onClick={() => escolherNivel(n.id)}>
              <b>{n.nome}</b><small>{n.descricao}</small>
            </button>
          ))}
        </div>
        <div class={`auxilios ${salaProibe ? 'travado' : ''}`}>
          {AUXILIOS.map((a) => (
            <label key={a.id} class={`auxilio ${editavel ? '' : 'fixo'}`}>
              <input type="checkbox" id={`aux-${a.id}`} checked={!salaProibe && marcados[a.id]} disabled={!editavel} onChange={() => mudarPreferencias({ personalizado: { ...pref.personalizado, [a.id]: !pref.personalizado[a.id] } })} />
              <span><b>{a.nome}</b><span>{a.descricao}</span></span>
            </label>
          ))}
        </div>
      </section>
      <ConfigSom pref={pref} />
      <section class="bloco-config linha-config">
        <div><strong>Arrumação do campo</strong><p class="suave">Volta todas as suas permanentes para a arrumação padrão.</p></div>
        <button class="botao" onClick={reorganizar}>Reorganizar meu campo</button>
      </section>
    </Janela>
  );
}

export function Mesa() {
  const e = useLoja();
  const v = e.vista!;
  const sala = e.sala!;
  const eu = v.you!;
  const d = v.decision;
  const enviando = !!d && e.respondida === d.id;
  useMusica();

  // estado da interface que vale só para a decisão atual
  const [sel, setSel] = useState<string[]>([]);
  const [ataques, setAtaques] = useState<Record<number, TargetRef | null>>({});
  // a criatura que você acabou de marcar para atacar (o próximo oponente clicado vale para ela)
  const [atacanteAtivo, setAtacanteAtivo] = useState<ObjId | null>(null);
  const [ultimoAlvo, setUltimoAlvo] = useState<TargetRef | null>(null);
  // carta que você soltou no campo e está conjurando: aparece tracejada ali até pagar
  const [conjurando, setConjurando] = useState<{ o: ObjView; x: number; y: number } | null>(null);
  const posPendente = useRef<{ def: string; x: number; y: number; antes: Set<ObjId> } | null>(null);
  const [bloqueios, setBloqueios] = useState<Record<number, ObjId>>({});
  const [bloqueadorAtivo, setBloqueadorAtivo] = useState<ObjId | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [zoom, setZoom] = useState<{ o: ObjView; lado: 'esq' | 'dir' } | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [pegar, setPegar] = useState<PegarCarta | null>(null);
  const [manualAberto, setManualAberto] = useState(false);
  const [recolhida, setRecolhida] = useState(lerRecolhida);
  const [registroAberto, setRegistroAberto] = useState(true);
  const [arrastando, setArrastando] = useState<ObjId | null>(null);
  // ajustes manuais em sequência (ex.: desvirar tudo): um por decisão de prioridade
  const [fila, setFila] = useState<ManualAction[]>([]);
  const [manualTipo, setManualTipo] = useState<TipoManual | undefined>(undefined);
  // posição que você acabou de escolher, até o servidor confirmar
  const [posLocal, setPosLocal] = useState<Record<string, [number, number]>>({});
  const pref = usePreferencias();
  const autoFeito = useRef(new Set<number>());
  useEffect(() => { setSel([]); setAtaques({}); setAtacanteAtivo(null); setUltimoAlvo(null); setBloqueios({}); setBloqueadorAtivo(null); setMenu(null); }, [d?.id]);
  const salaProibe = sala.auxilios === 'proibidos';
  const aux: Auxilios = auxiliosAtivos(pref, salaProibe);
  useEfeitos(v, eu, pref.efeitos);

  // recusa sem texto (mesa real): treme o que você acabou de tocar
  const ultimoToque = useRef<Element | null>(null);
  useEffect(() => {
    const f = (ev: PointerEvent) => { ultimoToque.current = (ev.target as Element | null)?.closest('button, [data-obj]') ?? null; };
    addEventListener('pointerdown', f, true);
    return () => removeEventListener('pointerdown', f, true);
  }, []);
  const recusas = useRef(e.recusa);
  useEffect(() => { if (e.recusa !== recusas.current) { recusas.current = e.recusa; tremer(ultimoToque.current); } }, [e.recusa]);

  // "passar sozinho sem jogada" segue o auxílio das cartas jogáveis (o servidor é quem passa).
  // Manda uma vez por mudança: um servidor de antes da fase 8 descarta o campo e não pode virar um laço
  const pularEnviado = useRef<boolean | null>(null);
  useEffect(() => {
    const p = e.paradas;
    if (!p || (p.skipWhenNothing ?? true) === aux.jogaveis || pularEnviado.current === aux.jogaveis) return;
    pularEnviado.current = aux.jogaveis;
    const novo = { ...p, skipWhenNothing: aux.jogaveis };
    loja.mudar({ paradas: novo });
    loja.enviar({ t: 'paradas', paradas: novo });
  }, [e.paradas, aux.jogaveis]);
  const recolher = (x: boolean) => { setRecolhida(x); guardarRecolhida(x); };
  // a carta sob o mouse some junto com a janela (o mouseleave não chega)
  useEffect(() => { setZoom(null); }, [modal]);

  const confirmarAtaque = () => {
    if (d?.kind !== 'attackers' || enviando) return;
    const sem = Object.entries(ataques).filter(([, t]) => t === null).map(([o]) => Number(o));
    if (sem.length) { for (const o of sem) tremer(elCarta(o)); loja.recusar('Escolha quem cada criatura marcada vai atacar'); return; }
    loja.responder(d.id, { kind: 'attackers', attacks: Object.entries(ataques).map(([o, t]) => [Number(o), t!] as [ObjId, TargetRef]) });
  };
  const confirmarBloqueio = () => {
    if (d?.kind !== 'blockers' || enviando) return;
    loja.responder(d.id, { kind: 'blockers', blocks: Object.entries(bloqueios).map(([b, a]) => [Number(b), a] as [ObjId, ObjId]) });
  };
  const ui: EstadoUi = { sel, setSel, ataques, setAtaques, bloqueios, setBloqueios, bloqueadorAtivo, setBloqueadorAtivo, confirmarAtaque, confirmarBloqueio };
  const minhaReserva = v.players[eu]?.manaPool ?? '';

  // pagamento: com os auxílios, automático ou confirmado sozinho quando a reserva cobre o custo;
  // na mesa real, você vira os terrenos e confirma
  useEffect(() => {
    if (d?.kind !== 'payment' || enviando || autoFeito.current.has(d.id)) return;
    if (aux.pagarAuto && d.canAuto) { autoFeito.current.add(d.id); loja.responder(d.id, { kind: 'payment', auto: true }); return; }
    if (aux.terrenos && d.lifeOptions === 0 && minhaReserva && reservaPaga(d.cost, minhaReserva) === true) { autoFeito.current.add(d.id); loja.responder(d.id, { kind: 'payment', pay: true }); }
  }, [d?.id, enviando, minhaReserva, aux.pagarAuto, aux.terrenos]);
  // a permanente que você soltou no campo entra onde você soltou; se a conjuração não vingou, esquece
  useEffect(() => {
    const p = posPendente.current;
    if (!p) return;
    const nova = v.battlefield.find((o) => !p.antes.has(o.id) && o.def === p.def && o.controller === eu);
    if (nova) {
      posPendente.current = null;
      setConjurando(null);
      setPosLocal((a) => ({ ...a, [nova.id]: [p.x, p.y] }));
      loja.enviar({ t: 'posicao', obj: nova.id, x: p.x, y: p.y });
      return;
    }
    const naPilha = v.stack.some((s) => s.controller === eu && s.def === p.def);
    if (!naPilha && !(d && d.player === eu && d.kind !== 'priority')) { posPendente.current = null; setConjurando(null); }
  }, [v]);
  useEffect(() => {
    if (!fila.length || enviando || d?.kind !== 'priority' || !d.actions.some((a) => a.kind === 'manual')) return;
    loja.manual(d.id, fila[0]);
    setFila(fila.slice(1));
  }, [d?.id, enviando, fila]);
  // a confirmação do servidor substitui a posição local
  useEffect(() => { setPosLocal({}); }, [e.posicoes]);
  const posicoes = useMemo(() => ({ ...e.posicoes, ...posLocal }), [e.posicoes, posLocal]);

  // índice de objetos visíveis
  const todos = useMemo(() => {
    const m = new Map<ObjId, ObjView>();
    for (const o of [...v.battlefield, ...v.hand, ...v.exile, ...v.command, ...v.players.flatMap((p) => p.graveyard)]) m.set(o.id, o);
    return m;
  }, [v]);
  const nomeObj = (id: ObjId) => { const o = todos.get(id); return o ? nomeCarta(o.def, o.name) : (v.stack.find((s) => s.id === id)?.name ?? `objeto ${id}`); };
  const nomeAlvo = (t: TargetRef) => (t.kind === 'player' ? v.players[t.id].name : nomeObj(t.id));

  // ordem dos assentos a partir de mim, e a cor de cada um
  const ordem = useMemo(() => {
    const i = v.turnOrder.indexOf(eu);
    return [...v.turnOrder.slice(i), ...v.turnOrder.slice(0, i)];
  }, [v.turnOrder, eu]);
  const cor = (p: number) => CORES[Math.max(0, ordem.indexOf(p)) % CORES.length];

  // o que cada carta pode fazer na decisão atual
  const itemPorObj = useMemo(() => {
    const m = new Map<ObjId, string>();
    if (d?.kind === 'select') for (const it of d.items) if (it.obj !== undefined && (!it.disabled || !aux.alvos)) m.set(it.obj, it.id);
    return m;
  }, [d, aux.alvos]);
  const itemPorJogador = useMemo(() => {
    const m = new Map<number, string>();
    if (d?.kind === 'select') for (const it of d.items) if (it.player !== undefined && (!it.disabled || !aux.alvos)) m.set(it.player, it.id);
    return m;
  }, [d, aux.alvos]);
  const acoesPorObj = useMemo(() => {
    const m = new Map<ObjId, PriorityAction[]>();
    if (d?.kind === 'priority') for (const a of d.actions) if (a.obj !== undefined) m.set(a.obj, [...(m.get(a.obj) ?? []), a]);
    return m;
  }, [d]);
  const fontesPorObj = useMemo(() => {
    const m = new Map<ObjId, PaymentSource[]>();
    if (d?.kind === 'payment') for (const f of d.sources) m.set(f.obj, [...(m.get(f.obj) ?? []), f]);
    return m;
  }, [d]);
  // ações que não estão presas a nenhuma carta à vista ficam num painel próprio
  const acoesSoltas = d?.kind === 'priority' ? d.actions.filter((a) => !['pass', 'manual', 'mana'].includes(a.kind) && (a.obj === undefined || !todos.has(a.obj))) : [];
  const atacantesCand = d?.kind === 'attackers' ? new Map(d.candidates.map((c) => [c.obj, c.targets])) : null;
  const bloqueadoresCand = d?.kind === 'blockers' ? new Map(d.candidates.map((c) => [c.obj, c.canBlock])) : null;
  const atacando = new Map((v.combat?.attackers ?? []).map((a) => [a.id, a]));
  const bloqueando = new Map((v.combat?.attackers ?? []).flatMap((a) => a.blockers.map((b) => [b, a.id] as const)));

  // alvos de ataque que valem para a criatura marcada agora (ou para as marcadas sem alvo)
  const quemRecebeAlvo = (): ObjId[] => {
    const semAlvo = Object.entries(ataques).filter(([, t]) => t === null).map(([o]) => Number(o));
    return atacanteAtivo !== null && atacanteAtivo in ataques ? [atacanteAtivo, ...semAlvo.filter((o) => o !== atacanteAtivo)] : semAlvo;
  };
  const podeSerAlvo = (t: TargetRef) => quemRecebeAlvo().some((o) => atacantesCand?.get(o)?.some((x) => mesmoAlvo(x, t)));

  const realce = (o: ObjView): Realce => {
    if (pegar) return 'escolhivel';
    if (d?.kind === 'select') {
      const id = itemPorObj.get(o.id);
      if (id === undefined) return null;
      return sel.includes(id) ? 'escolhido' : aux.alvos ? 'escolhivel' : null;
    }
    if (d?.kind === 'payment') return aux.terrenos && !enviando && fontesPorObj.has(o.id) ? 'acao' : null;
    if (d?.kind === 'priority') return aux.jogaveis && acoesPorObj.get(o.id)?.some((a) => a.kind !== 'mana') ? 'acao' : null;
    if (atacantesCand) {
      if (o.id in ataques) return 'atacante';
      if (aux.alvos && atacantesCand.has(o.id)) return 'escolhivel';
      if (aux.alvos && podeSerAlvo({ kind: 'obj', id: o.id })) return 'mira';
      return null;
    }
    if (bloqueadoresCand) {
      if (bloqueadorAtivo === o.id) return 'ativo';
      if (bloqueios[o.id] !== undefined) return 'bloqueador';
      if (aux.alvos && bloqueadorAtivo !== null && bloqueadoresCand.get(bloqueadorAtivo)?.includes(o.id)) return 'mira';
      if (aux.alvos && bloqueadoresCand.get(o.id)?.length) return 'escolhivel';
    }
    if (atacando.has(o.id)) return 'atacante';
    if (bloqueando.has(o.id)) return 'bloqueador';
    return null;
  };
  // selos e inclinação: o que você está marcando agora e o combate já declarado (todos veem)
  const combate = (o: ObjView): EstadoCombate | undefined => {
    if (atacantesCand && o.id in ataques) return { selo: ataques[o.id] ? 'espada' : 'espera', inclinada: true, ativa: atacanteAtivo === o.id };
    if (bloqueadoresCand && bloqueios[o.id] !== undefined) return { selo: 'escudo' };
    if (bloqueadoresCand && bloqueadorAtivo === o.id) return { selo: 'escudo', ativa: true };
    if (atacando.has(o.id)) return { selo: 'espada' };
    if (bloqueando.has(o.id)) return { selo: 'escudo' };
    return undefined;
  };
  const setas = useMemo((): Seta[] => {
    const l: Seta[] = [];
    if (atacantesCand) for (const [o, t] of Object.entries(ataques)) if (t) l.push({ de: Number(o), para: t, tipo: 'ataque' });
    for (const at of v.combat?.attackers ?? []) {
      l.push({ de: at.id, para: at.target, tipo: 'ataque' });
      for (const b of at.blockers) l.push({ de: b, para: { kind: 'obj', id: at.id }, tipo: 'bloqueio' });
    }
    if (bloqueadoresCand) for (const [b, a] of Object.entries(bloqueios)) l.push({ de: Number(b), para: { kind: 'obj', id: a }, tipo: 'bloqueio' });
    return l;
  }, [ataques, bloqueios, v.combat, d?.id]);
  /** o oponente (ou planeswalker/batalha) clicado vira o alvo da criatura marcada agora */
  const alvoAtaque = (t: TargetRef): boolean => {
    if (!atacantesCand || enviando) return false;
    const quem = quemRecebeAlvo();
    if (!quem.length) return false;
    const novo = { ...ataques };
    let algum = false;
    for (const o of quem) if (atacantesCand.get(o)?.some((x) => mesmoAlvo(x, t))) { novo[o] = t; algum = true; }
    if (!algum) { loja.recusar('Ela não pode atacar esse alvo'); return true; }
    setAtaques(novo);
    setUltimoAlvo(t);
    return true;
  };

  const fazerAcao = (a: PriorityAction) => { if (d) loja.responder(d.id, { kind: 'priority', action: a.id }); };
  const abrirMenu = (titulo: string, itens: ItemMenu[], r: DOMRect) => {
    const largura = 260, altura = 92 + itens.length * 38;
    const x = r.right + 10 + largura < innerWidth ? r.right + 10 : Math.max(8, r.left - largura - 10);
    const y = Math.max(8, Math.min(r.top, innerHeight - altura - 8));
    setMenu({ titulo, itens, x, y });
  };
  const legais = (itens: ItemMenu[]) => itens.map((i) => ({ ...i, legal: true }) as ItemMenu);

  // jogar uma carta da mão (duplo clique ou arrastar para o campo)
  const jogadasDe = (o: ObjView) => (d?.kind === 'priority' && !enviando ? (acoesPorObj.get(o.id) ?? []).filter((a) => a.kind === 'play' || a.kind === 'cast') : []);
  const motivo = (o: ObjView): string => {
    if (v.gameOver) return 'A partida acabou';
    if (enviando) return 'Espere a jogada anterior terminar';
    if (!d) return v.waiting ? `Agora é a vez de ${v.players[v.waiting.player]?.name} decidir` : 'Espere a sua prioridade';
    if (d.kind !== 'priority') return 'Termine a decisão atual primeiro';
    const meuTurno = v.turn.active === eu;
    const principal = v.turn.step === 'main1' || v.turn.step === 'main2';
    if (o.types.includes('Land')) {
      if (!meuTurno) return 'Terrenos só no seu turno';
      if (v.stack.length) return 'Terrenos só com a pilha vazia';
      if (!principal) return 'Terrenos só na fase principal';
      return 'Você já jogou um terreno neste turno';
    }
    const rapida = o.types.includes('Instant') || o.keywords.includes('flash');
    if (!rapida && (!meuTurno || !principal || v.stack.length)) return 'Só na sua fase principal, com a pilha vazia';
    return 'Falta mana, alvo válido ou outra condição para conjurar agora';
  };
  /** `pos`: onde a carta foi solta no seu campo (de 0 a 1); ela aparece ali tracejada até pagar */
  const jogar = (o: ObjView, r: DOMRect, pos?: { x: number; y: number }) => {
    const j = jogadasDe(o);
    setMenu(null);
    const fazer = (a: PriorityAction) => {
      if (pos && o.def) {
        posPendente.current = { def: o.def, x: pos.x, y: pos.y, antes: new Set(v.battlefield.map((b) => b.id)) };
        setConjurando({ o, ...pos });
      }
      fazerAcao(a);
    };
    if (j.length === 1) fazer(j[0]);
    else if (j.length > 1) abrirMenu(nomeObj(o.id), legais(j.map((a) => ({ id: a.id, label: a.label, fazer: () => fazer(a) }))), r);
    else loja.recusar(motivo(o));
  };
  const pegarMao = (o: ObjView, ev: PointerEvent, el: HTMLElement) => {
    if (pegar) return;
    acompanharArrasto(ev, () => {
      const r0 = el.getBoundingClientRect();
      const w = el.offsetWidth, h = el.offsetHeight;
      const dx = ev.clientX - r0.left, dy = ev.clientY - r0.top;
      const campo = document.querySelector('.area-eu .campo') as HTMLElement | null;
      const alvo = campo?.getBoundingClientRect() ?? null;
      const j = jogadasDe(o);
      const nome = nomeObj(o.id);
      const texto = j.length ? `Solte para ${o.types.includes('Land') ? 'jogar' : 'conjurar'} ${nome}` : motivo(o);
      // na mesa real, nada de área destacada nem "Solte para…"
      const base = { o, w, alvo: aux.avisos ? alvo : null, texto: aux.avisos ? texto : '', valido: j.length > 0 };
      return {
        inicio: () => { setMenu(null); setZoom(null); setArrastando(o.id); mostrarFantasma({ ...base, x: ev.clientX - dx, y: ev.clientY - dy }); },
        mover: (x: number, y: number) => mostrarFantasma({ ...base, x: x - dx, y: y - dy }),
        soltar: (x: number, y: number) => {
          if (dentro(alvo, x, y) && j.length) {
            mostrarFantasma(null); setArrastando(null);
            const pos = alvo ? { x: Math.min(1, Math.max(0, (x - dx - alvo.left) / alvo.width)), y: Math.min(1, Math.max(0, (y - dy - alvo.top) / alvo.height)) } : undefined;
            jogar(o, new DOMRect(x - dx, y - dy, w, h), pos);
            return;
          }
          // volta para a mão (e, se você tentou jogar o que não pode, treme ao chegar)
          const tentou = dentro(alvo, x, y);
          mostrarFantasma({ ...base, x: r0.left, y: r0.top, voltando: true });
          setTimeout(() => { mostrarFantasma(null); setArrastando(null); if (tentou) loja.recusar(texto); }, 220);
        },
        cancelar: () => { mostrarFantasma(null); setArrastando(null); },
      };
    });
  };
  // combate: arrastar a criatura até a área de quem ela ataca, ou o bloqueador até o atacante
  const pegarCombate = (o: ObjView, ev: PointerEvent, el: HTMLElement): boolean => {
    const alvosAtaque = atacantesCand?.get(o.id);
    const bloqueaveis = bloqueadoresCand?.get(o.id);
    if (!alvosAtaque?.length && !bloqueaveis?.length) return false;
    acompanharArrasto(ev, () => {
      const r0 = el.getBoundingClientRect();
      const w = el.offsetWidth, h = el.offsetHeight;
      const cx = ev.clientX - (r0.left + r0.width / 2), cy = ev.clientY - (r0.top + r0.height / 2);
      const canto = (x: number, y: number) => ({ x: x - cx - w / 2, y: y - cy - h / 2 });
      const texto = alvosAtaque?.length ? 'Solte na área de quem ela vai atacar' : 'Solte em cima da criatura que ela vai bloquear';
      const base = { o, w, alvo: null, texto, valido: true, virada: o.tapped };
      return {
        inicio: () => { setMenu(null); setZoom(null); setArrastando(o.id); mostrarFantasma({ ...base, ...canto(ev.clientX, ev.clientY) }); },
        mover: (x: number, y: number) => mostrarFantasma({ ...base, ...canto(x, y) }),
        soltar: (x: number, y: number) => {
          mostrarFantasma(null); setArrastando(null);
          const sob = document.elementsFromPoint(x, y) as HTMLElement[];
          if (alvosAtaque?.length) {
            // em cima de um planeswalker/batalha atacável, ou da área de um jogador
            const carta = sob.map((e) => e.closest('[data-obj]') as HTMLElement | null).find((e) => e && alvosAtaque.some((t) => t.kind === 'obj' && t.id === Number(e.dataset.obj)));
            const area = sob.map((e) => e.closest('[data-jogador]') as HTMLElement | null).find(Boolean);
            const t = carta ? alvosAtaque.find((a) => a.kind === 'obj' && a.id === Number(carta.dataset.obj))
              : area ? alvosAtaque.find((a) => a.kind === 'player' && a.id === Number(area.dataset.jogador)) : undefined;
            if (t) { setAtaques({ ...ataques, [o.id]: t }); setUltimoAlvo(t); }
            return;
          }
          const carta = sob.map((e) => e.closest('[data-obj]') as HTMLElement | null).find((e) => e && bloqueaveis!.includes(Number(e.dataset.obj)));
          if (carta) { setBloqueios({ ...bloqueios, [o.id]: Number(carta.dataset.obj) }); setBloqueadorAtivo(null); }
        },
        cancelar: () => { mostrarFantasma(null); setArrastando(null); },
      };
    });
    return true;
  };

  // mover uma permanente sua para outro lugar da sua área
  const pegarCampo = (o: ObjView, ev: PointerEvent, el: HTMLElement) => {
    if (pegar) return;
    if (pegarCombate(o, ev, el)) return;
    acompanharArrasto(ev, () => {
      const campo = el.closest('.campo') as HTMLElement;
      const rc = campo.getBoundingClientRect();
      const r0 = el.getBoundingClientRect();
      const w = el.offsetWidth, h = el.offsetHeight;
      // o centro da carta segue o ponteiro (vale também para a carta virada)
      const cx = ev.clientX - (r0.left + r0.width / 2), cy = ev.clientY - (r0.top + r0.height / 2);
      const canto = (x: number, y: number) => ({ x: x - cx - w / 2, y: y - cy - h / 2 });
      const base = { o, w, alvo: rc, texto: '', valido: true, virada: o.tapped };
      return {
        inicio: () => { setMenu(null); setZoom(null); setArrastando(o.id); mostrarFantasma({ ...base, ...canto(ev.clientX, ev.clientY) }); },
        mover: (x: number, y: number) => mostrarFantasma({ ...base, ...canto(x, y) }),
        soltar: (x: number, y: number) => {
          const c = canto(x, y);
          const nx = Math.min(1, Math.max(0, (c.x - rc.left) / rc.width)), ny = Math.min(1, Math.max(0, (c.y - rc.top) / rc.height));
          setPosLocal((a) => ({ ...a, [o.id]: [nx, ny] }));
          loja.enviar({ t: 'posicao', obj: o.id, x: nx, y: ny });
          mostrarFantasma(null); setArrastando(null);
        },
        cancelar: () => { mostrarFantasma(null); setArrastando(null); },
      };
    });
  };

  // clique direito: jogadas válidas, ver a carta, revelar e o ajuste manual
  const decisaoManualId = d?.kind === 'priority' && d.actions.some((a) => a.kind === 'manual') ? d.id : null;
  const manualOk = decisaoManualId !== null && !enviando && !fila.length;
  const manual = (m: ManualAction) => { if (decisaoManualId !== null) loja.manual(decisaoManualId, m); };
  const grupoManual: ItemMenu = { tipo: 'grupo', id: 'g-manual', label: manualOk ? 'Ajuste manual' : 'Ajuste manual (só com prioridade)' };
  const menuCarta = (o: ObjView, ev: MouseEvent) => {
    if (pegar) return;
    setZoom(null);
    const naMao = v.hand.some((x) => x.id === o.id);
    const noCampo = v.battlefield.some((x) => x.id === o.id);
    const itens: ItemMenu[] = [];
    if (d?.kind === 'priority' && !enviando) for (const a of acoesPorObj.get(o.id) ?? []) itens.push({ id: a.id, label: a.label, legal: true, fazer: () => fazerAcao(a) });
    if (d?.kind === 'payment' && !enviando) for (const f of fontesPorObj.get(o.id) ?? []) itens.push({ id: f.id, label: f.label, legal: true, fazer: () => loja.responder(d.id, { kind: 'payment', activate: { source: f.id } }) });
    if (o.def) itens.push({ id: 'ver', label: 'Ver informações', fazer: () => setModal({ tipo: 'carta', o }) });
    if (naMao && !v.gameOver) {
      itens.push({ tipo: 'sub', id: 'revelar', label: 'Revelar', itens: [
        { id: 'r-todos', label: 'Para todos', fazer: () => loja.enviar({ t: 'revelar', obj: o.id, para: 'todos' }) },
        ...v.players.filter((p) => p.id !== eu && !p.left).map((p) => ({ id: `r-${p.id}`, label: `Para ${p.name}`, fazer: () => loja.enviar({ t: 'revelar', obj: o.id, para: [p.id] }) })),
      ] });
    }
    if (!v.gameOver) {
      itens.push(grupoManual);
      if (noCampo) {
        itens.push({ id: 'virar', label: o.tapped ? 'Desvirar' : 'Virar', desativado: !manualOk, fazer: () => manual({ k: 'virar', obj: o.id, tapped: !o.tapped }) });
        itens.push({ tipo: 'sub', id: 'marcadores', label: 'Marcadores', desativado: !manualOk, itens: MARCAS_CARTA.map(([k, nome]) => ({
          tipo: 'contador', id: k, label: nome,
          menos: () => manual({ k: 'marcadores', target: { kind: 'obj', id: o.id }, kind: k, delta: -1 }),
          mais: () => manual({ k: 'marcadores', target: { kind: 'obj', id: o.id }, kind: k, delta: 1 }),
        })) });
      }
      const de = noCampo ? 'battlefield' : naMao ? 'hand' : null;
      itens.push({ tipo: 'sub', id: 'mover', label: 'Mover para…', desativado: !manualOk, itens: DESTINOS.filter(([z]) => z !== de).map(([z, nome]) => ({ id: `m-${z}`, label: nome, fazer: () => manual({ k: 'mover', obj: o.id, to: z }) })) });
      if (noCampo && o.controller === eu && posicoes[o.id]) {
        itens.push({ tipo: 'grupo', id: 'g-mesa', label: 'Mesa' });
        itens.push({ id: 'arrumar', label: 'Voltar à arrumação', fazer: () => { setPosLocal((a) => { const n = { ...a }; delete n[o.id]; return n; }); loja.enviar({ t: 'posicao', obj: o.id, limpar: true }); } });
      }
    }
    abrirMenu(nomeObj(o.id), itens, new DOMRect(ev.clientX, ev.clientY, 0, 0));
  };
  const menuArea = (ev: MouseEvent) => {
    if (pegar || v.gameOver) return;
    setZoom(null);
    const virados = v.battlefield.filter((o) => o.controller === eu && o.tapped);
    const itens: ItemMenu[] = [
      grupoManual,
      { id: 'desvirar', label: 'Desvirar tudo', desativado: !manualOk || !virados.length, fazer: () => setFila(virados.map((o) => ({ k: 'virar', obj: o.id, tapped: false }))) },
      { id: 'ficha', label: 'Criar ficha…', desativado: !manualOk, fazer: () => { setManualTipo('ficha'); setManualAberto(true); } },
      { tipo: 'sub', id: 'marcadores-jogador', label: 'Marcadores de jogador', desativado: !manualOk, itens: MARCAS_JOGADOR.map(([k, nome]) => ({
        tipo: 'contador', id: k, label: nome,
        menos: () => manual({ k: 'marcadores', target: { kind: 'player', id: eu }, kind: k, delta: -1 }),
        mais: () => manual({ k: 'marcadores', target: { kind: 'player', id: eu }, kind: k, delta: 1 }),
      })) },
      { tipo: 'grupo', id: 'g-mesa', label: 'Mesa' },
      { id: 'reorganizar', label: 'Reorganizar meu campo', fazer: () => { setPosLocal({}); loja.enviar({ t: 'posicao', limpar: true }); } },
    ];
    abrirMenu('Seu campo', itens, new DOMRect(ev.clientX, ev.clientY, 0, 0));
  };

  const clicarCarta = (o: ObjView, r: DOMRect) => {
    if (pegar) { pegar.cb(o.id); return; }
    if (!d || enviando) return;
    if (d.kind === 'select') {
      const id = itemPorObj.get(o.id);
      if (id === undefined) return;
      if (sel.includes(id)) setSel(sel.filter((x) => x !== id));
      else if (d.max === 1) setSel([id]);
      else if (sel.length < d.max) setSel([...sel, id]);
      return;
    }
    const sua = o.controller === eu || v.hand.some((x) => x.id === o.id);
    if (d.kind === 'payment') {
      // virar a fonte na mesa: com uma habilidade só, vira direto; com várias, você escolhe
      const fontes = fontesPorObj.get(o.id);
      if (!fontes?.length) { if (sua) loja.recusar('Essa carta não gera mana agora'); return; }
      const ativar = (f: PaymentSource) => loja.responder(d.id, { kind: 'payment', activate: { source: f.id } });
      if (fontes.length === 1) ativar(fontes[0]);
      else abrirMenu(nomeObj(o.id), legais(fontes.map((f) => ({ id: f.id, label: f.label, fazer: () => ativar(f) }))), r);
      return;
    }
    if (d.kind === 'priority') {
      const acoes = acoesPorObj.get(o.id);
      if (!acoes?.length) { if (sua) loja.recusar(v.hand.some((x) => x.id === o.id) ? motivo(o) : 'Essa carta não tem o que fazer agora'); return; }
      // terreno com uma habilidade de mana só: vira e a mana vai para a reserva
      if (acoes.length === 1 && acoes[0].kind === 'mana') { fazerAcao(acoes[0]); return; }
      abrirMenu(nomeObj(o.id), legais(acoes.map((a) => ({ id: a.id, label: a.label, fazer: () => fazerAcao(a) }))), r);
      return;
    }
    if (atacantesCand) {
      const alvos = atacantesCand.get(o.id);
      if (alvos) {
        // clique de novo desmarca
        if (o.id in ataques) { const n = { ...ataques }; delete n[o.id]; setAtaques(n); if (atacanteAtivo === o.id) setAtacanteAtivo(null); return; }
        // um alvo só (um contra um) é automático; senão vai no mesmo oponente da anterior, até você clicar em outro
        const padrao = alvos.length === 1 ? alvos[0] : ultimoAlvo && alvos.some((x) => mesmoAlvo(x, ultimoAlvo)) ? ultimoAlvo : null;
        setAtaques({ ...ataques, [o.id]: padrao });
        setAtacanteAtivo(o.id);
        return;
      }
      // planeswalker ou batalha de um oponente
      if (o.controller !== eu && alvoAtaque({ kind: 'obj', id: o.id })) return;
      if (o.controller === eu && o.types.includes('Creature')) loja.recusar('Essa criatura não pode atacar agora');
      return;
    }
    if (bloqueadoresCand) {
      if (atacando.has(o.id)) {
        if (bloqueadorAtivo !== null && bloqueadoresCand.get(bloqueadorAtivo)?.includes(o.id)) {
          setBloqueios({ ...bloqueios, [bloqueadorAtivo]: o.id });
          setBloqueadorAtivo(null);
        } else loja.recusar(bloqueadorAtivo === null ? 'Clique antes na sua criatura que vai bloquear' : 'Ela não pode bloquear essa criatura');
        return;
      }
      if (bloqueios[o.id] !== undefined) { const n = { ...bloqueios }; delete n[o.id]; setBloqueios(n); return; }
      if (bloqueadoresCand.get(o.id)?.length) { setBloqueadorAtivo(o.id === bloqueadorAtivo ? null : o.id); return; }
      if (o.controller === eu && o.types.includes('Creature')) loja.recusar('Essa criatura não pode bloquear');
    }
  };
  const clicarJogador = (p: number) => {
    if (d?.kind !== 'select') return;
    const id = itemPorJogador.get(p);
    if (id === undefined) return;
    if (sel.includes(id)) setSel(sel.filter((x) => x !== id));
    else if (d.max === 1) setSel([id]);
    else if (sel.length < d.max) setSel([...sel, id]);
  };
  const mostrarZoom = (o: ObjView | null, r?: DOMRect) => setZoom(o && r ? { o, lado: r.left + r.width / 2 < innerWidth / 2 ? 'dir' : 'esq' } : null);

  const anexos = useMemo(() => {
    const m = new Map<ObjId, ObjView[]>();
    const noCampo = new Set(v.battlefield.map((o) => o.id));
    for (const o of v.battlefield) if (o.attachedTo !== null && noCampo.has(o.attachedTo)) m.set(o.attachedTo, [...(m.get(o.attachedTo) ?? []), o]);
    return m;
  }, [v.battlefield]);
  const objsPorJogador = useMemo(() => {
    const noCampo = new Set(v.battlefield.map((o) => o.id));
    const m = new Map<number, ObjView[]>();
    for (const o of v.battlefield) {
      if (o.attachedTo !== null && noCampo.has(o.attachedTo)) continue;
      m.set(o.controller, [...(m.get(o.controller) ?? []), o]);
    }
    return m;
  }, [v.battlefield]);
  const fundoDe = (p: number) => {
    const deck = e.decks.find((x) => x.id === sala.assentos[p]?.deck);
    return deck ? urlFundo(deck.comandante) : null;
  };

  const duelo = sala.modo === '1v1';
  const area = (j: PlayerView, compacta: boolean) => {
    const itemJ = itemPorJogador.get(j.id);
    // declarando ataque: clicar no oponente (área, nome ou vida) escolhe quem a criatura marcada ataca
    const atacarJ = !!atacantesCand && j.id !== eu && Object.keys(ataques).length > 0;
    const alvoJogador = atacarJ && aux.alvos && podeSerAlvo({ kind: 'player', id: j.id });
    return (
      <AreaJogador
        key={j.id}
        j={j}
        objs={objsPorJogador.get(j.id) ?? []}
        anexos={anexos}
        comandantes={v.command.filter((o) => o.owner === j.id)}
        exilio={v.exile.filter((o) => o.owner === j.id)}
        eu={j.id === eu}
        ativo={v.turn.active === j.id}
        decidindo={v.waiting?.player === j.id}
        pensando={e.pensando === j.id && v.waiting?.player === j.id}
        nivel={sala.assentos[j.id]?.tipo === 'bot' ? nomeNivel(sala.assentos[j.id].nivel ?? NIVEL_PADRAO) : null}
        compacta={compacta}
        duelo={duelo}
        cor={cor(j.id)}
        fundo={fundoDe(j.id)}
        realce={realce}
        combate={combate}
        onCarta={clicarCarta}
        onZoom={mostrarZoom}
        jogadorRealce={itemJ !== undefined ? (sel.includes(itemJ) ? 'escolhido' : aux.alvos ? 'escolhivel' : null) : alvoJogador ? 'escolhivel' : null}
        onJogador={itemJ !== undefined ? () => clicarJogador(j.id) : atacarJ ? () => alvoAtaque({ kind: 'player', id: j.id }) : undefined}
        onCliqueArea={atacarJ ? () => alvoAtaque({ kind: 'player', id: j.id }) : undefined}
        conjurando={j.id === eu && conjurando && d && d.player === eu && d.kind !== 'priority' && v.stack.some((x) => x.controller === eu && x.def === conjurando.o.def) ? conjurando : null}
        onZona={(zona) => setModal({ tipo: 'zona', jogador: j.id, zona })}
        mao={j.id === eu ? v.hand : undefined}
        reservaDireita={j.id === eu ? 336 : 0}
        posicoes={posicoes}
        arrastando={arrastando}
        onPegarCampo={j.id === eu && !v.gameOver ? pegarCampo : undefined}
        onPegarMao={j.id === eu ? pegarMao : undefined}
        onDuploMao={j.id === eu ? jogar : undefined}
        onMenuCarta={menuCarta}
        onMenuArea={j.id === eu ? menuArea : undefined}
      />
    );
  };

  const oponentes = ordem.slice(1).map((p) => v.players[p]);
  const minha = v.players[eu];
  const logRef = useRef<HTMLOListElement>(null);
  useEffect(() => { const el = logRef.current; if (el) el.scrollTop = el.scrollHeight; }, [v.log.length, registroAberto, recolhida]);
  const decisaoManual = d?.kind === 'priority' && d.actions.some((a) => a.kind === 'manual') ? d.id : null;
  // sem prioridade, o ajuste manual fecha (antes ele sumia e voltava sozinho na prioridade seguinte)
  useEffect(() => { if (decisaoManual === null) { setManualAberto(false); setManualTipo(undefined); setPegar(null); } }, [decisaoManual]);
  const preJogo = v.turn.number === 0 && !v.gameOver;
  const mostrarDecisao = d && !v.gameOver && !enviando && !preJogo && (d.kind !== 'priority' || acoesSoltas.length > 0);

  return (<>
    <div class={`mesa ${duelo ? 'mesa-duelo' : ''} ${recolhida ? 'recolhida' : ''} ${aux.jogaveis ? 'aux-jogaveis' : ''} ${e.desfazer ? 'parada' : ''}`} onClick={() => setMenu(null)}>
      <main class="tabuleiro" onContextMenu={(ev) => ev.preventDefault()}>
        <div class={`oponentes n${oponentes.length}`}>{oponentes.map((j) => area(j, true))}</div>
        {area(minha, false)}
        <Setas setas={setas} versao={v} />
        <FaixaFases v={v} eu={eu} d={d} enviando={enviando} paradas={e.paradas} cor={cor} desfazivel={e.desfazivel} parada={!!e.desfazer} pensando={e.pensando} />
        {e.desfazer && <PedidoDesfazer p={e.desfazer} eu={eu} nomes={v.players.map((p) => p.name)} cor={cor} />}

        <div class="coluna-dir">
          <Avisos v={v} cor={cor} doServidor={e.avisos} />
          {v.gameOver && (
            <div class="cartao fim">
              <p class="decisao-titulo">Fim de partida</p>
              <p>{v.gameOver.draw ? 'Empate.' : `Venceu: ${v.gameOver.winners.map((w) => v.players[w].name).join(', ')}.`}</p>
              {sala.anfitriao === eu && <button class="botao principal" onClick={() => loja.enviar({ t: 'novaPartida' })}>Nova partida com a mesma mesa</button>}
            </div>
          )}
          {v.stack.length > 0 && (
            <section class="cartao pilha" aria-label="Pilha">
              <div class="pilha-cab"><span class="rot">Pilha</span><span class="rot">{v.stack.length}</span></div>
              <ol>
                {v.stack.map((s, i) => {
                  const img = s.def ? urlImagem(s.def, 0, 'p') : null;
                  return (
                    <li key={s.id} class={`${i === 0 ? 'topo' : ''} ${img ? '' : 'sem-imagem'}`} style={{ '--cor': cor(s.controller) }}>
                      {img && <img src={img} alt="" class="mini" />}
                      <div>
                        <strong>{s.def ? nomeCarta(s.def, s.name) : s.name}</strong>
                        <span><span class="quem">{v.players[s.controller].name}</span><span class="suave">{s.kind !== 'spell' ? (s.kind === 'triggered' ? ' · gatilho' : ' · habilidade') : ''}</span></span>
                        {s.text && <p class="pilha-texto"><TextoComSimbolos texto={traduzir(s.text)} /></p>}
                        {s.targets.length > 0 && <p class="pilha-texto">Alvos: {traduzir(s.targets.join(', '))}</p>}
                        {s.x > 0 && <p class="pilha-texto">X = {s.x}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
          {d && mostrarDecisao && (
            <div class="cartao">
              <p class="rot">{rotuloDecisao(d)}</p>
              <Decisao v={v} d={d} ui={ui} nomeObj={nomeObj} nomeAlvo={nomeAlvo} visivel={(id) => todos.has(id)} acoesSoltas={acoesSoltas} reserva={minhaReserva} aux={aux} />
            </div>
          )}
        </div>

        {e.reveladas.length > 0 && (
          <div class="reveladas" aria-live="polite">
            {e.reveladas.map((r) => {
              const img = urlImagem(r.def, 0, 'm');
              const para = r.para === 'todos' ? 'todos' : r.para.map((p) => v.players[p]?.name).join(', ');
              return (
                <div key={r.id} class="revelada" style={{ '--cor': cor(r.de) }}>
                  <p>{r.de === eu ? <>Você mostrou para <b>{para}</b></> : <><b>{v.players[r.de]?.name}</b> mostrou{r.para === 'todos' ? '' : ' para você'}</>}</p>
                  {img ? <img src={img} alt={nomeCarta(r.def, r.def)} /> : <strong>{nomeCarta(r.def, r.def)}</strong>}
                </div>
              );
            })}
          </div>
        )}
        {preJogo && <MaoInicial v={v} d={d} enviando={enviando} regra={sala.mulligan ?? 'londres'} multiplayer={sala.modo === '4p'} sel={sel} setSel={setSel} />}
      </main>

      <aside class="lateral" aria-label="Menu da partida">
        <div class="marca-jogo"><Marca /><span>COMMANDER DA MESA</span></div>
        <div class="lateral-turno" style={{ '--cor': cor(v.turn.active) }}>
          <span class="rot">Turno</span><strong>{v.turn.number || '–'}</strong>
          <span class="vez">{v.turn.number ? <>vez de <span>{v.players[v.turn.active].name}</span></> : 'antes do 1º turno'}</span>
          {salaProibe && <span class="selo-sala" title="Quem criou a sala proibiu os auxílios: todos jogam em Mesa real">Sala sem auxílios</span>}
        </div>
        <ul class="menu-lateral">
          <li><button class={registroAberto && !recolhida ? 'ativo' : ''} title="Registro" aria-label="Registro" onClick={() => { if (recolhida) { recolher(false); setRegistroAberto(true); } else setRegistroAberto(!registroAberto); }}><IconeRegistro /><span class="rotulo">Registro</span></button></li>
          <li><button title="Paradas" aria-label="Paradas" onClick={() => setModal({ tipo: 'paradas' })}><IconeParadas /><span class="rotulo">Paradas</span></button></li>
          <li><button title="Ajuste manual" aria-label="Ajuste manual" disabled={decisaoManual === null} onClick={() => setManualAberto(true)}><IconeAjuste /><span class="rotulo">Ajuste manual</span></button></li>
          <li><button title="Configurações" aria-label="Configurações" onClick={() => setModal({ tipo: 'config' })}><IconeConfig /><span class="rotulo">Configurações</span></button></li>
          {!v.gameOver && !minha.left && <li><button title="Conceder" aria-label="Conceder" onClick={() => setModal({ tipo: 'conceder' })}><IconeConceder /><span class="rotulo">Conceder</span></button></li>}
          <li><button title="Sair" aria-label="Sair" onClick={() => loja.enviar({ t: 'sair' })}><IconeSair /><span class="rotulo">Sair</span></button></li>
          <li><button class="recolher" title={recolhida ? 'Abrir a barra' : 'Recolher a barra'} aria-label={recolhida ? 'Abrir a barra' : 'Recolher a barra'} onClick={() => recolher(!recolhida)}><IconeRecolher /><span class="rotulo">Recolher</span></button></li>
        </ul>
        <section class={`registro ${registroAberto ? '' : 'escondido'}`} aria-label="Registro da partida">
          <h2>Registro</h2>
          <ol ref={logRef}>
            {v.log.map((l, i) => <li key={i} class={l.text.includes('(ajuste manual)') ? 'manual' : ''}><span class="registro-turno">{l.turn}</span> {traduzir(l.text)}{l.rule ? <span class="regra"> (CR {l.rule})</span> : null}</li>)}
          </ol>
        </section>
      </aside>
    </div>

    {/* camadas por cima da mesa ficam fora da grade dela (dentro, viravam linhas novas e cortavam o tabuleiro) */}
    <CamadaArrasto neutra={!aux.avisos} />
    {/* o zoom fica acima das janelas (ex.: ler uma carta do cemitério com a janela aberta) */}
    {zoom && !arrastando && <div class={`camada-zoom ${recolhida ? 'recolhida' : ''}`}><Zoom o={zoom.o} lado={zoom.lado} enjoo={aux.jogaveis} /></div>}
    {menu && <MenuFlutuante menu={menu} fechar={() => setMenu(null)} />}

    {pegar && (
      <div class="faixa-pegar">
        <span>{pegar.prompt}</span>
        <button class="botao pequeno" onClick={() => { setPegar(null); }}>Cancelar</button>
      </div>
    )}

    {modal?.tipo === 'zona' && (() => {
      const j = v.players[modal.jogador];
      const cartas = modal.zona === 'graveyard' ? j.graveyard : v.exile.filter((o) => o.owner === j.id);
      return (
        <Janela titulo={`${modal.zona === 'graveyard' ? 'Cemitério' : 'Exílio'} de ${j.name} (${cartas.length})`} larga fechar={() => setModal(null)}>
          <div class="grade-cartas">
            {cartas.length === 0 && <p class="suave">Vazio.</p>}
            {[...cartas].reverse().map((o) => <Carta key={o.id} o={o} realce={realce(o)} onZoom={mostrarZoom} onClick={(x, r) => { clicarCarta(x, r); if (pegar || d?.kind === 'priority') setModal(null); }} />)}
          </div>
        </Janela>
      );
    })()}

    {modal?.tipo === 'paradas' && e.paradas && <Paradas atual={e.paradas} fechar={() => setModal(null)} />}

    {modal?.tipo === 'carta' && (
      <Janela titulo={nomeObj(modal.o.id)} classe="carta-info" fechar={() => setModal(null)}>
        <Zoom o={modal.o} fixo enjoo={aux.jogaveis} />
      </Janela>
    )}

    {modal?.tipo === 'config' && (
      <Configuracoes pref={pref} salaProibe={salaProibe} fechar={() => setModal(null)} reorganizar={() => { setPosLocal({}); loja.enviar({ t: 'posicao', limpar: true }); setModal(null); }} />
    )}

    {modal?.tipo === 'conceder' && (
      <Janela titulo="Conceder a partida?" fechar={() => setModal(null)}>
        <p class="suave">Você sai da partida e os outros continuam (CR 104.3a, 800.4a).</p>
        <div class="botoes-linha">
          <button class="botao perigo" onClick={() => { loja.enviar({ t: 'conceder' }); setModal(null); }}>Conceder</button>
          <button class="botao" onClick={() => setModal(null)}>Voltar</button>
        </div>
      </Janela>
    )}

    {manualAberto && decisaoManual !== null && (
      <Manual v={v} decisao={decisaoManual} tipoInicial={manualTipo} escondida={!!pegar} fechar={() => { setManualAberto(false); setManualTipo(undefined); setPegar(null); }} pegar={setPegar} nomeObj={nomeObj} />
    )}
  </>);
}
