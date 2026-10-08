// Painel da decisão pendente do jogador na coluna da mesa: prioridade, pagamento e combate. Toda
// escolha é por clique (nunca é preciso digitar). As escolhas de itens, números e vidência ficam
// na janela do meio da mesa (JanelaEscolha.tsx). Na mesa real o painel não orienta: listas
// completas, sugestões e motivos dependem dos auxílios.

import { useEffect, useState } from 'preact/hooks';
import type { Answer, Decision, ObjId, PriorityAction, TargetRef } from '../../../motor/types.ts';
import type { GameView } from '../../../motor/view.ts';
import { traduzir } from '../cartas.ts';
import { IconeEscudo, IconeEspada } from '../icones.tsx';
import { loja } from '../loja.ts';
import { reservaPaga } from '../mana.ts';
import type { Auxilios } from '../preferencias.ts';
import { Simbolos, TextoComSimbolos } from './Simbolos.tsx';

export interface EstadoUi {
  sel: string[];
  setSel: (s: string[]) => void;
  /** criaturas marcadas para atacar; null = marcada, ainda sem alvo */
  ataques: Record<number, TargetRef | null>;
  setAtaques: (a: Record<number, TargetRef | null>) => void;
  bloqueios: Record<number, ObjId>;
  setBloqueios: (b: Record<number, ObjId>) => void;
  bloqueadorAtivo: ObjId | null;
  setBloqueadorAtivo: (b: ObjId | null) => void;
  /** confirmam a declaração (a mesa confere o que falta e treme o que não dá) */
  confirmarAtaque: () => void;
  confirmarBloqueio: () => void;
}

interface Props {
  v: GameView;
  d: Decision;
  ui: EstadoUi;
  nomeObj: (id: ObjId) => string;
  nomeAlvo: (t: TargetRef) => string;
  /** ações de prioridade que não estão presas a nenhuma carta à vista */
  acoesSoltas: PriorityAction[];
  /** a sua reserva de mana */
  reserva: string;
  /** o objeto já aparece na mesa ou na mão (então o painel mostra só o nome) */
  visivel: (id: ObjId) => boolean;
  aux: Auxilios;
}

type D<K extends Decision['kind']> = Extract<Decision, { kind: K }>;

const responder = (d: Decision, a: Answer) => loja.responder(d.id, a);
const mesmoAlvo = (a: TargetRef, b: TargetRef) => a.kind === b.kind && a.id === b.id;

/** ações que não estão presas a nenhuma carta à vista (as outras se fazem clicando na carta) */
function Prioridade({ d, acoes }: { d: D<'priority'>; acoes: PriorityAction[] }) {
  return (
    <div class="decisao">
      <p class="decisao-titulo">Outras ações</p>
      <div class="lista-acoes">
        {acoes.map((a) => <button key={a.id} class="botao acao" onClick={() => responder(d, { kind: 'priority', action: a.id })}><TextoComSimbolos texto={traduzir(a.label)} /></button>)}
      </div>
    </div>
  );
}

function Pagamento({ d, reserva, visivel, aux }: { d: D<'payment'>; reserva: string; visivel: (id: ObjId) => boolean; aux: Auxilios }) {
  const [vida, setVida] = useState(0);
  const paga = reservaPaga(d.cost, reserva);
  // fontes que não estão à vista na mesa (raro) ficam como botões aqui
  const soltas = d.sources.filter((s) => !visivel(s.obj));
  return (
    <div class="decisao">
      <p class="decisao-titulo"><TextoComSimbolos texto={traduzir(d.prompt)} /></p>
      <div class="pagamento">
        <span class="rot">Custo</span><Simbolos custo={d.cost} tam={18} />
        <span class="rot">Reserva</span>{reserva ? <Simbolos custo={reserva} tam={18} /> : <span class="suave">vazia</span>}
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
      {soltas.length > 0 && (
        <div class="lista-acoes">
          {soltas.map((s) => <button key={s.id} class="botao acao" onClick={() => responder(d, { kind: 'payment', activate: { source: s.id } })}><TextoComSimbolos texto={traduzir(s.label)} /></button>)}
        </div>
      )}
      <div class="botoes-linha">
        <button class="botao cheio" disabled={aux.terrenos && paga === false} onClick={() => responder(d, { kind: 'payment', pay: true })}>Confirmar pagamento</button>
        {aux.pagarAuto && d.canAuto && <button class="botao" onClick={() => responder(d, { kind: 'payment', auto: true })}>Pagar automaticamente</button>}
        {d.canCancel && <button class="botao fantasma" onClick={() => responder(d, { kind: 'payment', cancel: true })}>Cancelar</button>}
      </div>
    </div>
  );
}

/** ataque: o resumo do que você marcou na mesa; com "Brilho nos alvos válidos", a lista inteira com os alvos */
function Atacantes({ d, ui, nomeObj, nomeAlvo, aux }: { d: D<'attackers'>; ui: EstadoUi; nomeObj: (id: ObjId) => string; nomeAlvo: (t: TargetRef) => string; aux: Auxilios }) {
  const alternar = (obj: ObjId, t: TargetRef) => {
    const atual = ui.ataques[obj];
    const novo = { ...ui.ataques };
    if (atual && mesmoAlvo(atual, t)) delete novo[obj]; else novo[obj] = t;
    ui.setAtaques(novo);
  };
  const marcadas = Object.entries(ui.ataques).map(([o, t]) => [Number(o), t] as [ObjId, TargetRef | null]);
  // criaturas com exigência de ataque (goad, "ataca se puder"): CR 508.1d
  const obrigadas = d.candidates.filter((c) => c.required?.length);
  const marcarObrigadas = () => {
    const novo = { ...ui.ataques };
    for (const c of obrigadas) { const t = novo[c.obj]; if (!t || !c.required!.some((r) => mesmoAlvo(r, t))) novo[c.obj] = c.required![0]; }
    ui.setAtaques(novo);
  };
  return (
    <div class="decisao combate">
      <p class="decisao-titulo">Ataque</p>
      {aux.avisos && d.error && <p class="erro-decisao">{d.error}</p>}
      {aux.alvos ? (
        <div class="linhas">
          {d.candidates.map((c) => (
            <div class="linha" key={c.obj}>
              <span class="linha-nome">{nomeObj(c.obj)}{c.required?.length ? <span class="linha-aviso"> · precisa atacar</span> : null}</span>
              <span class="linha-botoes">
                {c.targets.map((t) => (
                  <button key={`${t.kind}${t.id}`} class={`botao pequeno ${ui.ataques[c.obj] && mesmoAlvo(ui.ataques[c.obj]!, t) ? 'ativo' : ''}`} onClick={() => alternar(c.obj, t)}>{nomeAlvo(t)}</button>
                ))}
              </span>
            </div>
          ))}
        </div>
      ) : marcadas.length > 0 && (
        <div class="linhas-combate">
          {marcadas.map(([o, t]) => (
            <div class="linha-combate" key={o}>
              <i class={`mini-selo ${t ? 'espada' : 'espera'}`}><IconeEspada /></i>
              <span>{nomeObj(o)} <span class="alvo">→ <b>{t ? nomeAlvo(t) : '?'}</b></span></span>
            </div>
          ))}
        </div>
      )}
      <div class="botoes-linha">
        <button class="botao cheio" onClick={ui.confirmarAtaque}>{marcadas.length ? 'Confirmar ataque' : 'Não atacar'}</button>
        {aux.alvos && obrigadas.length > 0 && <button class="botao" onClick={marcarObrigadas}>Marcar quem precisa atacar</button>}
        {marcadas.length > 0 && <button class="botao" onClick={() => ui.setAtaques({})}>Limpar</button>}
      </div>
    </div>
  );
}

/** bloqueio: o resumo do que você ligou na mesa; com "Brilho nos alvos válidos", a lista inteira */
function Bloqueadores({ d, ui, nomeObj, aux }: { d: D<'blockers'>; ui: EstadoUi; nomeObj: (id: ObjId) => string; aux: Auxilios }) {
  const alternar = (b: ObjId, a: ObjId) => {
    const novo = { ...ui.bloqueios };
    if (novo[b] === a) delete novo[b]; else novo[b] = a;
    ui.setBloqueios(novo);
  };
  const lista = Object.entries(ui.bloqueios).map(([b, a]) => [Number(b), a] as [ObjId, ObjId]);
  return (
    <div class="decisao combate">
      <p class="decisao-titulo">Bloqueio</p>
      {aux.avisos && d.error && <p class="erro-decisao">{d.error}</p>}
      {aux.alvos ? (
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
      ) : lista.length > 0 && (
        <div class="linhas-combate">
          {lista.map(([b, a]) => (
            <div class="linha-combate" key={b}>
              <i class="mini-selo escudo"><IconeEscudo /></i>
              <span>{nomeObj(b)} <span class="alvo">bloqueia <b>{nomeObj(a)}</b></span></span>
            </div>
          ))}
        </div>
      )}
      <div class="botoes-linha">
        <button class="botao cheio" onClick={ui.confirmarBloqueio}>{lista.length ? 'Confirmar bloqueio' : 'Não bloquear'}</button>
        {lista.length > 0 && <button class="botao" onClick={() => ui.setBloqueios({})}>Limpar</button>}
      </div>
    </div>
  );
}

function Dano({ d, nomeAlvo, aux }: { d: D<'damage'>; nomeAlvo: (t: TargetRef) => string; aux: Auxilios }) {
  // sem auxílio, você distribui do zero; com "Aviso de por que não dá", começa pelo dano letal
  const inicial = () => {
    if (!aux.avisos) return d.recipients.map(() => 0);
    const a = d.recipients.map(() => 0);
    let resto = d.amount;
    d.lethal.forEach((l, i) => { const x = Math.min(resto, i === d.lethal.length - 1 ? resto : l); a[i] = x; resto -= x; });
    if (resto > 0) a[a.length - 1] += resto;
    return a;
  };
  const [a, setA] = useState(inicial);
  useEffect(() => setA(inicial()), [d.id, aux.avisos]);
  const soma = a.reduce((x, y) => x + y, 0);
  const muda = (i: number, k: number) => setA(a.map((x, j) => (j === i ? Math.max(0, x + k) : x)));
  return (
    <div class="decisao">
      <p class="decisao-titulo">{traduzir(d.prompt)}</p>
      {aux.avisos && d.error && <p class="erro-decisao">{d.error}</p>}
      <div class="linhas">
        {d.recipients.map((t, i) => (
          <div class="linha" key={i}>
            <span class="linha-nome">{nomeAlvo(t)}{aux.avisos && <span class="suave"> (letal: {d.lethal[i]})</span>}</span>
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
    case 'priority': return <Prioridade d={d} acoes={p.acoesSoltas} />;
    case 'payment': return <Pagamento d={d} reserva={p.reserva} visivel={p.visivel} aux={p.aux} />;
    case 'attackers': return <Atacantes d={d} ui={p.ui} nomeObj={p.nomeObj} nomeAlvo={p.nomeAlvo} aux={p.aux} />;
    case 'blockers': return <Bloqueadores d={d} ui={p.ui} nomeObj={p.nomeObj} aux={p.aux} />;
    case 'damage': return <Dano d={d} nomeAlvo={p.nomeAlvo} aux={p.aux} />;
    // escolhas (selecionar, número, vidência) ficam na janela do meio da mesa: JanelaEscolha.tsx
    case 'select': case 'number': case 'arrange': return null;
    case 'mulligan': return <Mulligan d={d} />;
  }
}
