// Janela de escolha (fase 9): buscar no grimório, escolher alvos, modos, ordenar gatilhos,
// vidência, números. Aparece no meio da mesa, centrada na divisa entre os oponentes e você, cresce
// com o conteúdo até caber na tela (depois rola por dentro) e não escurece a mesa: dá para clicar
// nas cartas da mesa como antes. "Ver a mesa" recolhe a janela num cartão da coluna da direita
// (a decisão continua pendente) e segurar Espaço esconde a janela enquanto a tecla estiver
// apertada. Prioridade, pagamento e combate continuam na coluna da mesa (Decisao.tsx).
// O formato de cada escolha sai de escolhas.ts.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ChoiceItem, Decision, ObjId } from '../../../motor/types.ts';
import type { GameView, ObjView, PlayerView, StackView } from '../../../motor/view.ts';
import { info, nomeCarta, traduzir } from '../cartas.ts';
import { IconeVida } from '../icones.tsx';
import { loja } from '../loja.ts';
import type { Auxilios } from '../preferencias.ts';
import { Carta } from './Carta.tsx';
import type { EstadoUi } from './Decisao.tsx';
import {
  agrupar, alternarGrupo, ehFila, faixaEscolha, filtrar, fonteDoGatilho, formatoEscolha, mover, normalizar, ordemDeGatilhos,
  ordemParaPilha, quantidadeOk, respostaArranjo, topoJanela, type Aparencia, type DecisaoEscolha, type Destino, type Formato,
} from './escolhas.ts';
import { TextoComSimbolos } from './Simbolos.tsx';

type D<K extends Decision['kind']> = Extract<Decision, { kind: K }>;
type Zoom = (o: ObjView | null, r?: DOMRect) => void;

/** como um item aparece: carta da mesa ou da mão, carta escondida (grimório), na pilha, jogador ou texto */
type Visual =
  | { tipo: 'obj'; o: ObjView; nota: string }
  | { tipo: 'carta'; o: ObjView }
  | { tipo: 'pilha'; o: ObjView; s: StackView }
  | { tipo: 'jogador'; p: PlayerView }
  | { tipo: 'texto' };

/** uma carta que não está à vista na mesa (grimório, gatilho), para a imagem e o zoom */
function pseudo(def: string, nome: string, face: number, id: number, dono: number): ObjView {
  return {
    id, def, name: nome, face, owner: dono, controller: dono, tapped: false, faceDown: false, phasedOut: false, token: false,
    counters: {}, damage: 0, attachedTo: null, types: [], subtypes: [], supertypes: [], power: null, toughness: null, loyalty: null,
    manaCost: '', colors: [], keywords: [], abilities: [], commander: false, sick: false, prepared: false, classLevel: 0, goaded: false,
  };
}

const MARGEM = 12;

export interface JanelaEscolhaProps {
  v: GameView;
  d: DecisaoEscolha;
  ui: EstadoUi;
  /** objetos à vista (mesa, mão, cemitérios, exílio, comando) */
  todos: Map<ObjId, ObjView>;
  cor: (p: number) => string;
  aux: Auxilios;
  recolhida: boolean;
  recolher: (x: boolean) => void;
  /** largura da coluna da direita (pilha) que a janela deixa livre */
  reservaDireita: number;
  onZoom: Zoom;
}

export function JanelaEscolha(p: JanelaEscolhaProps) {
  const { v, d, aux, recolhida, recolher } = p;
  const eu = v.you!;
  const caixa = useRef<HTMLElement>(null);
  const [espiando, setEspiando] = useState(false);

  const visual = (it: ChoiceItem, i: number): Visual => {
    if (it.player !== undefined && v.players[it.player]) return { tipo: 'jogador', p: v.players[it.player] };
    if (it.obj !== undefined) {
      const o = p.todos.get(it.obj);
      if (o) return { tipo: 'obj', o, nota: notaObj(v, o, eu) };
      const s = v.stack.find((x) => x.id === it.obj);
      if (s?.def) return { tipo: 'pilha', s, o: pseudo(s.def, s.name, 0, s.id, s.controller) };
    }
    if (it.card) return { tipo: 'carta', o: pseudo(it.card.def, it.label, it.card.face ?? 0, it.obj ?? -1000 - i, d.player) };
    return { tipo: 'texto' };
  };
  const itens = d.kind === 'number' ? [] : d.items;
  const visuais = useMemo(() => itens.map(visual), [d, v]);
  const aparencia = (it: ChoiceItem): Aparencia => {
    const x = visuais[itens.indexOf(it)];
    return x.tipo === 'jogador' ? 'jogador' : x.tipo === 'texto' ? 'texto' : 'carta';
  };
  const formato = formatoEscolha(d, aparencia)!;
  const gatilhos = ordemDeGatilhos(d);

  // centrada na divisa da mesa; mede de novo quando a janela ou a mesa mudam de tamanho
  useLayoutEffect(() => {
    const el = caixa.current;
    const mesa = el?.parentElement;
    if (!el || !mesa || recolhida) return;
    const posicionar = () => {
      const h = mesa.clientHeight;
      const fracao = parseFloat(getComputedStyle(mesa).getPropertyValue('--divisa')) || 41;
      el.style.top = `${topoJanela(h, h * fracao / 100, el.offsetHeight, MARGEM)}px`;
    };
    posicionar();
    const ro = new ResizeObserver(posicionar);
    ro.observe(el);
    ro.observe(mesa);
    return () => ro.disconnect();
  }, [d.id, recolhida, formato]);

  // a carta sob o mouse pode sumir sem o mouseleave chegar (filtro, recolher, decisão respondida)
  useEffect(() => () => p.onZoom(null), [d.id]);
  useEffect(() => { if (recolhida || espiando) p.onZoom(null); }, [recolhida, espiando]);

  // segurar Espaço esconde a janela para espiar a mesa (fora de campos de texto e de outras janelas)
  const espiandoRef = useRef(false);
  espiandoRef.current = espiando;
  useEffect(() => {
    if (recolhida) { setEspiando(false); return; }
    const deTexto = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));
    const baixo = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || deTexto(e.target) || document.querySelector('.janela-fundo:not(.escondido)')) return;
      e.preventDefault();
      if (!e.repeat) setEspiando(true);
    };
    const cima = (e: KeyboardEvent) => { if (e.code === 'Space' && espiandoRef.current) { e.preventDefault(); setEspiando(false); } };
    const soltar = () => setEspiando(false);
    addEventListener('keydown', baixo);
    addEventListener('keyup', cima);
    addEventListener('blur', soltar);
    return () => { removeEventListener('keydown', baixo); removeEventListener('keyup', cima); removeEventListener('blur', soltar); };
  }, [recolhida]);

  const titulo = gatilhos ? 'Ordem dos seus gatilhos' : traduzir(d.prompt);
  const corpo = (() => {
    switch (formato) {
      case 'numero': return <CorpoNumero d={d as D<'number'>} />;
      case 'arranjo': return <CorpoArranjo d={d as D<'arrange'>} visuais={visuais} onZoom={p.onZoom} />;
      case 'fila': return <CorpoFila d={d as D<'select'>} gatilhos={gatilhos} todos={p.todos} onZoom={p.onZoom} />;
      case 'simnao': return <CorpoSimNao d={d as D<'select'>} aux={aux} />;
      default: return <CorpoSelecao {...p} d={d as D<'select'>} formato={formato} visuais={visuais} />;
    }
  })();
  // quantas cartas lado a lado (o tamanho delas na linha sai disso)
  const n = visuais.filter((x) => x.tipo !== 'jogador' && x.tipo !== 'texto').length;
  return (
    <section ref={caixa} class={`janela-escolha f-${formato} ${recolhida ? 'recolhida' : ''} ${espiando ? 'espiando' : ''}`}
      style={{ '--reserva': `${p.reservaDireita}px`, '--n': String(Math.max(1, Math.min(n, 8))) }}
      role="dialog" aria-label={titulo} aria-hidden={recolhida || espiando ? 'true' : undefined}>
      <header class="escolha-topo">
        <div class="escolha-titulos">
          <p class="rot">{rotulo(formato, d)}</p>
          <h2 class="decisao-titulo"><TextoComSimbolos texto={titulo} /></h2>
        </div>
        <button type="button" class="botao pequeno ver-mesa" title="Recolher a janela para olhar a mesa (ou segure Espaço)" onClick={() => recolher(true)}>
          <IconeOlho />Ver a mesa
        </button>
      </header>
      {corpo}
    </section>
  );
}

/** o cartão que fica na coluna da direita enquanto a janela está recolhida */
export function EscolhaRecolhida({ d, ui, voltar }: { d: DecisaoEscolha; ui: EstadoUi; voltar: () => void }) {
  // na fila, a ordem está na janela: daqui só dá para voltar a ela
  const sel = d.kind === 'select' && !ehFila(d) ? d : null;
  return (
    <div class="cartao escolha-recolhida" role="status">
      <p class="rot">Escolha pendente</p>
      <p class="decisao-titulo"><TextoComSimbolos texto={ordemDeGatilhos(d) ? 'Ordem dos seus gatilhos' : traduzir(d.prompt)} /></p>
      {sel && <p class="suave">{ui.sel.length} escolhida{ui.sel.length === 1 ? '' : 's'} · {faixaEscolha(sel.min, sel.max).toLowerCase()}</p>}
      <div class="botoes-linha">
        <button type="button" class="botao cheio" onClick={voltar}>Voltar à escolha</button>
        {sel && <button type="button" class="botao principal" disabled={!quantidadeOk(ui.sel.length, sel.min, sel.max)} onClick={() => loja.responder(sel.id, { kind: 'select', ids: ui.sel })}>{ui.sel.length === 0 && sel.min === 0 ? 'Nenhum' : 'Confirmar'}</button>}
      </div>
    </div>
  );
}

function rotulo(f: Formato, d: DecisaoEscolha): string {
  if (f === 'fila') return 'Ordenar';
  if (f === 'arranjo') return d.prompt.startsWith('Vigiar') ? 'Vigiar' : 'Vidência';
  if (f === 'numero') return 'Escolha um número';
  if (f === 'grade') return 'Procurar';
  return 'Sua escolha';
}

/** onde está a carta, para quem escolhe alvos pela janela */
function notaObj(v: GameView, o: ObjView, eu: number): string {
  const dono = o.controller === eu ? '' : v.players[o.controller]?.name ?? '';
  if (v.hand.some((x) => x.id === o.id)) return 'na sua mão';
  if (v.battlefield.some((x) => x.id === o.id)) return [dono && `de ${dono}`, o.tapped ? 'virada' : ''].filter(Boolean).join(' · ');
  const de = v.players[o.owner]?.name;
  if (v.players.some((pl) => pl.graveyard.some((x) => x.id === o.id))) return o.owner === eu ? 'no seu cemitério' : `no cemitério de ${de}`;
  if (v.exile.some((x) => x.id === o.id)) return 'no exílio';
  if (v.command.some((x) => x.id === o.id)) return 'no comando';
  return dono && `de ${dono}`;
}

const nomeVisual = (x: Visual, it: ChoiceItem): string => {
  switch (x.tipo) {
    case 'obj': return x.o.def ? nomeCarta(x.o.def, x.o.name) : x.o.name;
    case 'carta': return nomeCarta(x.o.def, it.label);
    case 'pilha': return nomeCarta(x.s.def, x.s.name);
    case 'jogador': return x.p.name;
    case 'texto': return traduzir(it.label);
  }
};

// ---------------------------------------------------------------- escolher itens (cartas, grade, opções)

interface SelecaoProps extends JanelaEscolhaProps { d: D<'select'>; formato: Formato; visuais: Visual[] }

function CorpoSelecao(p: SelecaoProps) {
  const { d, ui, aux, formato, visuais } = p;
  const sel = ui.sel;
  const [termo, setTermo] = useState('');
  // com o auxílio dos alvos, a busca mostra só o que serve (dá para ver o resto)
  const [soServem, setSoServem] = useState(true);
  const clicar = (ids: string[]) => ui.setSel(alternarGrupo(sel, ids, d.max));
  useEffect(() => { p.onZoom(null); }, [termo, soServem]);
  const bloqueado = (it: ChoiceItem) => !!it.disabled && aux.alvos;
  const ok = quantidadeOk(sel.length, d.min, d.max);

  const entradas = d.items.map((it, i) => ({ it, x: visuais[i], nome: nomeVisual(visuais[i], it) }));
  const jogadores = entradas.filter((e) => e.x.tipo === 'jogador');
  let cartas = entradas.filter((e) => e.x.tipo !== 'jogador');
  const total = cartas.length;
  const servem = cartas.filter((e) => !e.it.disabled).length;
  if (formato === 'grade') {
    if (aux.alvos && soServem) cartas = cartas.filter((e) => !e.it.disabled);
    cartas = filtrar(cartas, termo, (e) => [e.nome, e.it.label, e.x.tipo === 'obj' || e.x.tipo === 'carta' || e.x.tipo === 'pilha' ? info(e.x.o.def)?.oracle ?? '' : '']);
    cartas = [...cartas].sort((a, b) => normalizar(a.nome).localeCompare(normalizar(b.nome)));
  }
  // na grade, cartas iguais escondidas (o grimório) viram um item só, com a quantidade
  const grupos = agrupar(cartas, (e) => (formato === 'grade' && e.x.tipo === 'carta' ? `${e.x.o.def}|${e.x.o.face}|${!!e.it.disabled}` : null));

  const item = (g: { chave: string; itens: typeof entradas }) => {
    const { it, x, nome } = g.itens[0];
    const ids = g.itens.map((e) => e.it.id);
    const marcados = ids.filter((id) => sel.includes(id));
    const pos = d.ordered && marcados.length ? sel.indexOf(marcados[0]) + 1 : 0;
    const desligado = bloqueado(it);
    if (x.tipo === 'texto') {
      return (
        <button key={g.chave} type="button" class={`item item-opcao ${marcados.length ? 'escolhido' : ''}`} disabled={desligado} onClick={() => clicar(ids)}>
          {pos > 0 && <span class="item-ordem">{pos}</span>}
          <TextoComSimbolos texto={nome} />
        </button>
      );
    }
    if (x.tipo === 'jogador') return null;
    const nota = x.tipo === 'obj' ? x.nota : x.tipo === 'pilha' ? 'na pilha' : '';
    return (
      <button key={g.chave} type="button" class={`item item-carta-grande ${marcados.length ? 'escolhido' : ''}`} disabled={desligado} onClick={() => clicar(ids)} aria-pressed={marcados.length > 0}
        aria-label={`${nome}${ids.length > 1 ? ` (${ids.length} cópias)` : ''}${nota ? `, ${nota}` : ''}`}>
        <Carta o={{ ...x.o, tapped: false }} onZoom={desligado ? undefined : p.onZoom} />
        <span class="item-nome">{nome}</span>
        {nota && <span class="item-nota">{nota}</span>}
        {ids.length > 1 && <span class={`item-qtd ${marcados.length ? 'com-marca' : ''}`}>{marcados.length ? `${marcados.length} de ${ids.length}` : `×${ids.length}`}</span>}
        {pos > 0 && <span class="item-ordem">{pos}</span>}
      </button>
    );
  };

  const quadros = jogadores.length > 0 && (
    <div class="escolha-jogadores">
      {jogadores.map(({ it, x }) => {
        const pl = (x as Extract<Visual, { tipo: 'jogador' }>).p;
        const marcado = sel.includes(it.id);
        return (
          <button key={it.id} type="button" class={`item item-jogador ${marcado ? 'escolhido' : ''}`} style={{ '--cor': p.cor(pl.id) }} disabled={bloqueado(it)} aria-pressed={marcado} onClick={() => clicar([it.id])}>
            <b>{pl.name}{pl.id === p.v.you ? ' (você)' : ''}</b>
            <span class="item-vida"><IconeVida />{pl.life}</span>
          </button>
        );
      })}
    </div>
  );

  return (<>
    {formato === 'grade' && (
      <div class="escolha-barra">
        <input type="search" class="escolha-filtro" placeholder="Filtrar por nome ou texto" aria-label="Filtrar as cartas" value={termo} onInput={(e) => setTermo((e.target as HTMLInputElement).value)} />
        <span class="suave">{grupos.length === cartas.length ? `${cartas.length} carta${cartas.length === 1 ? '' : 's'}` : `${cartas.length} cartas (${grupos.length} diferentes)`}{cartas.length < total ? ` de ${total}` : ''}</span>
        {aux.alvos && servem < total && (
          <label class="caixa"><input type="checkbox" checked={soServem} onChange={() => setSoServem(!soServem)} /> Só as que servem ({servem})</label>
        )}
      </div>
    )}
    <div class="escolha-corpo">
      {quadros}
      {grupos.length > 0 && (
        <div class={formato === 'grade' ? 'escolha-grade' : formato === 'opcoes' ? 'escolha-opcoes' : 'escolha-cartas'}>
          {grupos.map(item)}
        </div>
      )}
      {formato === 'grade' && grupos.length === 0 && <p class="suave escolha-vazia">{total === 0 ? 'Nenhuma carta.' : 'Nenhuma carta com esse filtro.'}</p>}
    </div>
    <div class="escolha-rodape">
      <span class="suave escolha-conta">{faixaEscolha(d.min, d.max)}{d.ordered ? ', na ordem' : ''} · <b>{sel.length}</b> escolhida{sel.length === 1 ? '' : 's'}</span>
      <div class="botoes-linha">
        {sel.length > 0 && <button type="button" class="botao" onClick={() => ui.setSel([])}>Limpar</button>}
        <button type="button" class="botao cheio" disabled={!ok} onClick={() => loja.responder(d.id, { kind: 'select', ids: sel })}>{sel.length === 0 && d.min === 0 ? 'Nenhum' : 'Confirmar'}</button>
      </div>
    </div>
  </>);
}

/** poucas opções curtas: um clique responde */
function CorpoSimNao({ d, aux }: { d: D<'select'>; aux: Auxilios }) {
  return (
    <div class="escolha-corpo">
      <div class="escolha-simnao">
        {d.items.map((it, i) => (
          <button key={it.id} type="button" class={`item item-simnao ${i === 0 ? 'primeira' : ''}`} disabled={!!it.disabled && aux.alvos} onClick={() => loja.responder(d.id, { kind: 'select', ids: [it.id] })}>
            <TextoComSimbolos texto={traduzir(it.label)} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- número

function CorpoNumero({ d }: { d: D<'number'> }) {
  const [x, setX] = useState(d.min);
  useEffect(() => setX(d.min), [d.id]);
  const muda = (k: number) => setX(Math.max(d.min, Math.min(d.max, x + k)));
  return (<>
    <div class="escolha-corpo">
      <div class="contador-grande escolha-numero">
        <button type="button" class="botao" onClick={() => setX(d.min)} disabled={x === d.min}>mín. ({d.min})</button>
        <button type="button" class="botao icone" onClick={() => muda(-1)} disabled={x <= d.min} aria-label="menos um">−</button>
        <output aria-live="polite">{x}</output>
        <button type="button" class="botao icone" onClick={() => muda(1)} disabled={x >= d.max} aria-label="mais um">+</button>
        <button type="button" class="botao" onClick={() => setX(d.max)} disabled={x === d.max}>máx. ({d.max})</button>
      </div>
    </div>
    <div class="escolha-rodape">
      <div class="botoes-linha"><button type="button" class="botao cheio" onClick={() => loja.responder(d.id, { kind: 'number', value: x })}>Confirmar {x}</button></div>
    </div>
  </>);
}

// ---------------------------------------------------------------- fila (gatilhos)

function CorpoFila({ d, gatilhos, todos, onZoom }: { d: D<'select'>; gatilhos: boolean; todos: Map<ObjId, ObjView>; onZoom: Zoom }) {
  // gatilhos: a fila aparece como a pilha (o de cima resolve primeiro); por padrão, a ordem do motor
  const inicial = () => (gatilhos ? ordemParaPilha(d.items.map((i) => i.id)) : d.items.map((i) => i.id));
  const [fila, setFila] = useState(inicial);
  useEffect(() => setFila(inicial()), [d.id]);
  const [arrastado, setArrastado] = useState<number | null>(null);
  const [sobre, setSobre] = useState<number | null>(null);
  const porId = new Map(d.items.map((i) => [i.id, i]));
  const nomesNaMesa = useMemo(() => new Map([...todos.values()].map((o) => [o.name, o])), [todos]);
  const soltar = (para: number) => { if (arrastado !== null) setFila(mover(fila, arrastado, para)); setArrastado(null); setSobre(null); };

  return (<>
    <div class="escolha-corpo">
      <p class="suave escolha-legenda">{gatilhos ? 'O de cima resolve primeiro (fica no topo da pilha). Arraste ou use as setas.' : 'A primeira da lista vem primeiro. Arraste ou use as setas.'}</p>
      <ol class="fila">
        {fila.map((id, i) => {
          const it = porId.get(id)!;
          const f = gatilhos ? fonteDoGatilho(it.label, (nome) => !!info(nome)) : null;
          const o = f ? (nomesNaMesa.get(f.fonte) ?? pseudo(f.fonte, f.fonte, 0, -2000 - i, d.player)) : null;
          return (
            <li key={id} class={`fila-linha ${arrastado === i ? 'arrastando' : ''} ${sobre === i && arrastado !== null && arrastado !== i ? (arrastado < i ? 'solta-abaixo' : 'solta-acima') : ''}`}
              draggable onDragStart={(e) => { e.dataTransfer?.setData('text/plain', id); setArrastado(i); }} onDragEnd={() => { setArrastado(null); setSobre(null); }}
              onDragOver={(e) => { e.preventDefault(); setSobre(i); }} onDrop={(e) => { e.preventDefault(); soltar(i); }}>
              <span class="fila-pega" aria-hidden="true">⋮⋮</span>
              <span class="fila-pos">{i + 1}º</span>
              {o && <Carta o={{ ...o, tapped: false }} onZoom={onZoom} classe="fila-carta" />}
              <span class="fila-texto">
                {f ? <><b>{nomeCarta(f.fonte, f.fonte)}</b><TextoComSimbolos texto={traduzir(f.texto)} /></> : <TextoComSimbolos texto={traduzir(it.label)} />}
              </span>
              <span class="linha-botoes">
                <button type="button" class="botao pequeno icone" aria-label="subir" disabled={i === 0} onClick={() => setFila(mover(fila, i, i - 1))}>↑</button>
                <button type="button" class="botao pequeno icone" aria-label="descer" disabled={i === fila.length - 1} onClick={() => setFila(mover(fila, i, i + 1))}>↓</button>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
    <div class="escolha-rodape">
      <div class="botoes-linha">
        <button type="button" class="botao" onClick={() => setFila(inicial())}>Ordem inicial</button>
        <button type="button" class="botao cheio" onClick={() => loja.responder(d.id, { kind: 'select', ids: gatilhos ? ordemParaPilha(fila) : fila })}>Confirmar</button>
      </div>
    </div>
  </>);
}

// ---------------------------------------------------------------- vidência e vigiar

const NOME_DESTINO: Record<Destino, [string, string]> = {
  top: ['Topo do grimório', 'a da esquerda fica em cima'],
  bottom: ['Fundo do grimório', 'a da direita fica por último'],
  graveyard: ['Cemitério', ''],
};
const CURTO_DESTINO: Record<Destino, string> = { top: 'Topo', bottom: 'Fundo', graveyard: 'Cemitério' };

function CorpoArranjo({ d, visuais, onZoom }: { d: D<'arrange'>; visuais: Visual[]; onZoom: Zoom }) {
  const inicial = (): Partial<Record<Destino, string[]>> => Object.fromEntries(d.destinations.map((x, i) => [x, i === 0 ? d.items.map((it) => it.id) : []]));
  const [faixas, setFaixas] = useState(inicial);
  useEffect(() => setFaixas(inicial()), [d.id]);
  const [arrastado, setArrastado] = useState<string | null>(null);
  const indice = new Map(d.items.map((it, i) => [it.id, i]));
  const ondeEsta = (id: string) => d.destinations.find((x) => faixas[x]?.includes(id))!;
  /** põe a carta na faixa `para`, antes da carta `antes` (ou no fim) */
  const colocar = (id: string, para: Destino, antes?: string) => {
    const nova: Partial<Record<Destino, string[]>> = {};
    for (const x of d.destinations) nova[x] = (faixas[x] ?? []).filter((y) => y !== id);
    const lista = nova[para]!;
    const k = antes !== undefined ? lista.indexOf(antes) : -1;
    lista.splice(k >= 0 ? k : lista.length, 0, id);
    setFaixas(nova);
  };
  const andar = (id: string, k: number) => {
    const dest = ondeEsta(id);
    const lista = faixas[dest]!;
    const i = lista.indexOf(id);
    if (i + k < 0 || i + k >= lista.length) return;
    setFaixas({ ...faixas, [dest]: mover(lista, i, i + k) });
  };
  return (<>
    <div class="escolha-corpo">
      {d.destinations.map((dest) => (
        <section key={dest} class="faixa-arranjo" aria-label={NOME_DESTINO[dest][0]}>
          <p class="rot">{NOME_DESTINO[dest][0]} <span class="rot-nota">{(faixas[dest]?.length ?? 0) > 1 ? NOME_DESTINO[dest][1] : ''}</span></p>
          <div class={`faixa-cartas ${arrastado ? 'recebe' : ''}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (arrastado) colocar(arrastado, dest); setArrastado(null); }}>
            {(faixas[dest] ?? []).map((id, i, lista) => {
              const x = visuais[indice.get(id)!];
              const it = d.items[indice.get(id)!];
              const o = x.tipo === 'carta' || x.tipo === 'obj' || x.tipo === 'pilha' ? x.o : null;
              return (
                <div key={id} class="arranjo-carta" draggable onDragStart={(e) => { e.dataTransfer?.setData('text/plain', id); setArrastado(id); }} onDragEnd={() => setArrastado(null)}
                  onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (arrastado && arrastado !== id) colocar(arrastado, dest, id); setArrastado(null); }}>
                  {o ? <Carta o={{ ...o, tapped: false }} onZoom={onZoom} /> : <span class="item-nome">{traduzir(it.label)}</span>}
                  <span class="item-nome">{o ? nomeCarta(o.def, it.label) : ''}</span>
                  <span class="arranjo-botoes">
                    <button type="button" class="botao pequeno icone" aria-label="para a esquerda" disabled={i === 0} onClick={() => andar(id, -1)}>←</button>
                    {d.destinations.filter((x2) => x2 !== dest).map((x2) => <button key={x2} type="button" class="botao pequeno" onClick={() => colocar(id, x2)}>{CURTO_DESTINO[x2]}</button>)}
                    <button type="button" class="botao pequeno icone" aria-label="para a direita" disabled={i === lista.length - 1} onClick={() => andar(id, 1)}>→</button>
                  </span>
                </div>
              );
            })}
            {(faixas[dest]?.length ?? 0) === 0 && <span class="faixa-vazia">Solte aqui ou use o botão "{CURTO_DESTINO[dest]}" da carta</span>}
          </div>
        </section>
      ))}
    </div>
    <div class="escolha-rodape">
      <div class="botoes-linha">
        <button type="button" class="botao" onClick={() => setFaixas(inicial())}>Tudo no topo</button>
        <button type="button" class="botao cheio" onClick={() => loja.responder(d.id, { kind: 'arrange', ...respostaArranjo(d.destinations, faixas) })}>Confirmar</button>
      </div>
    </div>
  </>);
}

const IconeOlho = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>;
