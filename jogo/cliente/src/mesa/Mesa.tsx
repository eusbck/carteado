// A mesa: as áreas dos jogadores (com a sua mão), a faixa de fases, a coluna com a pilha e a
// decisão pendente, e a barra lateral retrátil com o menu e o chat (o registro abre numa janela).
// Na mesa real (padrão) a interface não orienta: brilhos, avisos e pagamento automático são
// auxílios que cada um liga nas Configurações (ou que a sala proíbe). As regras continuam no motor.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { StopSettings } from '../../../motor/autopass.ts';
import type { Decision, ManualAction, ObjId, PaymentSource, PriorityAction, Step, TargetRef } from '../../../motor/types.ts';
import type { GameView, ObjView, PlayerView } from '../../../motor/view.ts';
import type { MsgChat } from '../../../servidor/protocolo.ts';
import { avatarDoAssento } from '../avatares.ts';
import { nomeCarta, rostoNoFundo, traduzir, urlFundo, urlImagem } from '../cartas.ts';
import { IconeAjuste, IconeConceder, IconeRecolher as IconeSeta, IconeConfig, IconeDesfazer, IconeFimTurno, IconeParadas, IconePassar, IconeRecolher, IconeRegistro, IconeSair, Marca } from '../icones.tsx';
import { Importacoes } from '../Importacoes.tsx';
import { loja, useLoja } from '../loja.ts';
import { reservaPaga } from '../mana.ts';
import { Janela } from '../Janela.tsx';
import { AUXILIOS, auxiliosAtivos, auxiliosDoNivel, barraAberta, mudarPreferencias, NIVEIS, usePreferencias, type Auxilios, type Preferencias } from '../preferencias.ts';
import { ETAPAS, FASES } from '../pt.ts';
import { acompanharArrasto, dentro, morfar, mostrarFantasma, quadroCarta, quadroDoElemento, quadroTile, useFantasma, type Morfose, type Quadro } from './arrastar.ts';
import { ehDeitavel } from './arrumacao.ts';
import { useMusica } from '../musica.ts';
import { AreaJogador, type EstadoCombate } from './AreaJogador.tsx';
import { ConfigSom } from './ConfigSom.tsx';
import { alternarLeque, cliqueAtaque, marcarVarias } from './ataque.ts';
import { cliqueBloqueio, numerarIguais, respostaBloqueio } from './bloqueio.ts';
import { Carta, type Realce } from './Carta.tsx';
import { Chat } from './Chat.tsx';
import { Decisao, type EstadoUi } from './Decisao.tsx';
import { ehEscolha } from './escolhas.ts';
import { EscolhaRecolhida, JanelaEscolha } from './JanelaEscolha.tsx';
import { PedidoDesfazer } from './Desfazer.tsx';
import { useEfeitos } from './Efeitos.tsx';
import { Setas, type Seta } from './Setas.tsx';
import { MaoInicial } from './MaoInicial.tsx';
import { Abertura, aberturaVista, chaveAbertura, marcarAbertura, type LadoVS } from './Abertura.tsx';
import { Manual, type PegarCarta, type Tipo as TipoManual } from './Manual.tsx';
import { medidas, moverCartas, posicaoAoSoltar, selecionarArea, useArrumar, type NovaPosicao } from './mover.ts';
import { semConfirmadas } from './posicionar.ts';
import { Paradas } from './Paradas.tsx';
import { Registro } from './Registro.tsx';
import { avisoPrioridade } from './prioridade.ts';
import { NIVEL_PADRAO, nomeNivel } from '../../../bots/niveis.ts';
import { TextoComSimbolos } from './Simbolos.tsx';
import { Zoom } from './Zoom.tsx';
import { esconderZoom, mostrarZoom, useZoom } from './zoomLoja.ts';
import { zoomDaPilha } from './zoomPilha.ts';
import { mesmaLista, mesmasPosicoes, mesmoMapaDeListas, useEstavel, useMesmo } from './estavel.ts';

type Modal = { tipo: 'zona'; jogador: number; zona: 'graveyard' | 'exile' } | { tipo: 'paradas' } | { tipo: 'registro' } | { tipo: 'conceder' } | { tipo: 'config' } | { tipo: 'carta'; o: ObjView } | null;
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

/** cor de cada jogador na sua tela: você em ouro (o multicolorido do Magic), os outros em cores de mana
 * (azul, verde e o violeta do preto), na ordem dos assentos */
const CORES = ['var(--ouro)', 'var(--azul)', 'var(--positivo)', 'var(--roxo)'];
/** jogador sem permanentes: sempre a mesma lista vazia (a arrumação da área não se refaz à toa) */
const SEM_OBJS: ObjView[] = [];
/** fora do combate: sempre o mesmo mapa vazio (idem) */
const SEM_COMBATE: ReadonlyMap<ObjId, string> = new Map();
/** soltar a criatura arrastada no combate a até tantos px de onde ela foi pega (sem alvo ali) vale como clique nela */
const RAIO_CLIQUE = 24;
const PARAVEIS = new Set<Step>(ETAPAS.map((e) => e.id).filter((s) => !['untap', 'cleanup', 'firstStrikeDamage'].includes(s)));

/** o tremido discreto de "isso não pode" (sem explicação na mesa real) */
export function tremer(el: Element | null | undefined): void {
  if (!el || !('animate' in el)) return;
  (el as HTMLElement).animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(2px)' }, { transform: 'translateX(0)' }], { duration: 340, easing: 'ease-out' });
}
const elCarta = (id: ObjId) => document.querySelector(`[data-obj="${id}"]`);
const mesmoAlvo = (a: TargetRef, b: TargetRef) => a.kind === b.kind && a.id === b.id;

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
      {/* a mesa conta rodadas (todos tiveram a vez); o turno de cada jogador (CR 500.1) fica nas regras e no registro */}
      <div class="fases-turno turno-linha" data-turno={v.turn.number} title={`Rodada ${v.turn.round}: vez de ${v.players[v.turn.active].name}`}><span class="rot">Rodada</span><strong>{v.turn.round}</strong></div>
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
  // cada aviso some sozinho; os relógios que faltam param quando a mesa sai da tela
  const relogios = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => () => { for (const t of relogios.current) clearTimeout(t); }, []);
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
    const t = setTimeout(() => { relogios.current.delete(t); setLista((a) => a.filter((x) => !ids.has(x.id))); }, 5000);
    relogios.current.add(t);
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
      <div class={`arrasto-fantasma ${f.voltando ? 'voltando' : ''} ${f.pousando ? 'pousando' : ''} ${neutra ? 'neutra' : ''}`} style={{ left: `${f.x}px`, top: `${f.y}px` }}>
        <Carta o={{ ...f.o, tapped: !!f.virada }} estilo={{ '--w': `${f.w}px` }} />
      </div>
    </>
  );
}

/** o zoom da carta sob o mouse: assina o próprio store (passar o mouse não redesenha a mesa) */
function CamadaZoom({ recolhida, enjoo }: { recolhida: boolean; enjoo: boolean }) {
  const zoom = useZoom();
  if (!zoom) return null;
  return <div class={`camada-zoom ${recolhida ? 'recolhida' : ''}`}><Zoom o={zoom.o} lado={zoom.lado} enjoo={enjoo} /></div>;
}

/** Configurações › Auxílios, Efeitos e sons, Mesa */
function Configuracoes({ pref, salaProibe, fechar, reorganizar }: { pref: Preferencias; salaProibe: boolean; fechar: () => void; reorganizar: () => void }) {
  const marcados = auxiliosDoNivel(pref.nivel, pref.personalizado);
  const editavel = pref.nivel === 'personalizado' && !salaProibe;
  // sem valor: o padrão (retrato no canto, terrenos deitados)
  const canto = pref.avatarCanto !== false;
  const deitados = pref.terrenosDeitados !== false;
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
      <section class="bloco-config" aria-labelledby="cfg-retrato">
        <p class="rot" id="cfg-retrato">Seu retrato na mesa <span class="rot-nota">guardado neste navegador</span></p>
        <div class="segmentado" role="radiogroup" aria-label="Seu retrato na mesa">
          <button type="button" role="radio" aria-checked={canto} class={canto ? 'ativo' : ''} onClick={() => mudarPreferencias({ avatarCanto: true })}>No canto<small>em cima, à direita do seu campo</small></button>
          <button type="button" role="radio" aria-checked={!canto} class={!canto ? 'ativo' : ''} onClick={() => mudarPreferencias({ avatarCanto: false })}>À esquerda<small>numa coluna acima do Comando</small></button>
        </div>
      </section>
      <section class="bloco-config" aria-labelledby="cfg-terrenos">
        <p class="rot" id="cfg-terrenos">Terrenos no campo <span class="rot-nota">guardado neste navegador</span></p>
        <div class="segmentado" role="radiogroup" aria-label="Terrenos no campo">
          <button type="button" role="radio" aria-checked={deitados} class={deitados ? 'ativo' : ''} onClick={() => mudarPreferencias({ terrenosDeitados: true })}>Deitados<small>baixos e largos, com a arte; os iguais num leque só</small></button>
          <button type="button" role="radio" aria-checked={!deitados} class={!deitados ? 'ativo' : ''} onClick={() => mudarPreferencias({ terrenosDeitados: false })}>Cartas inteiras<small>de pé, como as outras permanentes</small></button>
        </div>
      </section>
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
  const [modal, setModal] = useState<Modal>(null);
  const [pegar, setPegar] = useState<PegarCarta | null>(null);
  const [manualAberto, setManualAberto] = useState(false);
  const [arrastando, setArrastando] = useState<ObjId | null>(null);
  // ajustes manuais em sequência (ex.: desvirar tudo): um por decisão de prioridade
  const [fila, setFila] = useState<ManualAction[]>([]);
  const [manualTipo, setManualTipo] = useState<TipoManual | undefined>(undefined);
  // posição que você acabou de escolher, até o servidor confirmar
  const [posLocal, setPosLocal] = useState<Record<string, [number, number]>>({});
  const pref = usePreferencias();
  // terrenos deitados (Configurações › Terrenos no campo) e o lado do seu retrato; sem valor, o padrão
  const deitados = pref.terrenosDeitados !== false;
  const ladoAvatar = pref.avatarCanto === false ? 'esquerda' : 'canto';
  // barra recolhida: fica só com os ícones (sem o chat) e a mesa ocupa o resto (guardado no navegador)
  const recolhida = !barraAberta(pref);
  // janela de escolha recolhida para olhar a mesa (volta aberta a cada decisão nova)
  const [escolhaRecolhida, setEscolhaRecolhida] = useState(false);
  useEffect(() => { setEscolhaRecolhida(false); }, [d?.id]);
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
  const recolher = (x: boolean) => mudarPreferencias({ registro: !x });
  // a carta sob o mouse some junto com a janela (o mouseleave não chega)
  useEffect(() => { esconderZoom(); }, [modal]);

  const confirmarAtaque = () => {
    if (d?.kind !== 'attackers' || enviando) return;
    const sem = Object.entries(ataques).filter(([, t]) => t === null).map(([o]) => Number(o));
    if (sem.length) { for (const o of sem) tremer(elCarta(o)); loja.recusar('Escolha quem cada criatura marcada vai atacar'); return; }
    loja.responder(d.id, { kind: 'attackers', attacks: Object.entries(ataques).map(([o, t]) => [Number(o), t!] as [ObjId, TargetRef]) });
  };
  const confirmarBloqueio = () => {
    if (d?.kind !== 'blockers' || enviando) return;
    loja.responder(d.id, respostaBloqueio(bloqueios));
  };
  /** marca de uma vez (retângulo no campo, "Atacar com todas"): nenhuma fica escolhida, o próximo oponente clicado vale
   *  para todas as marcadas sem alvo */
  const marcarAtacantes = (ids: ObjId[]) => {
    if (d?.kind !== 'attackers' || enviando) return;
    const r = marcarVarias(d.candidates, ataques, ids, ultimoAlvo);
    setAtaques(r.ataques);
    setAtacanteAtivo(r.ativo);
  };
  const atacarComTodas = () => { if (d?.kind === 'attackers') marcarAtacantes(d.candidates.map((c) => c.obj)); };
  const ui: EstadoUi = { sel, setSel, ataques, setAtaques, bloqueios, setBloqueios, bloqueadorAtivo, setBloqueadorAtivo, confirmarAtaque, confirmarBloqueio, atacarComTodas };
  const minhaReserva = v.players[eu]?.manaPool ?? '';
  // a mana que a permanente gerou ainda está toda na reserva: desvirar à mão faz ela sair. Com parte dela gasta
  // (manaGasta), o motor recusa o desvirar: desvirar e virar de novo daria mana de graça
  const manaNaReserva = (o: ObjView) => !o.manaGasta && !!v.players[o.controller]?.manaSources?.includes(o.id);

  // pagamento: com os auxílios, automático ou confirmado sozinho quando a reserva cobre o custo;
  // na mesa real, você vira os terrenos e confirma
  useEffect(() => {
    if (d?.kind !== 'payment' || enviando || autoFeito.current.has(d.id)) return;
    if (aux.pagarAuto && d.canAuto) { autoFeito.current.add(d.id); loja.responder(d.id, { kind: 'payment', auto: true }); return; }
    if (aux.terrenos && d.lifeOptions === 0 && minhaReserva && reservaPaga(d.cost, minhaReserva) === true) { autoFeito.current.add(d.id); loja.responder(d.id, { kind: 'payment', pay: true }); }
  }, [d?.id, enviando, minhaReserva, aux.pagarAuto, aux.terrenos]);
  // a carta arrastada que pousou no campo sai quando a permanente (ou o tracejado de "pagando") toma o lugar dela
  // (o pouso termina sempre antes da troca: com o servidor respondendo rápido, a troca cortava a animação no meio)
  const POUSO_MS = 200;
  const pouso = useRef<{ desde: number; timer: ReturnType<typeof setTimeout> } | null>(null);
  const terminarPouso = () => {
    if (!pouso.current) return;
    clearTimeout(pouso.current.timer);
    pouso.current = null;
    mostrarFantasma(null);
    setArrastando(null);
  };
  const encerrarPouso = () => {
    const p = pouso.current;
    if (!p) return;
    const falta = POUSO_MS - (Date.now() - p.desde);
    if (falta <= 0) { terminarPouso(); return; }
    clearTimeout(p.timer);
    p.timer = setTimeout(terminarPouso, falta);
  };
  // a carta que volta para a mão depois de um arrasto que não deu em jogada
  const voltaMao = useRef<ReturnType<typeof setTimeout> | null>(null);

  // terreno jogado da mão com os terrenos deitados: a carta se transforma no terreno numa transição só (arrastar.ts,
  // morfar). Arrastando, ela começa ao soltar (o lugar é o do ponto solto); com duplo clique ou pelo menu, quando o
  // terreno chega (o lugar é o da arrumação), saindo de onde a carta estava na mão (`de`). O terreno de verdade fica
  // escondido enquanto ela anda e, quando ela chega, aparece no mesmo lugar e ela sai no quadro seguinte (sem piscar).
  // Se o terreno não chegar (jogada recusada), ela sai sozinha
  interface Chegada { def: string; antes: Set<ObjId>; de: Quadro | null; morfose: Morfose | null; id: ObjId | null; acabou: boolean; timer: ReturnType<typeof setTimeout> }
  const chegada = useRef<Chegada | null>(null);
  const [, redesenharChegada] = useState(0);
  const encerrarChegada = (c: Chegada | null = chegada.current) => {
    if (!c || chegada.current !== c) return;
    chegada.current = null;
    clearTimeout(c.timer);
    if (c.id !== null) document.querySelector(`.area-eu .campo > [data-obj="${c.id}"]`)?.classList.remove('chegando');
    const m = c.morfose;
    if (m) requestAnimationFrame(() => m.remover());
    // a carta arrastada (escondida na mão até aqui) já saiu da mão, ou volta a aparecer nela
    if (c.morfose) setArrastando(null);
    redesenharChegada((n) => n + 1);
  };
  const concluirChegada = (c: Chegada) => { if (c.id !== null && c.acabou) encerrarChegada(c); };
  const iniciarChegada = (o: ObjView, de: Quadro, para: Quadro | null) => {
    encerrarChegada();
    // rede de segurança: o terreno que não chegou em 3 s (jogada que não vingou) não deixa a carta parada no caminho;
    // o que já chegou espera a transformação acabar
    const c: Chegada = { def: o.def!, antes: new Set(v.battlefield.map((b) => b.id)), de, morfose: null, id: null, acabou: false, timer: setTimeout(() => { if (c.id === null || c.acabou) encerrarChegada(c); }, 3000) };
    chegada.current = c;
    if (para) c.morfose = morfar(de, para, urlImagem(o.def!, o.face, 'p'), nomeCarta(o.def!, o.name), () => { c.acabou = true; concluirChegada(c); });
  };
  /** um arrasto novo começou: o pouso ou a volta à mão da carta anterior terminam já (os relógios deles não podem
   *  apagar a carta que você acabou de pegar) */
  const arrastoAnteriorFim = () => {
    terminarPouso();
    encerrarChegada();
    if (voltaMao.current) { clearTimeout(voltaMao.current); voltaMao.current = null; }
  };
  // a mesa saiu da tela: nenhum relógio do arrasto fica para mexer nela depois, e o zoom não fica para a próxima
  useEffect(() => () => {
    if (pouso.current) clearTimeout(pouso.current.timer);
    if (voltaMao.current) clearTimeout(voltaMao.current);
    mostrarFantasma(null);
    esconderZoom();
  }, []);
  // com o tracejado de "pagando" já no lugar, a carta arrastada sai assim que termina de pousar
  useEffect(() => { if (conjurando) encerrarPouso(); }, [conjurando]);
  // jogada recusada: ela não fica parada no campo (a transformação que ainda espera o terreno também sai)
  useEffect(() => { encerrarPouso(); if (chegada.current?.id === null) encerrarChegada(); }, [e.recusa, e.erro]);
  // a permanente que você soltou no campo entra onde você soltou; se a conjuração não vingou, esquece
  useEffect(() => {
    const p = posPendente.current;
    if (!p) return;
    const nova = v.battlefield.find((o) => !p.antes.has(o.id) && o.def === p.def && o.controller === eu);
    if (nova) {
      posPendente.current = null;
      setConjurando(null);
      encerrarPouso();
      setPosLocal((a) => ({ ...a, [nova.id]: [p.x, p.y] }));
      loja.enviar({ t: 'posicao', obj: nova.id, x: p.x, y: p.y });
      return;
    }
    const naPilha = v.stack.some((s) => s.controller === eu && s.def === p.def);
    if (!naPilha && !(d && d.player === eu && d.kind !== 'priority')) { posPendente.current = null; setConjurando(null); encerrarPouso(); }
  }, [v]);
  useEffect(() => {
    if (!fila.length || enviando || d?.kind !== 'priority' || !d.actions.some((a) => a.kind === 'manual')) return;
    loja.manual(d.id, fila[0]);
    setFila(fila.slice(1));
  }, [d?.id, enviando, fila]);
  // a confirmação do servidor substitui a posição local; uma vista que chega antes dela (um bot
  // jogando) não desfaz o que você acabou de soltar
  useEffect(() => {
    const minhas = new Set(v.battlefield.filter((o) => o.controller === eu).map((o) => String(o.id)));
    setPosLocal((a) => semConfirmadas(a, e.posicoes, (id) => minhas.has(id)));
  }, [e.posicoes]);
  // a permanente que você acabou de soltar já nasce no ponto onde foi solta: esperar o efeito acima fazia o primeiro
  // desenho sair na arrumação padrão, e a transição de posição a trazia deslizando de lá até o ponto. Ela entra na lista
  // das "pousadas", que nascem sem a animação de surgir (a carta arrastada pousou ali; a lista só cresce: tirar alguém
  // dela faria a animação rodar de novo, e cada carta que muda de zona ganha id novo)
  const pousadas = useRef(new Set<ObjId>());
  const posicoesNovas = useMemo(() => {
    const todas = { ...e.posicoes, ...posLocal };
    const p = posPendente.current;
    const nova = p && v.battlefield.find((o) => !p.antes.has(o.id) && o.def === p.def && o.controller === eu);
    if (p && nova) { pousadas.current.add(nova.id); if (!todas[String(nova.id)]) todas[String(nova.id)] = [p.x, p.y]; }
    return todas;
  }, [e.posicoes, posLocal, v.battlefield]);
  // o terreno que chegou enquanto a carta jogada ainda se transforma nele: nasce sem a animação de surgir e fica
  // escondido até ela chegar
  const terrenoChegou = (() => {
    const c = chegada.current;
    return c ? v.battlefield.find((o) => !c.antes.has(o.id) && o.def === c.def && o.controller === eu) ?? null : null;
  })();
  if (terrenoChegou) pousadas.current.add(terrenoChegou.id);
  const chegando = terrenoChegou && chegada.current && !chegada.current.acabou ? terrenoChegou.id : null;
  // logo depois de desenhar (antes de aparecer na tela): com o lugar do terreno na arrumação, a carta que saiu da mão
  // começa a se transformar (duplo clique, menu); arrastando, ela já está a caminho e só falta acabar
  useLayoutEffect(() => {
    const c = chegada.current;
    if (!c || c.id !== null || !terrenoChegou) return;
    c.id = terrenoChegou.id;
    if (!c.morfose && c.de) {
      const el = document.querySelector<HTMLElement>(`.area-eu .campo > [data-obj="${terrenoChegou.id}"]`);
      const campo = el?.closest('.campo');
      if (el && campo && el.classList.contains('deitada')) {
        const rc = campo.getBoundingClientRect();
        const para = quadroTile(rc.left + parseFloat(el.style.left), rc.top + parseFloat(el.style.top), el.offsetWidth, el.offsetHeight, parseFloat(getComputedStyle(el).rotate) || 0);
        const o = terrenoChegou;
        c.morfose = morfar(c.de, para, urlImagem(o.def!, o.face, 'p'), nomeCarta(o.def!, o.name), () => { c.acabou = true; concluirChegada(c); }, o.tapped);
        return;
      }
      c.acabou = true;
    }
    concluirChegada(c);
  }, [v.battlefield]);
  // as mesmas posições de antes ficam com a mesma referência: a arrumação de cada área só se refaz se algo mudou
  const posicoes = useMesmo(posicoesNovas, mesmasPosicoes);

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
  // o combate declarado na chave dos leques (arrumacao.ts): quem ataca um jogador sai do leque de quem ataca outro, e
  // quem bloqueia um atacante sai do leque de quem bloqueia outro
  const chaveCombate = useMemo(() => {
    if (!v.combat?.attackers.length) return SEM_COMBATE;
    const m = new Map<ObjId, string>();
    for (const a of v.combat.attackers) {
      m.set(a.id, `A${a.target.kind === 'player' ? 'p' : 'o'}${a.target.id}`);
      for (const b of a.blockers) m.set(b, `B${a.id}`);
    }
    return m;
  }, [v.combat]);
  // as de nome igual na decisão de combate ganham número: o painel diz "Zumbi #2" e a carta mostra "#2"
  const numeros = useMemo(() => (d?.kind === 'attackers' ? numerarIguais(d.candidates.map((c) => c.obj), nomeObj)
    : d?.kind === 'blockers' ? numerarIguais(d.attackers, nomeObj) : null), [d, todos]);

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
      // os atacantes que a escolhida pode bloquear, também na mesa real (o clique seguinte é num deles)
      if (bloqueadorAtivo !== null && bloqueadoresCand.get(bloqueadorAtivo)?.includes(o.id)) return 'bloqueavel';
      if (aux.alvos && bloqueadoresCand.get(o.id)?.length) return 'escolhivel';
    }
    if (atacando.has(o.id)) return 'atacante';
    if (bloqueando.has(o.id)) return 'bloqueador';
    return null;
  };
  // selos e inclinação: o que você está marcando agora e o combate já declarado (todos veem)
  const combate = (o: ObjView): EstadoCombate | undefined => {
    const numero = numeros?.get(o.id)?.n ?? undefined;
    if (atacantesCand && o.id in ataques) return { selo: ataques[o.id] ? 'espada' : 'espera', inclinada: true, ativa: atacanteAtivo === o.id, numero };
    if (atacantesCand && numero !== undefined) return { numero };
    // a escolhida antes: quem já bloqueia também pode ser a escolhida (para trocar de atacante)
    if (bloqueadoresCand && bloqueadorAtivo === o.id) return { selo: 'escudo', ativa: true };
    if (bloqueadoresCand && bloqueios[o.id] !== undefined) return { selo: 'escudo' };
    // bloqueando em 4 jogadores: quem ataca outro jogador fica apagado (não dá para bloquear)
    if (atacando.has(o.id)) return { selo: 'espada', numero, alheia: d?.kind === 'blockers' && !d.attackers.includes(o.id) };
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
      // terreno jogado sem arrastar (duplo clique, menu): a carta sai de onde está na mão e vira o terreno quando ele
      // chegar ao lugar dele na arrumação
      const naMao = !pos && a.kind === 'play' && deitados && ehDeitavel(o) ? document.querySelector<HTMLElement>(`.mao-cartas [data-obj="${o.id}"]`) : null;
      if (naMao) iniciarChegada(o, quadroDoElemento(naMao), null);
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
      // ponto pego em fração da carta como ela aparece (com o hover da mão): vale para o fantasma e para a carta no campo
      const fx = (ev.clientX - r0.left) / r0.width, fy = (ev.clientY - r0.top) / r0.height;
      const dx = fx * w, dy = fy * h;
      const campo = document.querySelector('.area-eu .campo') as HTMLElement | null;
      const alvo = campo?.getBoundingClientRect() ?? null;
      const j = jogadasDe(o);
      const nome = nomeObj(o.id);
      const texto = j.length ? `Solte para ${o.types.includes('Land') ? 'jogar' : 'conjurar'} ${nome}` : motivo(o);
      // na mesa real, nada de área destacada nem "Solte para…"
      const base = { o, w, alvo: aux.avisos ? alvo : null, texto: aux.avisos ? texto : '', valido: j.length > 0 };
      return {
        inicio: () => { arrastoAnteriorFim(); setMenu(null); esconderZoom(); setArrastando(o.id); mostrarFantasma({ ...base, x: ev.clientX - dx, y: ev.clientY - dy }); },
        mover: (x: number, y: number) => mostrarFantasma({ ...base, x: x - dx, y: y - dy }),
        soltar: (x: number, y: number) => {
          if (dentro(alvo, x, y) && j.length) {
            // terreno deitado: o lugar é o da peça baixa e larga, e a carta se transforma nela a caminho de lá
            const tile = deitados && ehDeitavel(o) && campo ? { w: Number(campo.dataset.tileW), h: Number(campo.dataset.tileH) } : null;
            const pos = campo ? posicaoAoSoltar(campo, x, y, fx, fy, tile ?? undefined) : undefined;
            if (campo && pos && j.length === 1 && tile) {
              const rc = campo.getBoundingClientRect();
              const m = medidas(campo);
              mostrarFantasma(null);
              iniciarChegada(o, quadroCarta(x - dx, y - dy, w, h, -5, 1.05), quadroTile(rc.left + pos.x * m.W, rc.top + pos.y * m.H, tile.w, tile.h));
            } else if (campo && pos && j.length === 1) {
              // pousa: a carta arrastada vai para o canto onde a permanente vai ficar e fica do tamanho das cartas do
              // campo; ela some quando a permanente (ou o tracejado de "pagando") aparecer ali. A carta da mão continua
              // escondida até lá (o arrasto só termina no fim do pouso)
              const rc = campo.getBoundingClientRect();
              const m = medidas(campo);
              const wc = Number(campo.dataset.cartaW) || w;
              mostrarFantasma({ ...base, alvo: null, texto: '', x: rc.left + pos.x * m.W, y: rc.top + pos.y * m.H, w: wc, pousando: true });
              if (pouso.current) clearTimeout(pouso.current.timer);
              // rede de segurança: se nada tomar o lugar dela, ela não fica parada no campo
              pouso.current = { desde: Date.now(), timer: setTimeout(terminarPouso, 3000) };
            } else { mostrarFantasma(null); setArrastando(null); }
            jogar(o, new DOMRect(x - dx, y - dy, w, h), pos);
            return;
          }
          // volta para a mão (e, se você tentou jogar o que não pode, treme ao chegar)
          const tentou = dentro(alvo, x, y);
          mostrarFantasma({ ...base, x: r0.left, y: r0.top, voltando: true });
          if (voltaMao.current) clearTimeout(voltaMao.current);
          voltaMao.current = setTimeout(() => { voltaMao.current = null; mostrarFantasma(null); setArrastando(null); if (tentou) loja.recusar(texto); }, 220);
        },
        cancelar: () => { mostrarFantasma(null); setArrastando(null); },
      };
    });
  };
  // combate: arrastar a criatura até a área de quem ela ataca, ou o bloqueador até o atacante. Um arrasto curto que não
  // deu em nada vale como clique nela (a mão treme ao clicar; no leque, o ponteiro escorregava para a vizinha e o
  // clique se perdia)
  const pegarCombate = (o: ObjView, ev: PointerEvent, el: HTMLElement): boolean => {
    const alvosAtaque = atacantesCand?.get(o.id);
    const bloqueaveis = bloqueadoresCand?.get(o.id);
    if (!alvosAtaque?.length && !bloqueaveis?.length) return false;
    const rPega = el.getBoundingClientRect();
    // a versão mais nova do clique (o estado pode ter mudado desde o botão descer)
    const comoClique = () => tCarta(o, rPega);
    acompanharArrasto(ev, () => {
      const r0 = el.getBoundingClientRect();
      const w = el.offsetWidth, h = el.offsetHeight;
      const cx = ev.clientX - (r0.left + r0.width / 2), cy = ev.clientY - (r0.top + r0.height / 2);
      const canto = (x: number, y: number) => ({ x: x - cx - w / 2, y: y - cy - h / 2 });
      const texto = alvosAtaque?.length ? 'Solte na área de quem ela vai atacar' : 'Solte em cima da criatura que ela vai bloquear';
      const base = { o, w, alvo: null, texto, valido: true, virada: o.tapped };
      return {
        inicio: () => { arrastoAnteriorFim(); setMenu(null); esconderZoom(); setArrastando(o.id); mostrarFantasma({ ...base, ...canto(ev.clientX, ev.clientY) }); },
        mover: (x: number, y: number) => mostrarFantasma({ ...base, ...canto(x, y) }),
        soltar: (x: number, y: number) => {
          mostrarFantasma(null); setArrastando(null);
          const sob = document.elementsFromPoint(x, y) as HTMLElement[];
          // sem alvo onde soltou: perto de onde pegou (ou em cima dela mesma), foi um clique que tremeu
          const clique = () => { if (Math.hypot(x - ev.clientX, y - ev.clientY) <= RAIO_CLIQUE || dentro(rPega, x, y)) comoClique(); };
          if (alvosAtaque?.length) {
            // em cima de um planeswalker/batalha atacável, ou da área de um jogador
            const carta = sob.map((e) => e.closest('[data-obj]') as HTMLElement | null).find((e) => e && alvosAtaque.some((t) => t.kind === 'obj' && t.id === Number(e.dataset.obj)));
            const area = sob.map((e) => e.closest('[data-jogador]') as HTMLElement | null).find(Boolean);
            const t = carta ? alvosAtaque.find((a) => a.kind === 'obj' && a.id === Number(carta.dataset.obj))
              : area ? alvosAtaque.find((a) => a.kind === 'player' && a.id === Number(area.dataset.jogador)) : undefined;
            if (t) { setAtaques({ ...ataques, [o.id]: t }); setUltimoAlvo(t); } else clique();
            return;
          }
          const carta = sob.map((e) => e.closest('[data-obj]') as HTMLElement | null).find((e) => e && bloqueaveis!.includes(Number(e.dataset.obj)));
          if (carta) { setBloqueios({ ...bloqueios, [o.id]: Number(carta.dataset.obj) }); setBloqueadorAtivo(null); } else clique();
        },
        cancelar: () => { mostrarFantasma(null); setArrastando(null); },
      };
    // sem passar do limite: o clique do navegador cuida, se o botão subiu em cima dela; se o ponteiro escorregou para
    // fora (a vizinha do leque), o navegador manda o clique para o campo e ele se perde: a mesa clica nela
    }, (e) => { if (el.contains(e.target as Node)) return false; comoClique(); return true; }, 10);
    return true;
  };

  // mover permanentes suas no seu campo (mover.ts): a carta pega com os anexos dela ou, se ela
  // está na seleção, a seleção inteira; a posição vale na hora aqui e vai para a sala numa mensagem
  const pegarCampo = (o: ObjView, ev: PointerEvent, el: HTMLElement) => {
    if (pegar) return;
    if (pegarCombate(o, ev, el)) return;
    const dono = arrumar.dono(o.id) ?? o.id;
    const guardar = arrumar.selecao.has(dono) ? [...arrumar.selecao] : [dono];
    const mover = guardar.flatMap((id) => [...(anexos.get(id) ?? []).map((a) => a.id), id]);
    moverCartas(ev, el, mover, guardar, {
      inicio: () => { arrastoAnteriorFim(); setMenu(null); esconderZoom(); },
      soltar: (novas: NovaPosicao[]) => {
        if (!novas.length) return;
        setPosLocal((a) => { const n = { ...a }; for (const q of novas) n[q.obj] = [q.x, q.y]; return n; });
        arrumar.trazerParaFrente(novas.map((q) => q.obj));
        loja.enviar(novas.length === 1 ? { t: 'posicao', ...novas[0] } : { t: 'posicao', lista: novas });
      },
    });
  };
  // botão apertado no espaço vazio do seu campo: retângulo de seleção (com Shift, soma à seleção);
  // um clique sem arrastar desfaz a seleção. Declarando atacantes, o retângulo que pega criaturas que podem atacar
  // marca todas elas para atacar (o próximo oponente clicado vale para todas)
  const pegarCampoVazio = (ev: PointerEvent, campo: HTMLElement) => {
    if (pegar || v.gameOver) return;
    const somar = ev.shiftKey;
    selecionarArea(ev, campo, arrumar.dono, (ids) => {
      if (ids === null) { arrumar.limpar(); return; }
      if (tMarcarArea(ids)) return;
      setMenu(null);
      arrumar.selecionar(ids, somar);
    });
  };
  /** as do retângulo que podem atacar ficam marcadas; false se nenhuma pode (o retângulo vira seleção para mover) */
  const marcarArea = (ids: ObjId[]): boolean => {
    if (d?.kind !== 'attackers' || enviando) return false;
    const cands = ids.filter((id) => d.candidates.some((c) => c.obj === id));
    if (!cands.length) return false;
    setMenu(null);
    marcarAtacantes(cands);
    return true;
  };
  /** o selo ×n de um leque das suas criaturas, declarando atacantes: marca as que faltam ou, todas marcadas, desmarca */
  const clicarLeque = (ids: ObjId[]) => {
    if (d?.kind !== 'attackers' || enviando) return;
    const r = alternarLeque(d.candidates, { ataques, ativo: atacanteAtivo }, ids, ultimoAlvo);
    if (!r) { loja.recusar('Essas criaturas não podem atacar agora'); return; }
    setAtaques(r.ataques);
    setAtacanteAtivo(r.ativo);
  };

  // clique direito: jogadas válidas, ver a carta, revelar e o ajuste manual
  const decisaoManualId = d?.kind === 'priority' && d.actions.some((a) => a.kind === 'manual') ? d.id : null;
  const manualOk = decisaoManualId !== null && !enviando && !fila.length;
  const manual = (m: ManualAction) => { if (decisaoManualId !== null) loja.manual(decisaoManualId, m); };
  const grupoManual: ItemMenu = { tipo: 'grupo', id: 'g-manual', label: manualOk ? 'Ajuste manual' : 'Ajuste manual (só com prioridade)' };
  const menuCarta = (o: ObjView, ev: MouseEvent) => {
    if (pegar) return;
    esconderZoom();
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
        itens.push(o.tapped && o.manaGasta
          ? { id: 'virar', label: 'Desvirar (a mana já foi gasta: use Desfazer)', desativado: true, fazer: () => {} }
          : { id: 'virar', label: !o.tapped ? 'Virar' : manaNaReserva(o) ? 'Desvirar (a mana sai da reserva)' : 'Desvirar', desativado: !manualOk, fazer: () => manual({ k: 'virar', obj: o.id, tapped: !o.tapped }) });
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
    esconderZoom();
    // as viradas para mana que já pagou alguma coisa ficam viradas (o motor recusaria cada uma)
    const virados = v.battlefield.filter((o) => o.controller === eu && o.tapped && !o.manaGasta);
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

  const viradaAgora = useRef<{ id: ObjId; t: number } | null>(null);
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
      const ativar = (f: PaymentSource) => { viradaAgora.current = { id: o.id, t: Date.now() }; loja.responder(d.id, { kind: 'payment', activate: { source: f.id } }); };
      if (fontes.length === 1) ativar(fontes[0]);
      else abrirMenu(nomeObj(o.id), legais(fontes.map((f) => ({ id: f.id, label: f.label, fazer: () => ativar(f) }))), r);
      return;
    }
    if (d.kind === 'priority') {
      const acoes = acoesPorObj.get(o.id) ?? [];
      // sua permanente virada cuja mana ainda está na reserva: o clique desvira e a mana sai (desfaz o virar
      // para mana, pelo ajuste manual); se a mana já foi gasta, fica como está
      const desvirar = o.controller === eu && o.tapped && manualOk && manaNaReserva(o)
        ? { id: 'desvirar-mana', label: 'Desvirar (a mana sai da reserva)', fazer: () => manual({ k: 'virar', obj: o.id, tapped: false }) }
        : null;
      // o segundo clique de um clique duplo rápido no terreno que você acabou de virar não o desvira (a mana sumia)
      if (desvirar && viradaAgora.current?.id === o.id && Date.now() - viradaAgora.current.t < 600) return;
      if (desvirar && !acoes.length) { desvirar.fazer(); return; }
      if (!acoes.length) { if (sua) loja.recusar(v.hand.some((x) => x.id === o.id) ? motivo(o) : 'Essa carta não tem o que fazer agora'); return; }
      // terreno com uma habilidade de mana só: vira e a mana vai para a reserva
      if (acoes.length === 1 && acoes[0].kind === 'mana' && !desvirar) { viradaAgora.current = { id: o.id, t: Date.now() }; fazerAcao(acoes[0]); return; }
      abrirMenu(nomeObj(o.id), legais([...acoes.map((a) => ({ id: a.id, label: a.label, fazer: () => fazerAcao(a) })), ...(desvirar ? [desvirar] : [])]), r);
      return;
    }
    if (d.kind === 'attackers') {
      // desmarcada: marca e escolhe; marcada: escolhe (o próximo oponente clicado vale para ela); a escolhida: desmarca
      const r = cliqueAtaque(d.candidates, { ataques, ativo: atacanteAtivo }, o.id, ultimoAlvo);
      if (r) { setAtaques(r.ataques); setAtacanteAtivo(r.ativo); return; }
      // planeswalker ou batalha de um oponente
      if (o.controller !== eu && alvoAtaque({ kind: 'obj', id: o.id })) return;
      if (o.controller === eu && o.types.includes('Creature')) loja.recusar('Essa criatura não pode atacar agora');
      return;
    }
    if (d.kind === 'blockers') {
      const r = cliqueBloqueio(d, { bloqueios, ativo: bloqueadorAtivo }, { id: o.id, atacando: atacando.has(o.id), minhaCriatura: o.controller === eu && o.types.includes('Creature') });
      if (r && 'recusa' in r) loja.recusar(r.recusa);
      else if (r) { setBloqueios(r.bloqueios); setBloqueadorAtivo(r.ativo); }
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

  const anexosNovos = useMemo(() => {
    const m = new Map<ObjId, ObjView[]>();
    const noCampo = new Set(v.battlefield.map((o) => o.id));
    for (const o of v.battlefield) {
      if (o.attachedTo === null || !noCampo.has(o.attachedTo)) continue;
      const l = m.get(o.attachedTo);
      if (l) l.push(o); else m.set(o.attachedTo, [o]);
    }
    return m;
  }, [v.battlefield]);
  const anexos = useMesmo(anexosNovos, mesmoMapaDeListas);
  // as permanentes de cada jogador; a lista de quem não mudou fica a mesma (a área dele não refaz a arrumação)
  const listasAntes = useRef(new Map<number, ObjView[]>());
  const objsPorJogador = useMemo(() => {
    const noCampo = new Set(v.battlefield.map((o) => o.id));
    const m = new Map<number, ObjView[]>();
    for (const o of v.battlefield) {
      if (o.attachedTo !== null && noCampo.has(o.attachedTo)) continue;
      const l = m.get(o.controller);
      if (l) l.push(o); else m.set(o.controller, [o]);
    }
    for (const [k, l] of m) { const a = listasAntes.current.get(k); if (a && mesmaLista(a, l)) m.set(k, a); }
    listasAntes.current = m;
    return m;
  }, [v.battlefield]);
  // seleção por arrasto e ordem das cartas que você arrumou (só neste navegador)
  const arrumar = useArrumar(objsPorJogador.get(eu), anexos);
  const fundoDe = (p: number) => {
    const deck = e.decks.find((x) => x.id === sala.assentos[p]?.deck);
    return deck ? urlFundo(deck.comandante) : null;
  };
  // retrato de cada jogador: o que a pessoa escolheu, ou o do comandante do deck dela
  const avatarDe = (p: number) => avatarDoAssento(sala.assentos[p]?.avatar, e.decks.find((x) => x.id === sala.assentos[p]?.deck)?.comandante);

  // tratadores das cartas com identidade fixa (cada um chama a versão deste desenho): as cartas são memo e só se
  // desenham de novo quando algo delas muda
  const tCarta = useEstavel(clicarCarta);
  const tMenuCarta = useEstavel(menuCarta);
  const tMenuArea = useEstavel(menuArea);
  const tPegarCampo = useEstavel(pegarCampo);
  const tPegarCampoVazio = useEstavel(pegarCampoVazio);
  const tPegarMao = useEstavel(pegarMao);
  const tJogar = useEstavel(jogar);
  // o retângulo termina quando o botão sobe: a marcação usa o estado de então
  const tMarcarArea = useEstavel(marcarArea);
  const tLeque = useEstavel(clicarLeque);
  const fecharMenu = useEstavel(() => setMenu(null));

  const duelo = sala.modo === '1v1';
  // uma decisão pede cartas da sua mão (descartar, escolher) ou o ajuste manual pede uma carta: a mão fica erguida
  const maoAberta = !!pegar || (d?.kind === 'select' && !enviando && d.items.some((it) => it.obj !== undefined && v.hand.some((h) => h.id === it.obj)));
  const area = (j: PlayerView, compacta: boolean) => {
    const itemJ = itemPorJogador.get(j.id);
    // declarando ataque: clicar no oponente (área, nome ou vida) escolhe quem a criatura marcada ataca
    const atacarJ = !!atacantesCand && j.id !== eu && Object.keys(ataques).length > 0;
    const alvoJogador = atacarJ && aux.alvos && podeSerAlvo({ kind: 'player', id: j.id });
    // decisão de combate que passa por esta área: os leques de criaturas abrem (o tamanho das cartas não muda)
    const lequeLargo = (d?.kind === 'attackers' && j.id === eu)
      || (d?.kind === 'blockers' && (j.id === eu || d.attackers.some((a) => todos.get(a)?.controller === j.id)));
    return (
      <AreaJogador
        key={j.id}
        j={j}
        objs={objsPorJogador.get(j.id) ?? SEM_OBJS}
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
        avatar={avatarDe(j.id)}
        realce={realce}
        combate={combate}
        onCarta={tCarta}
        onZoom={mostrarZoom}
        jogadorRealce={itemJ !== undefined ? (sel.includes(itemJ) ? 'escolhido' : aux.alvos ? 'escolhivel' : null) : alvoJogador ? 'escolhivel' : null}
        onJogador={itemJ !== undefined ? () => clicarJogador(j.id) : atacarJ ? () => alvoAtaque({ kind: 'player', id: j.id }) : undefined}
        onCliqueArea={atacarJ ? () => alvoAtaque({ kind: 'player', id: j.id }) : undefined}
        conjurando={j.id === eu && conjurando && d && d.player === eu && d.kind !== 'priority' && v.stack.some((x) => x.controller === eu && x.def === conjurando.o.def) ? conjurando : null}
        onZona={(zona) => setModal({ tipo: 'zona', jogador: j.id, zona })}
        mao={j.id === eu ? v.hand : undefined}
        reservaDireita={j.id === eu ? 336 : 0}
        avatarLado={j.id === eu ? ladoAvatar : undefined}
        colunaAberta={j.id === eu && colunaAberta}
        deitados={deitados}
        maoAberta={j.id === eu ? maoAberta : undefined}
        chegando={j.id === eu ? chegando : null}
        pousadas={j.id === eu ? pousadas.current : undefined}
        posicoes={posicoes}
        arrastando={arrastando}
        onPegarCampo={j.id === eu && !v.gameOver ? tPegarCampo : undefined}
        onPegarCampoVazio={j.id === eu && !v.gameOver ? tPegarCampoVazio : undefined}
        selecionadas={j.id === eu ? arrumar.selecao : undefined}
        ordemZ={j.id === eu ? arrumar.ordemZ : undefined}
        onPegarMao={j.id === eu ? tPegarMao : undefined}
        onDuploMao={j.id === eu ? tJogar : undefined}
        onMenuCarta={tMenuCarta}
        onMenuArea={j.id === eu ? tMenuArea : undefined}
        lequeLargo={lequeLargo}
        chaveCombate={chaveCombate}
        onLeque={j.id === eu && d?.kind === 'attackers' && !enviando ? tLeque : undefined}
      />
    );
  };

  const oponentes = ordem.slice(1).map((p) => v.players[p]);
  const minha = v.players[eu];
  // chat com a barra recolhida: conta as mensagens novas dos outros e mostra cada uma por alguns segundos
  const ultimaChat = e.chat[e.chat.length - 1]?.id ?? 0;
  const [lidaChat, setLidaChat] = useState(ultimaChat);
  const [chatNovo, setChatNovo] = useState<MsgChat[]>([]);
  // a última mensagem que já apareceu na mesa: depois de sumir, ela não volta com a mensagem seguinte
  const chatAvisado = useRef(ultimaChat);
  const relogiosChat = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => () => { for (const t of relogiosChat.current) clearTimeout(t); }, []);
  useEffect(() => {
    if (!recolhida) { setLidaChat(ultimaChat); chatAvisado.current = ultimaChat; setChatNovo([]); return; }
    const novas = e.chat.filter((m) => m.id > Math.max(lidaChat, chatAvisado.current) && m.quem !== e.quem);
    chatAvisado.current = Math.max(chatAvisado.current, ultimaChat);
    if (!novas.length) return;
    setChatNovo((a) => [...a, ...novas].slice(-3));
    const ids = new Set(novas.map((m) => m.id));
    // sem limpar na próxima mensagem: cada uma some no seu tempo
    const t = setTimeout(() => { relogiosChat.current.delete(t); setChatNovo((a) => a.filter((m) => !ids.has(m.id))); }, 6000);
    relogiosChat.current.add(t);
  }, [ultimaChat, recolhida]);
  const naoLidas = recolhida ? e.chat.filter((m) => m.id > lidaChat && m.quem !== e.quem).length : 0;
  const decisaoManual = d?.kind === 'priority' && d.actions.some((a) => a.kind === 'manual') ? d.id : null;
  // sem prioridade, o ajuste manual fecha (antes ele sumia e voltava sozinho na prioridade seguinte)
  useEffect(() => { if (decisaoManual === null) { setManualAberto(false); setManualTipo(undefined); setPegar(null); } }, [decisaoManual]);
  const preJogo = v.turn.number === 0 && !v.gameOver;
  // abertura (VS): uma vez por partida neste navegador, antes da mão inicial; depois de começar, vai até o fim
  const chaveVS = chaveAbertura(sala.codigo, sala.partida);
  const [abertura, setAbertura] = useState<string | null>(null);
  useLayoutEffect(() => {
    if (!preJogo || aberturaVista(chaveVS)) return;
    marcarAbertura(chaveVS);
    setAbertura(chaveVS);
  }, [preJogo, chaveVS]);
  const ladosVS = (): LadoVS[] => ordem.map((p) => {
    const a = sala.assentos[p];
    const deck = e.decks.find((x) => x.id === a?.deck);
    const comandante = deck ? nomeCarta(deck.comandante, deck.comandante).split(',')[0] : null;
    // sem o complemento entre parênteses dos decks importados ("(Reality Fracture Commander Decklist)"), e sem repetir
    // quando o deck tem o nome do comandante ("Terra")
    const nomeDeck = deck ? deck.nome.replace(/\s*\([^)]*\)\s*$/, '') : null;
    return {
      jogador: p,
      nome: v.players[p].name,
      papel: p === eu ? 'Você' : a?.tipo === 'bot' ? `Oponente · bot ${nomeNivel(a.nivel ?? NIVEL_PADRAO)}` : 'Oponente',
      comandante,
      deck: nomeDeck && nomeDeck !== comandante ? nomeDeck : null,
      fundo: fundoDe(p),
      foco: deck ? rostoNoFundo(deck.comandante) : [0.5, 0.3],
      aura: avatarDe(p)?.aura ?? cor(p),
      // a ordem dos turnos já vem sorteada: o primeiro dela joga o primeiro turno
      comeca: p === v.turnOrder[0],
    };
  });
  const mostrarDecisao = d && !v.gameOver && !enviando && !preJogo && !ehEscolha(d) && (d.kind !== 'priority' || acoesSoltas.length > 0);
  // a coluna da direita com uma decisão (ou o fim da partida): o seu retrato no canto sai para o canto de cima à direita
  // do campo e a coluna começa logo abaixo da faixa de fases, com a altura toda. Enquanto a resposta vai (enviando),
  // ela continua aberta: o retrato não vai e volta entre duas decisões seguidas. Só a pilha não mexe no retrato (a cada
  // mágica ele andaria de um lado para o outro)
  const colunaAberta = !!v.gameOver || !!(d && !preJogo && !ehEscolha(d) && (d.kind !== 'priority' || acoesSoltas.length > 0));
  const escolha = d && !v.gameOver && !enviando && !preJogo && ehEscolha(d) ? d : null;

  return (<>
    <div class={`mesa ${duelo ? 'mesa-duelo' : ''} ${ladoAvatar === 'canto' && !colunaAberta ? 'avatar-canto' : ''} ${recolhida ? 'recolhida' : ''} ${aux.jogaveis ? 'aux-jogaveis' : ''} ${e.desfazer ? 'parada' : ''}`} onClick={() => setMenu(null)}>
      <main class="tabuleiro" onContextMenu={(ev) => ev.preventDefault()}>
        <div class={`oponentes n${oponentes.length}`}>{oponentes.map((j) => area(j, true))}</div>
        {area(minha, false)}
        <Setas setas={setas} versao={v} />
        <FaixaFases v={v} eu={eu} d={d} enviando={enviando} paradas={e.paradas} cor={cor} desfazivel={e.desfazivel} parada={!!e.desfazer} pensando={e.pensando} />
        {e.desfazer && <PedidoDesfazer p={e.desfazer} eu={eu} nomes={v.players.map((p) => p.name)} cor={cor} />}

        <div class="coluna-dir">
          <Avisos v={v} cor={cor} doServidor={e.avisos} />
          {/* importações de deck com a barra recolhida (com ela aberta, o selo fica acima do chat) */}
          {recolhida && <Importacoes lugar="coluna" />}
          {recolhida && chatNovo.length > 0 && (
            <div class="avisos avisos-chat" aria-live="polite">
              {chatNovo.map((m) => (
                <button key={m.id} type="button" class="aviso aviso-chat" style={{ '--cor': cor(m.de) }} title="Abrir o chat" onClick={() => recolher(false)}>
                  <b>{m.nome}</b>: {m.texto}
                </button>
              ))}
            </div>
          )}
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
                    <li key={s.id} class={`${i === 0 ? 'topo' : ''} ${img ? '' : 'sem-imagem'}`} style={{ '--cor': cor(s.controller) }} {...zoomDaPilha(s, todos)}>
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
          {escolha && escolhaRecolhida && <EscolhaRecolhida d={escolha} ui={ui} voltar={() => setEscolhaRecolhida(false)} />}
          {d && mostrarDecisao && (
            <div class="cartao">
              <p class="rot">{rotuloDecisao(d)}</p>
              <Decisao v={v} d={d} ui={ui} nomeObj={nomeObj} nomeAlvo={nomeAlvo} visivel={(id) => todos.has(id)} acoesSoltas={acoesSoltas} reserva={minhaReserva} aux={aux}
                nomeCombate={(id) => numeros?.get(id)?.rotulo ?? nomeObj(id)} numeroCombate={(id) => numeros?.get(id)?.n ?? null} recusa={e.recusaCombate?.decisao === d.id ? e.recusaCombate.texto : null} />
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
        {escolha && (
          <JanelaEscolha v={v} d={escolha} ui={ui} todos={todos} cor={cor} aux={aux} recolhida={escolhaRecolhida} recolher={setEscolhaRecolhida}
            reservaDireita={v.stack.length > 0 ? 336 : 0} onZoom={mostrarZoom} />
        )}
        {preJogo && <MaoInicial v={v} d={d} enviando={enviando} regra={sala.mulligan ?? 'londres'} multiplayer={sala.modo === '4p'} sel={sel} setSel={setSel} />}
      </main>

      <aside class="lateral" aria-label="Menu da partida">
        <div class="marca-jogo"><Marca /><span>COMMANDER</span></div>
        <div class="lateral-turno" style={{ '--cor': cor(v.turn.active) }}>
          <span class="rot">Rodada</span><strong>{v.turn.number ? v.turn.round : '–'}</strong>
          <span class="vez">{v.turn.number ? <>vez de <span>{v.players[v.turn.active].name}</span></> : 'antes da 1ª rodada'}</span>
          {salaProibe && <span class="selo-sala" title="Quem criou a sala proibiu os auxílios: todos jogam em Mesa real">Sala sem auxílios</span>}
        </div>
        <ul class="menu-lateral">
          <li><button title="Registro da partida" aria-label="Registro" onClick={() => setModal({ tipo: 'registro' })}><IconeRegistro /><span class="rotulo">Registro</span></button></li>
          <li><button title="Paradas" aria-label="Paradas" onClick={() => setModal({ tipo: 'paradas' })}><IconeParadas /><span class="rotulo">Paradas</span></button></li>
          <li><button title="Ajuste manual" aria-label="Ajuste manual" disabled={decisaoManual === null} onClick={() => setManualAberto(true)}><IconeAjuste /><span class="rotulo">Ajuste manual</span></button></li>
          <li><button title="Configurações" aria-label="Configurações" onClick={() => setModal({ tipo: 'config' })}><IconeConfig /><span class="rotulo">Configurações</span></button></li>
          {!v.gameOver && !minha.left && <li><button title="Conceder" aria-label="Conceder" onClick={() => setModal({ tipo: 'conceder' })}><IconeConceder /><span class="rotulo">Conceder</span></button></li>}
          <li><button title="Sair" aria-label="Sair" onClick={() => loja.enviar({ t: 'sair' })}><IconeSair /><span class="rotulo">Sair</span></button></li>
          <li>
            <button class="recolher" title={recolhida ? (naoLidas ? `Abrir a barra e o chat (${naoLidas} ${naoLidas === 1 ? 'mensagem nova' : 'mensagens novas'})` : 'Abrir a barra e o chat') : 'Recolher a barra (a mesa fica mais larga)'}
              aria-label={recolhida ? 'Abrir a barra' : 'Recolher a barra'} onClick={() => recolher(!recolhida)}>
              <IconeRecolher /><span class="rotulo">Recolher</span>
              {naoLidas > 0 && <span class="nao-lidas" aria-label={`${naoLidas} ${naoLidas === 1 ? 'mensagem nova' : 'mensagens novas'} no chat`}>{naoLidas > 9 ? '9+' : naoLidas}</span>}
            </button>
          </li>
        </ul>
        {!recolhida && <Importacoes lugar="lateral" />}
        {!recolhida && <Chat msgs={e.chat} quem={e.quem} cor={cor} />}
      </aside>
    </div>

    {/* camadas por cima da mesa ficam fora da grade dela (dentro, viravam linhas novas e cortavam o tabuleiro) */}
    <CamadaArrasto neutra={!aux.avisos} />
    {/* o zoom fica acima das janelas (ex.: ler uma carta do cemitério com a janela aberta) */}
    {!arrastando && <CamadaZoom recolhida={recolhida} enjoo={aux.jogaveis} />}
    {menu && <MenuFlutuante menu={menu} fechar={fecharMenu} />}

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

    {modal?.tipo === 'registro' && <Registro v={v} cor={cor} fechar={() => setModal(null)} />}

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

    {abertura && <Abertura key={abertura} lados={ladosVS()} fim={() => setAbertura(null)} />}

    {manualAberto && decisaoManual !== null && (
      <Manual v={v} decisao={decisaoManual} tipoInicial={manualTipo} escondida={!!pegar} fechar={() => { setManualAberto(false); setManualTipo(undefined); setPegar(null); }} pegar={setPegar} nomeObj={nomeObj} />
    )}
  </>);
}
