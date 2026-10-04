// A mesa: os quatro (ou dois) jogadores, a mão, a pilha, a decisão pendente e o registro.

import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ObjId, PriorityAction, TargetRef } from '../../../motor/types.ts';
import type { ObjView, PlayerView } from '../../../motor/view.ts';
import { nomeCarta, traduzir, urlImagem } from '../cartas.ts';
import { loja, useLoja } from '../loja.ts';
import { ETAPAS } from '../pt.ts';
import { AreaJogador } from './AreaJogador.tsx';
import { Carta, type Realce } from './Carta.tsx';
import { Decisao, type EstadoUi } from './Decisao.tsx';
import { Manual, type PegarCarta } from './Manual.tsx';
import { Paradas } from './Paradas.tsx';
import { TextoComSimbolos } from './Simbolos.tsx';
import { Zoom } from './Zoom.tsx';

type Modal = { tipo: 'zona'; jogador: number; zona: 'graveyard' | 'exile' } | { tipo: 'manual' } | { tipo: 'paradas' } | { tipo: 'conceder' } | null;

export function Mesa() {
  const e = useLoja();
  const v = e.vista!;
  const sala = e.sala!;
  const eu = v.you!;
  const d = v.decision;

  // estado da interface que vale só para a decisão atual
  const [sel, setSel] = useState<string[]>([]);
  const [ataques, setAtaques] = useState<Record<number, TargetRef>>({});
  const [bloqueios, setBloqueios] = useState<Record<number, ObjId>>({});
  const [bloqueadorAtivo, setBloqueadorAtivo] = useState<ObjId | null>(null);
  const [menu, setMenu] = useState<{ obj: ObjId; acoes: PriorityAction[] } | null>(null);
  const [zoom, setZoom] = useState<ObjView | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [pegar, setPegar] = useState<PegarCarta | null>(null);
  const [manualAberto, setManualAberto] = useState(false);
  useEffect(() => { setSel([]); setAtaques({}); setBloqueios({}); setBloqueadorAtivo(null); setMenu(null); }, [d?.id]);

  const ui: EstadoUi = { sel, setSel, ataques, setAtaques, bloqueios, setBloqueios, bloqueadorAtivo, setBloqueadorAtivo };

  // índice de objetos visíveis
  const todos = useMemo(() => {
    const m = new Map<ObjId, ObjView>();
    for (const o of [...v.battlefield, ...v.hand, ...v.exile, ...v.command, ...v.players.flatMap((p) => p.graveyard)]) m.set(o.id, o);
    return m;
  }, [v]);
  const nomeObj = (id: ObjId) => { const o = todos.get(id); return o ? nomeCarta(o.def, o.name) : (v.stack.find((s) => s.id === id)?.name ?? `objeto ${id}`); };
  const nomeAlvo = (t: TargetRef) => (t.kind === 'player' ? v.players[t.id].name : nomeObj(t.id));

  // o que cada carta pode fazer na decisão atual
  const itemPorObj = useMemo(() => {
    const m = new Map<ObjId, string>();
    if (d?.kind === 'select') for (const it of d.items) if (it.obj !== undefined && !it.disabled) m.set(it.obj, it.id);
    return m;
  }, [d]);
  const itemPorJogador = useMemo(() => {
    const m = new Map<number, string>();
    if (d?.kind === 'select') for (const it of d.items) if (it.player !== undefined && !it.disabled) m.set(it.player, it.id);
    return m;
  }, [d]);
  const acoesPorObj = useMemo(() => {
    const m = new Map<ObjId, PriorityAction[]>();
    if (d?.kind === 'priority') for (const a of d.actions) if (a.obj !== undefined) m.set(a.obj, [...(m.get(a.obj) ?? []), a]);
    return m;
  }, [d]);
  const atacantesCand = d?.kind === 'attackers' ? new Map(d.candidates.map((c) => [c.obj, c.targets])) : null;
  const bloqueadoresCand = d?.kind === 'blockers' ? new Map(d.candidates.map((c) => [c.obj, c.canBlock])) : null;
  const atacando = new Map((v.combat?.attackers ?? []).map((a) => [a.id, a]));
  const bloqueando = new Map((v.combat?.attackers ?? []).flatMap((a) => a.blockers.map((b) => [b, a.id] as const)));

  const realce = (o: ObjView): Realce => {
    if (pegar) return 'escolhivel';
    if (d?.kind === 'select') {
      const id = itemPorObj.get(o.id);
      if (id === undefined) return null;
      return sel.includes(id) ? 'escolhido' : 'escolhivel';
    }
    if (d?.kind === 'priority') return acoesPorObj.get(o.id)?.some((a) => a.kind !== 'mana') ? 'acao' : null;
    if (atacantesCand) return ataques[o.id] ? 'atacante' : atacantesCand.has(o.id) ? 'escolhivel' : null;
    if (bloqueadoresCand) {
      if (bloqueadorAtivo === o.id) return 'ativo';
      if (bloqueios[o.id] !== undefined) return 'bloqueador';
      if (bloqueadorAtivo !== null && bloqueadoresCand.get(bloqueadorAtivo)?.includes(o.id)) return 'mira';
      if (bloqueadoresCand.get(o.id)?.length) return 'escolhivel';
    }
    if (atacando.has(o.id)) return 'atacante';
    if (bloqueando.has(o.id)) return 'bloqueador';
    return null;
  };
  const legenda = (o: ObjView): string | undefined => {
    const at = ataques[o.id] ?? atacando.get(o.id)?.target;
    if (at) return `ataca ${nomeAlvo(at)}`;
    const b = bloqueios[o.id] ?? bloqueando.get(o.id);
    if (b !== undefined) return `bloqueia ${nomeObj(b)}`;
    return undefined;
  };

  const clicarCarta = (o: ObjView) => {
    if (pegar) { pegar.cb(o.id); return; }
    if (!d) return;
    if (d.kind === 'select') {
      const id = itemPorObj.get(o.id);
      if (id === undefined) return;
      if (sel.includes(id)) setSel(sel.filter((x) => x !== id));
      else if (d.max === 1) setSel([id]);
      else if (sel.length < d.max) setSel([...sel, id]);
      return;
    }
    if (d.kind === 'priority') {
      const acoes = acoesPorObj.get(o.id);
      if (acoes?.length) setMenu({ obj: o.id, acoes });
      return;
    }
    if (atacantesCand) {
      const alvos = atacantesCand.get(o.id);
      if (!alvos) return;
      if (ataques[o.id]) { const n = { ...ataques }; delete n[o.id]; setAtaques(n); return; }
      // sem escolha a fazer: um alvo só (ex.: um contra um)
      if (alvos.length === 1) setAtaques({ ...ataques, [o.id]: alvos[0] });
      return;
    }
    if (bloqueadoresCand) {
      if (bloqueadorAtivo !== null && bloqueadoresCand.get(bloqueadorAtivo)?.includes(o.id)) {
        setBloqueios({ ...bloqueios, [bloqueadorAtivo]: o.id });
        setBloqueadorAtivo(null);
        return;
      }
      if (bloqueios[o.id] !== undefined) { const n = { ...bloqueios }; delete n[o.id]; setBloqueios(n); return; }
      if (bloqueadoresCand.get(o.id)?.length) setBloqueadorAtivo(o.id === bloqueadorAtivo ? null : o.id);
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

  // ordem dos assentos a partir de mim
  const ordem = useMemo(() => {
    const i = v.turnOrder.indexOf(eu);
    return [...v.turnOrder.slice(i), ...v.turnOrder.slice(0, i)];
  }, [v.turnOrder, eu]);
  const anexos = useMemo(() => {
    const m = new Map<ObjId, ObjView[]>();
    const noCampo = new Set(v.battlefield.map((o) => o.id));
    for (const o of v.battlefield) if (o.attachedTo !== null && noCampo.has(o.attachedTo)) m.set(o.attachedTo, [...(m.get(o.attachedTo) ?? []), o]);
    return m;
  }, [v.battlefield]);
  const anexado = (o: ObjView) => o.attachedTo !== null && v.battlefield.some((x) => x.id === o.attachedTo);

  const area = (j: PlayerView, compacto: boolean) => {
    const decidindo = v.waiting?.player === j.id;
    const itemJ = itemPorJogador.get(j.id);
    return (
      <AreaJogador
        key={j.id}
        j={j}
        objs={v.battlefield.filter((o) => o.controller === j.id && !anexado(o))}
        anexos={anexos}
        comandantes={v.command.filter((o) => o.owner === j.id)}
        exilio={v.exile.filter((o) => o.owner === j.id)}
        eu={j.id === eu}
        ativo={v.turn.active === j.id}
        decidindo={decidindo}
        compacto={compacto}
        realce={realce}
        legenda={legenda}
        onCarta={clicarCarta}
        onZoom={setZoom}
        jogadorRealce={itemJ === undefined ? null : sel.includes(itemJ) ? 'escolhido' : 'escolhivel'}
        onJogador={itemJ !== undefined ? () => clicarJogador(j.id) : undefined}
        onZona={(zona) => setModal({ tipo: 'zona', jogador: j.id, zona })}
      />
    );
  };

  const oponentes = ordem.slice(1).map((p) => v.players[p]);
  const minha = v.players[eu];
  const etapaAtual = ETAPAS.findIndex((x) => x.id === v.turn.step);
  const esperando = v.waiting && v.waiting.player !== eu ? v.players[v.waiting.player]?.name : null;
  const logRef = useRef<HTMLOListElement>(null);
  useEffect(() => { const el = logRef.current; if (el) el.scrollTop = el.scrollHeight; }, [v.log.length]);
  const decisaoManual = d?.kind === 'priority' && d.actions.some((a) => a.kind === 'manual') ? d.id : null;

  return (
    <div class={`mesa ${sala.modo === '1v1' ? 'mesa-duelo' : ''}`} onClick={() => setMenu(null)}>
      <div class="oponentes">{oponentes.map((j) => area(j, true))}</div>
      <div class="minha">{area(minha, false)}</div>
      <section class="mao" aria-label="Sua mão">
        <h2 class="mao-titulo">Sua mão ({v.hand.length})</h2>
        <div class="mao-cartas">
          {v.hand.map((o) => <Carta key={o.id} o={o} realce={realce(o)} onClick={clicarCarta} onZoom={setZoom} />)}
        </div>
      </section>

      <aside class="lateral">
        <div class="turno">
          <p class="turno-linha"><strong>Turno {v.turn.number}</strong> · {v.players[v.turn.active].name}</p>
          <ol class="etapas" aria-label="Etapas do turno">
            {ETAPAS.filter((x) => x.id !== 'firstStrikeDamage' || v.turn.step === 'firstStrikeDamage').map((x) => {
              const i = ETAPAS.findIndex((y) => y.id === x.id);
              return <li key={x.id} class={i === etapaAtual ? 'atual' : i < etapaAtual ? 'passada' : ''}>{x.nome}</li>;
            })}
          </ol>
          {esperando && <p class="esperando">Esperando {esperando}…</p>}
        </div>

        {v.gameOver && (
          <div class="fim">
            <p class="decisao-titulo">Fim de partida</p>
            <p>{v.gameOver.draw ? 'Empate.' : `Venceu: ${v.gameOver.winners.map((w) => v.players[w].name).join(', ')}.`}</p>
            {sala.anfitriao === eu && <button class="botao principal" onClick={() => loja.enviar({ t: 'novaPartida' })}>Nova partida com a mesma mesa</button>}
          </div>
        )}

        {d && !v.gameOver && e.respondida !== d.id && (
          <Decisao v={v} d={d} ui={ui} nomeObj={nomeObj} nomeAlvo={nomeAlvo} abrirManual={() => setManualAberto(true)} visivel={(id) => todos.has(id)} />
        )}
        {d && !v.gameOver && e.respondida === d.id && <p class="esperando">Enviando…</p>}

        {v.stack.length > 0 && (
          <section class="pilha" aria-label="Pilha">
            <h2>Pilha</h2>
            <ol>
              {v.stack.map((s, i) => {
                const img = s.def ? urlImagem(s.def, 0, 'p') : null;
                return (
                  <li key={s.id} class={i === 0 ? 'topo' : ''}>
                    {img && <img src={img} alt="" class="mini" />}
                    <div>
                      <strong>{s.def ? nomeCarta(s.def, s.name) : s.name}</strong>
                      <span class="suave"> · {v.players[s.controller].name}{s.kind !== 'spell' ? (s.kind === 'triggered' ? ' · gatilho' : ' · habilidade') : ''}</span>
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

        <section class="registro" aria-label="Registro da partida">
          <h2>Registro</h2>
          <ol ref={logRef}>
            {v.log.map((l, i) => <li key={i} class={l.text.includes('(ajuste manual)') ? 'manual' : ''}><span class="registro-turno">{l.turn}</span> {traduzir(l.text)}{l.rule ? <span class="regra"> (CR {l.rule})</span> : null}</li>)}
          </ol>
        </section>

        <div class="botoes-linha rodape-lateral">
          <button class="botao" onClick={() => setModal({ tipo: 'paradas' })}>Paradas</button>
          {!v.gameOver && !minha.left && <button class="botao" onClick={() => setModal({ tipo: 'conceder' })}>Conceder</button>}
          <button class="botao" onClick={() => loja.enviar({ t: 'sair' })}>Sair</button>
        </div>
      </aside>

      <Zoom o={zoom} />

      {menu && (
        <div class="menu-acoes" role="menu" onClick={(ev) => ev.stopPropagation()}>
          <p class="menu-titulo">{nomeObj(menu.obj)}</p>
          {menu.acoes.map((a) => (
            <button key={a.id} class="botao acao" role="menuitem" onClick={() => { setMenu(null); loja.responder(d!.id, { kind: 'priority', action: a.id }); }}>
              <TextoComSimbolos texto={traduzir(a.label)} />
            </button>
          ))}
          <button class="botao" onClick={() => setMenu(null)}>Cancelar</button>
        </div>
      )}

      {pegar && (
        <div class="faixa-pegar">
          <span>{pegar.prompt}</span>
          <button class="botao" onClick={() => { setPegar(null); }}>Cancelar</button>
        </div>
      )}

      {modal?.tipo === 'zona' && (() => {
        const j = v.players[modal.jogador];
        const cartas = modal.zona === 'graveyard' ? j.graveyard : v.exile.filter((o) => o.owner === j.id);
        return (
          <div class="modal" role="dialog" onClick={() => setModal(null)}>
            <div class="modal-caixa larga" onClick={(ev) => ev.stopPropagation()}>
              <header class="modal-topo">
                <h2>{modal.zona === 'graveyard' ? 'Cemitério' : 'Exílio'} de {j.name} ({cartas.length})</h2>
                <button class="botao" onClick={() => setModal(null)}>Fechar</button>
              </header>
              <div class="grade-cartas">
                {cartas.length === 0 && <p class="suave">Vazio.</p>}
                {cartas.map((o) => <Carta key={o.id} o={o} realce={realce(o)} onClick={(x) => { clicarCarta(x); if (pegar) setModal(null); }} onZoom={setZoom} />)}
              </div>
            </div>
          </div>
        );
      })()}

      {modal?.tipo === 'paradas' && e.paradas && <Paradas atual={e.paradas} fechar={() => setModal(null)} />}

      {modal?.tipo === 'conceder' && (
        <div class="modal" role="dialog">
          <div class="modal-caixa">
            <h2>Conceder a partida?</h2>
            <p class="suave">Você sai da partida e os outros continuam (CR 104.3a, 800.4a).</p>
            <div class="botoes-linha">
              <button class="botao perigo" onClick={() => { loja.enviar({ t: 'conceder' }); setModal(null); }}>Conceder</button>
              <button class="botao" onClick={() => setModal(null)}>Voltar</button>
            </div>
          </div>
        </div>
      )}

      {manualAberto && decisaoManual !== null && (
        <div class={pegar ? 'escondido' : ''}>
          <Manual v={v} decisao={decisaoManual} fechar={() => { setManualAberto(false); setPegar(null); }} pegar={setPegar} nomeObj={nomeObj} />
        </div>
      )}
    </div>
  );
}
