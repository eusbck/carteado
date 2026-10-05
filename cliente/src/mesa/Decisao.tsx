// Painel da decisão pendente do jogador. Toda escolha é por clique (nunca é preciso digitar).

import { useEffect, useState } from 'preact/hooks';
import type { Answer, Decision, ObjId, PriorityAction, TargetRef } from '../../../motor/types.ts';
import type { GameView } from '../../../motor/view.ts';
import { traduzir, urlImagem } from '../cartas.ts';
import { loja } from '../loja.ts';
import { TextoComSimbolos } from './Simbolos.tsx';

export interface EstadoUi {
  sel: string[];
  setSel: (s: string[]) => void;
  ataques: Record<number, TargetRef>;
  setAtaques: (a: Record<number, TargetRef>) => void;
  bloqueios: Record<number, ObjId>;
  setBloqueios: (b: Record<number, ObjId>) => void;
  bloqueadorAtivo: ObjId | null;
  setBloqueadorAtivo: (b: ObjId | null) => void;
}

interface Props {
  v: GameView;
  d: Decision;
  ui: EstadoUi;
  nomeObj: (id: ObjId) => string;
  nomeAlvo: (t: TargetRef) => string;
  abrirManual: () => void;
  /** o objeto já aparece na mesa ou na mão (então o painel mostra só o nome) */
  visivel: (id: ObjId) => boolean;
}

type D<K extends Decision['kind']> = Extract<Decision, { kind: K }>;

const responder = (d: Decision, a: Answer) => loja.responder(d.id, a);
const mesmoAlvo = (a: TargetRef, b: TargetRef) => a.kind === b.kind && a.id === b.id;

function Prioridade({ d, abrirManual }: { d: D<'priority'>; abrirManual: () => void }) {
  const [mana, setMana] = useState(false);
  const acoes = d.actions.filter((a) => a.kind !== 'pass' && a.kind !== 'mana' && a.kind !== 'manual');
  const manas = d.actions.filter((a) => a.kind === 'mana');
  const manual = d.actions.some((a) => a.kind === 'manual');
  const fazer = (a: PriorityAction) => responder(d, { kind: 'priority', action: a.id });
  return (
    <div class="decisao">
      <p class="decisao-titulo">Você tem prioridade</p>
      <div class="botoes-linha">
        <button class="botao principal grande" onClick={() => responder(d, { kind: 'priority', action: 'pass' })}>Passar</button>
        <button class="botao" onClick={() => { loja.enviar({ t: 'passarTurno' }); responder(d, { kind: 'priority', action: 'pass' }); }}>Passar até o fim do turno</button>
      </div>
      {acoes.length > 0 && (
        <div class="lista-acoes">
          {acoes.map((a) => <button key={a.id} class="botao acao" onClick={() => fazer(a)}><TextoComSimbolos texto={traduzir(a.label)} /></button>)}
        </div>
      )}
      {manas.length > 0 && (
        <details class="mana" open={mana} onToggle={(e) => setMana((e.target as HTMLDetailsElement).open)}>
          <summary>Gerar mana antes de conjurar ({manas.length})</summary>
          <div class="lista-acoes">
            {manas.map((a) => <button key={a.id} class="botao acao" onClick={() => fazer(a)}><TextoComSimbolos texto={traduzir(a.label)} /></button>)}
          </div>
        </details>
      )}
      {manual && <button class="botao" onClick={abrirManual}>Ajuste manual…</button>}
      <p class="dica">Clique numa carta para ver o que dá para fazer com ela.</p>
    </div>
  );
}

function Selecao({ d, ui, nomeObj, visivel }: { d: D<'select'>; ui: EstadoUi; nomeObj: (id: ObjId) => string; visivel: (id: ObjId) => boolean }) {
  const n = ui.sel.length;
  const ok = n >= d.min && n <= d.max;
  const alternar = (id: string) => {
    if (ui.sel.includes(id)) ui.setSel(ui.sel.filter((x) => x !== id));
    else if (d.max === 1) ui.setSel([id]);
    else if (n < d.max) ui.setSel([...ui.sel, id]);
  };
  const faixa = d.min === d.max ? `Escolha ${d.min}` : d.min === 0 ? `Escolha até ${d.max}` : `Escolha de ${d.min} a ${d.max}`;
  return (
    <div class="decisao">
      <p class="decisao-titulo">{traduzir(d.prompt)}</p>
      <p class="suave">{faixa}{d.ordered ? ', na ordem desejada' : ''}. Você também pode clicar nas cartas da mesa.</p>
      <div class="itens">
        {d.items.map((it) => {
          const img = it.card && !(it.obj !== undefined && visivel(it.obj)) ? urlImagem(it.card.def, it.card.face ?? 0, 'p') : null;
          const pos = ui.sel.indexOf(it.id);
          return (
            <button key={it.id} type="button" class={`item ${pos >= 0 ? 'escolhido' : ''} ${img ? 'item-carta' : ''}`} disabled={it.disabled} onClick={() => alternar(it.id)}>
              {img && <img src={img} alt="" loading="lazy" />}
              <span>{d.ordered && pos >= 0 ? `${pos + 1}. ` : ''}{it.obj !== undefined && visivel(it.obj) ? nomeObj(it.obj) : traduzir(it.label)}</span>
            </button>
          );
        })}
      </div>
      <div class="botoes-linha">
        <button class="botao principal" disabled={!ok} onClick={() => responder(d, { kind: 'select', ids: ui.sel })}>{n === 0 && d.min === 0 ? 'Nenhum' : 'Confirmar'}</button>
        {n > 0 && <button class="botao" onClick={() => ui.setSel([])}>Limpar</button>}
      </div>
    </div>
  );
}

function Numero({ d }: { d: D<'number'> }) {
  const [x, setX] = useState(d.min);
  useEffect(() => setX(d.min), [d.id]);
  const muda = (k: number) => setX(Math.max(d.min, Math.min(d.max, x + k)));
  return (
    <div class="decisao">
      <p class="decisao-titulo">{traduzir(d.prompt)}</p>
      <div class="contador-grande">
        <button class="botao" onClick={() => setX(d.min)} disabled={x === d.min}>mín.</button>
        <button class="botao" onClick={() => muda(-1)} disabled={x <= d.min} aria-label="menos um">−</button>
        <output aria-live="polite">{x}</output>
        <button class="botao" onClick={() => muda(1)} disabled={x >= d.max} aria-label="mais um">+</button>
        <button class="botao" onClick={() => setX(d.max)} disabled={x === d.max}>máx. ({d.max})</button>
      </div>
      <button class="botao principal" onClick={() => responder(d, { kind: 'number', value: x })}>Confirmar {x}</button>
    </div>
  );
}

function Pagamento({ d }: { d: D<'payment'> }) {
  const [vida, setVida] = useState(0);
  return (
    <div class="decisao">
      <p class="decisao-titulo"><TextoComSimbolos texto={traduzir(d.prompt)} /></p>
      <p class="suave"><TextoComSimbolos texto={`Falta: ${d.remaining}`} /></p>
      <div class="botoes-linha">
        {d.canAuto && <button class="botao principal" onClick={() => responder(d, { kind: 'payment', auto: true })}>Pagar automaticamente</button>}
        <button class="botao" onClick={() => responder(d, { kind: 'payment', pay: true })}>Pagar com a reserva</button>
        {d.canCancel && <button class="botao" onClick={() => responder(d, { kind: 'payment', cancel: true })}>Cancelar</button>}
      </div>
      {d.lifeOptions > 0 && (
        <div class="contador-grande">
          <span>Símbolos phyrexianos pagos com 2 de vida:</span>
          <button class="botao" onClick={() => setVida(Math.max(0, vida - 1))} disabled={vida === 0}>−</button>
          <output>{vida}</output>
          <button class="botao" onClick={() => setVida(Math.min(d.lifeOptions, vida + 1))} disabled={vida >= d.lifeOptions}>+</button>
          <button class="botao" onClick={() => responder(d, { kind: 'payment', life: vida })}>Aplicar</button>
        </div>
      )}
      {d.sources.length > 0 && (
        <>
          <p class="suave">Ou gere mana fonte por fonte:</p>
          <div class="lista-acoes">
            {d.sources.map((s) => <button key={s.id} class="botao acao" onClick={() => responder(d, { kind: 'payment', activate: { source: s.id } })}><TextoComSimbolos texto={traduzir(s.label)} /></button>)}
          </div>
        </>
      )}
    </div>
  );
}

function Atacantes({ d, ui, nomeObj, nomeAlvo }: { d: D<'attackers'>; ui: EstadoUi; nomeObj: (id: ObjId) => string; nomeAlvo: (t: TargetRef) => string }) {
  const alternar = (obj: ObjId, t: TargetRef) => {
    const atual = ui.ataques[obj];
    const novo = { ...ui.ataques };
    if (atual && mesmoAlvo(atual, t)) delete novo[obj]; else novo[obj] = t;
    ui.setAtaques(novo);
  };
  const lista = Object.entries(ui.ataques).map(([o, t]) => [Number(o), t] as [ObjId, TargetRef]);
  // criaturas com exigência de ataque (goad, "ataca se puder"): CR 508.1d
  const obrigadas = d.candidates.filter((c) => c.required?.length);
  const marcarObrigadas = () => {
    const novo = { ...ui.ataques };
    for (const c of obrigadas) if (!novo[c.obj] || !c.required!.some((t) => mesmoAlvo(t, novo[c.obj]))) novo[c.obj] = c.required![0];
    ui.setAtaques(novo);
  };
  return (
    <div class="decisao">
      <p class="decisao-titulo">Declare os atacantes</p>
      {d.error && <p class="erro-decisao">{d.error}</p>}
      <div class="linhas">
        {d.candidates.map((c) => (
          <div class="linha" key={c.obj}>
            <span class="linha-nome">{nomeObj(c.obj)}{c.required?.length ? <span class="linha-aviso"> · precisa atacar</span> : null}</span>
            <span class="linha-botoes">
              {c.targets.map((t) => (
                <button key={`${t.kind}${t.id}`} class={`botao pequeno ${ui.ataques[c.obj] && mesmoAlvo(ui.ataques[c.obj], t) ? 'ativo' : ''}`} onClick={() => alternar(c.obj, t)}>{nomeAlvo(t)}</button>
              ))}
            </span>
          </div>
        ))}
      </div>
      <div class="botoes-linha">
        <button class="botao principal" onClick={() => responder(d, { kind: 'attackers', attacks: lista })}>{lista.length ? `Atacar com ${lista.length}` : 'Não atacar'}</button>
        {obrigadas.length > 0 && <button class="botao" onClick={marcarObrigadas}>Marcar quem precisa atacar</button>}
        {lista.length > 0 && <button class="botao" onClick={() => ui.setAtaques({})}>Limpar</button>}
      </div>
    </div>
  );
}

function Bloqueadores({ d, ui, nomeObj }: { d: D<'blockers'>; ui: EstadoUi; nomeObj: (id: ObjId) => string }) {
  const alternar = (b: ObjId, a: ObjId) => {
    const novo = { ...ui.bloqueios };
    if (novo[b] === a) delete novo[b]; else novo[b] = a;
    ui.setBloqueios(novo);
  };
  const lista = Object.entries(ui.bloqueios).map(([b, a]) => [Number(b), a] as [ObjId, ObjId]);
  return (
    <div class="decisao">
      <p class="decisao-titulo">Declare os bloqueadores</p>
      {d.error && <p class="erro-decisao">{d.error}</p>}
      <div class="linhas">
        {d.candidates.filter((c) => c.canBlock.length > 0).map((c) => (
          <div class="linha" key={c.obj}>
            <span class="linha-nome">{nomeObj(c.obj)}</span>
            <span class="linha-botoes">
              {c.canBlock.map((a) => (
                <button key={a} class={`botao pequeno ${ui.bloqueios[c.obj] === a ? 'ativo' : ''}`} onClick={() => alternar(c.obj, a)}>bloquear {nomeObj(a)}</button>
              ))}
            </span>
          </div>
        ))}
      </div>
      <div class="botoes-linha">
        <button class="botao principal" onClick={() => responder(d, { kind: 'blockers', blocks: lista })}>{lista.length ? `Bloquear com ${lista.length}` : 'Não bloquear'}</button>
        {lista.length > 0 && <button class="botao" onClick={() => ui.setBloqueios({})}>Limpar</button>}
      </div>
    </div>
  );
}

function Dano({ d, nomeAlvo }: { d: D<'damage'>; nomeAlvo: (t: TargetRef) => string }) {
  const inicial = () => {
    const a = d.recipients.map(() => 0);
    let resto = d.amount;
    d.lethal.forEach((l, i) => { const x = Math.min(resto, i === d.lethal.length - 1 ? resto : l); a[i] = x; resto -= x; });
    if (resto > 0) a[a.length - 1] += resto;
    return a;
  };
  const [a, setA] = useState(inicial);
  useEffect(() => setA(inicial()), [d.id]);
  const soma = a.reduce((x, y) => x + y, 0);
  const muda = (i: number, k: number) => setA(a.map((x, j) => (j === i ? Math.max(0, x + k) : x)));
  return (
    <div class="decisao">
      <p class="decisao-titulo">{traduzir(d.prompt)}</p>
      {d.error && <p class="erro-decisao">{d.error}</p>}
      <div class="linhas">
        {d.recipients.map((t, i) => (
          <div class="linha" key={i}>
            <span class="linha-nome">{nomeAlvo(t)} <span class="suave">(letal: {d.lethal[i]})</span></span>
            <span class="contador">
              <button class="botao pequeno" onClick={() => muda(i, -1)} disabled={a[i] === 0}>−</button>
              <output>{a[i]}</output>
              <button class="botao pequeno" onClick={() => muda(i, 1)} disabled={soma >= d.amount}>+</button>
            </span>
          </div>
        ))}
      </div>
      <button class="botao principal" disabled={soma !== d.amount} onClick={() => responder(d, { kind: 'damage', assign: a })}>Confirmar ({soma} de {d.amount})</button>
    </div>
  );
}

function Arranjo({ d }: { d: D<'arrange'> }) {
  const [ordem, setOrdem] = useState(d.items.map((i) => i.id));
  const [lugar, setLugar] = useState<Record<string, 'top' | 'bottom' | 'graveyard'>>(Object.fromEntries(d.items.map((i) => [i.id, 'top'])));
  useEffect(() => { setOrdem(d.items.map((i) => i.id)); setLugar(Object.fromEntries(d.items.map((i) => [i.id, 'top']))); }, [d.id]);
  const nomes: Record<string, string> = { top: 'topo', bottom: 'fundo', graveyard: 'cemitério' };
  const mover = (i: number, k: number) => {
    const j = i + k;
    if (j < 0 || j >= ordem.length) return;
    const o = [...ordem];
    [o[i], o[j]] = [o[j], o[i]];
    setOrdem(o);
  };
  return (
    <div class="decisao">
      <p class="decisao-titulo">{traduzir(d.prompt)}</p>
      <p class="suave">A primeira da lista fica mais em cima.</p>
      <div class="linhas">
        {ordem.map((id, i) => {
          const it = d.items.find((x) => x.id === id)!;
          const img = it.card ? urlImagem(it.card.def, it.card.face ?? 0, 'p') : null;
          return (
            <div class="linha linha-carta" key={id}>
              {img && <img src={img} alt="" class="mini" />}
              <span class="linha-nome">{traduzir(it.label)}</span>
              <span class="linha-botoes">
                <button class="botao pequeno" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="subir">↑</button>
                <button class="botao pequeno" onClick={() => mover(i, 1)} disabled={i === ordem.length - 1} aria-label="descer">↓</button>
                {d.destinations.map((dest) => (
                  <button key={dest} class={`botao pequeno ${lugar[id] === dest ? 'ativo' : ''}`} onClick={() => setLugar({ ...lugar, [id]: dest })}>{nomes[dest]}</button>
                ))}
              </span>
            </div>
          );
        })}
      </div>
      <button class="botao principal" onClick={() => responder(d, { kind: 'arrange', placement: lugar, order: ordem })}>Confirmar</button>
    </div>
  );
}

function Mulligan({ d }: { d: D<'mulligan'> }) {
  return (
    <div class="decisao">
      <p class="decisao-titulo">Mão inicial</p>
      <p class="suave">{d.mulligans === 0 ? 'Manter estas sete cartas ou fazer mulligan?' : `Você já fez ${d.mulligans} mulligan(s). Ao manter, coloca ${d.mulligans} carta(s) no fundo (o primeiro é grátis em partidas de vários jogadores).`}</p>
      <div class="botoes-linha">
        <button class="botao principal grande" onClick={() => responder(d, { kind: 'mulligan', keep: true })}>Manter</button>
        <button class="botao" onClick={() => responder(d, { kind: 'mulligan', keep: false })}>Mulligan</button>
      </div>
    </div>
  );
}

export function Decisao(p: Props) {
  const d = p.d;
  switch (d.kind) {
    case 'priority': return <Prioridade d={d} abrirManual={p.abrirManual} />;
    case 'select': return <Selecao d={d} ui={p.ui} nomeObj={p.nomeObj} visivel={p.visivel} />;
    case 'number': return <Numero d={d} />;
    case 'payment': return <Pagamento d={d} />;
    case 'attackers': return <Atacantes d={d} ui={p.ui} nomeObj={p.nomeObj} nomeAlvo={p.nomeAlvo} />;
    case 'blockers': return <Bloqueadores d={d} ui={p.ui} nomeObj={p.nomeObj} />;
    case 'damage': return <Dano d={d} nomeAlvo={p.nomeAlvo} />;
    case 'arrange': return <Arranjo d={d} />;
    case 'mulligan': return <Mulligan d={d} />;
  }
}
