// Tela Decks: os decks da mesa, importar um deck pelo link do Moxfield e atualizar um deck que mudou lá.
// Um deck só entra no saguão quando todas as cartas têm regras no jogo; o que falta fica "em preparação" até o
// anfitrião pedir ao Claude Code para implementar essas cartas.

import { useState } from 'preact/hooks';
import type { CartaCatalogo, DeckCatalogo, Proposta, TarefaPublica } from '../../../servidor/protocolo.ts';
import { Janela } from '../Janela.tsx';
import { Marca } from '../icones.tsx';
import { loja, useLoja } from '../loja.ts';
import { Simbolos } from '../mesa/Simbolos.tsx';

const data = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : null);
const cartasTxt = (n: number) => (n === 1 ? '1 carta' : `${n} cartas`);

function Progresso({ t }: { t: TarefaPublica }) {
  return (
    <div class="cat-progresso" role="status">
      <span>{t.etapa}{t.total ? ` (${t.feito} de ${t.total})` : ''}…</span>
      {t.total > 0 && <span class="cat-barra"><span style={{ width: `${Math.round((100 * t.feito) / t.total)}%` }} /></span>}
    </div>
  );
}

/** cartas em linhas: imagem pequena, nome em português (e o original), tipo e se já tem regras */
function ListaCartas({ cartas, sinal }: { cartas: CartaCatalogo[]; sinal?: '+' | '−' }) {
  return (
    <ul class="cat-cartas">
      {cartas.map((c) => (
        <li key={c.nome} class={c.pronta ? '' : 'sem-regras'}>
          {/* o quadro tracejado fica à vista quando não há imagem ou ela não carrega */}
          <span class={`cat-carta-vazia ${c.img ? '' : 'sem-imagem'}`} aria-hidden="true">
            {c.img && <img src={`/img/${c.img}/frente/p`} alt="" loading="lazy" onError={(ev) => { const i = ev.currentTarget as HTMLImageElement; i.parentElement?.classList.add('sem-imagem'); i.remove(); }} />}
          </span>
          <span class="cat-carta-texto">
            <span class="cat-carta-nome">{sinal && <b class={sinal === '+' ? 'entra' : 'sai'}>{sinal}</b>}{c.quantidade > 1 ? `${c.quantidade}× ` : ''}{c.pt ?? c.nome}</span>
            <span class="cat-carta-sub">{c.pt ? `${c.nome} · ` : ''}{c.tipo}</span>
          </span>
          {!c.pronta && sinal !== '−' && <span class="etiqueta decidindo">sem regras</span>}
        </li>
      ))}
    </ul>
  );
}

function Contagem({ prontas, total }: { prontas: number; total: number }) {
  return (
    <div class="cat-contagem">
      <span><b>{prontas}</b> de {total} cartas com regras no jogo</span>
      <span class="cat-barra"><span style={{ width: `${Math.round((100 * prontas) / Math.max(1, total))}%` }} /></span>
    </div>
  );
}

function CorpoProposta({ p }: { p: Proposta }) {
  return (
    <div class="cat-proposta">
      <div class="cat-proposta-topo">
        <div>
          <p class="cat-proposta-nome">{p.nome}</p>
          <p class="suave">Comandante: {p.comandantePt ?? p.comandante}{p.comandantePt ? ` (${p.comandante})` : ''} · <a href={p.link} target="_blank" rel="noopener noreferrer">ver no Moxfield</a></p>
        </div>
      </div>
      {p.erros.length > 0 && (
        <div class="cat-erros">
          <p><b>O deck não cumpre as regras de Commander:</b></p>
          <ul>{p.erros.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      {p.avisos.length > 0 && <ul class="cat-avisos">{p.avisos.map((a) => <li key={a}>{a}</li>)}</ul>}
      {p.trocaComandante && <p class="faixa">Troca de comandante: {p.trocaComandante.de} → {p.trocaComandante.para}</p>}
      {!p.novo && (p.entram.length > 0 || p.saem.length > 0) && (
        <div class="cat-diferenca">
          <section>
            <h3 class="rot">Entram ({p.entram.reduce((n, c) => n + c.quantidade, 0)})</h3>
            {p.entram.length ? <ListaCartas cartas={p.entram} sinal="+" /> : <p class="suave">Nenhuma carta.</p>}
          </section>
          <section>
            <h3 class="rot">Saem ({p.saem.reduce((n, c) => n + c.quantidade, 0)})</h3>
            {p.saem.length ? <ListaCartas cartas={p.saem} sinal="−" /> : <p class="suave">Nenhuma carta.</p>}
          </section>
        </div>
      )}
      {p.novo && <Contagem prontas={p.prontas} total={p.total} />}
      {p.novo && p.faltam.length > 0 && (
        <details class="cat-faltam">
          <summary>Cartas sem regras ainda ({p.faltam.length})</summary>
          <ListaCartas cartas={p.faltam} />
        </details>
      )}
      <p class={`cat-resumo ${p.erros.length ? 'erro' : p.destino}`}>{p.resumo}</p>
    </div>
  );
}

/** a sua importação ou atualização: prévia, andamento da confirmação e resultado */
function JanelaTarefa({ t }: { t: TarefaPublica }) {
  const [enviando, setEnviando] = useState(false);
  const fechar = () => { if (t.estado !== 'andando') loja.fecharTarefa(); };
  const p = t.proposta;
  const titulo = t.tipo === 'confirmar' ? (t.nome ?? 'Deck') : p ? (p.novo ? 'Importar deck' : `Atualizar ${p.nome}`) : 'Deck';
  let corpo;
  let acoes;
  if (t.estado === 'andando') {
    corpo = <Progresso t={t} />;
  } else if (t.estado === 'erro') {
    corpo = <p class="cat-erro">{t.erro}</p>;
    acoes = <button class="botao" onClick={fechar}>Fechar</button>;
  } else if (t.resultado) {
    corpo = <p class={`cat-resumo ${t.resultado.destino}`}>{t.resultado.texto}</p>;
    acoes = <button class="botao" onClick={fechar}>Fechar</button>;
  } else if (p) {
    corpo = <CorpoProposta p={p} />;
    const rotulo = p.destino === 'jogavel' ? (p.novo ? 'Pôr no saguão' : 'Aplicar a atualização') : p.novo ? 'Guardar em preparação' : 'Guardar a atualização';
    acoes = (
      <>
        <button class={`botao ${p.destino === 'nada' ? '' : 'fantasma'}`} onClick={fechar}>{p.destino === 'nada' ? 'Fechar' : 'Cancelar'}</button>
        {p.destino !== 'nada' && (
          <button class="botao principal" disabled={p.erros.length > 0 || enviando}
            onClick={async () => { setEnviando(true); if (!(await loja.confirmarDeck(p.token))) setEnviando(false); }}>{rotulo}</button>
        )}
      </>
    );
  }
  return (
    <Janela titulo={titulo} fechar={fechar} larga={!!p && !p.novo && (p.entram.length > 0 || p.saem.length > 0)} classe="cat-janela">
      {corpo}
      {acoes && <div class="botoes-linha cat-acoes">{acoes}</div>}
    </Janela>
  );
}

function JanelaDetalhes({ d, fechar }: { d: DeckCatalogo; fechar: () => void }) {
  const p = d.preparacao;
  return (
    <Janela titulo={d.nome} fechar={fechar} larga={!!p && d.estado === 'atualizacao'} classe="cat-janela">
      <div class="cat-proposta">
        <p class="suave">
          Comandante: {d.comandantePt ?? d.comandante} · {d.total} cartas diferentes · <a href={d.link} target="_blank" rel="noopener noreferrer">ver no Moxfield</a>
          <br />Importado em {data(d.importadoEm)}{d.verificadoEm ? `; buscado no Moxfield em ${data(d.verificadoEm)}` : ''}.
        </p>
        {d.estado === 'pronto' && <p class="cat-resumo jogavel">Todas as cartas têm regras: o deck está no saguão.</p>}
        {p && d.estado === 'preparacao' && (
          <>
            <Contagem prontas={p.prontas} total={p.total} />
            <p class="cat-resumo preparacao">Em preparação: faltam regras para {cartasTxt(p.faltam.length)}. O deck entra no saguão assim que {p.faltam.length === 1 ? 'ela ganhar regras' : 'todas ganharem regras'}: peça ao anfitrião da mesa para completar o deck.</p>
            <ListaCartas cartas={p.faltam} />
          </>
        )}
        {p && d.estado === 'atualizacao' && (
          <>
            <p class="cat-resumo preparacao">Há uma atualização (de {data(p.recebidaEm)}) esperando {cartasTxt(p.faltam.length)} {p.faltam.length === 1 ? 'ganhar' : 'ganharem'} regras. Até lá, o deck segue com a lista anterior.</p>
            {p.comandante && <p class="faixa">Troca de comandante: {p.comandante.de} → {p.comandante.para}</p>}
            <div class="cat-diferenca">
              <section><h3 class="rot">Entram</h3>{p.entram.length ? <ListaCartas cartas={p.entram} sinal="+" /> : <p class="suave">Nenhuma carta.</p>}</section>
              <section><h3 class="rot">Saem</h3>{p.saem.length ? <ListaCartas cartas={p.saem} sinal="−" /> : <p class="suave">Nenhuma carta.</p>}</section>
            </div>
          </>
        )}
      </div>
      <div class="botoes-linha cat-acoes"><button class="botao" onClick={fechar}>Fechar</button></div>
    </Janela>
  );
}

function CartaoDeck({ d, ocupado, buscando, abrir }: { d: DeckCatalogo; ocupado: boolean; buscando: boolean; abrir: () => void }) {
  const p = d.preparacao;
  const selo = d.estado === 'pronto'
    ? <span class="cat-selo pronto">No saguão</span>
    : d.estado === 'preparacao'
      ? <span class="cat-selo preparacao">Em preparação · {p?.prontas}/{p?.total}</span>
      : <span class="cat-selo preparacao">Atualização esperando {cartasTxt(p?.faltam.length ?? 0)}</span>;
  return (
    <article class={`cat-deck ${d.estado}`}>
      <button type="button" class="cat-deck-arte" style={d.arte ? { backgroundImage: `url(/img/${d.arte}/arte)` } : undefined} onClick={abrir} aria-label={`Detalhes de ${d.nome}`}>
        {selo}
        <span class="deck-info">
          <span class="deck-nome" title={d.nome}>{d.nome}</span>
          <span class="deck-cmd"><span>{(d.comandantePt ?? d.comandante).split(',')[0]}</span><Simbolos custo={d.cores.map((c) => `{${c}}`).join('')} /></span>
        </span>
      </button>
      <div class="cat-deck-pe">
        <span class="suave">{d.atualizadoEm ? `Moxfield: ${data(d.atualizadoEm)}` : `Desde ${data(d.importadoEm)}`}</span>
        <button class="botao pequeno" disabled={ocupado} onClick={() => void loja.buscarDeck({ id: d.id })}>{buscando ? 'Buscando…' : 'Atualizar'}</button>
      </div>
    </article>
  );
}

export function Decks() {
  const e = useLoja();
  const [link, setLink] = useState('');
  const [detalhe, setDetalhe] = useState<string | null>(null);
  const t = e.tarefaDeck;
  const minha = e.minhaTarefa !== null && e.minhaTarefaEstado?.id === e.minhaTarefa ? e.minhaTarefaEstado : null;
  const ocupado = t?.estado === 'andando';
  const decks = [...(e.catalogo ?? [])].sort((a, b) => a.nome.localeCompare(b.nome));
  const prontos = decks.filter((d) => d.estado !== 'preparacao').length;
  const aberto = decks.find((d) => d.id === detalhe) ?? null;
  // a prévia, o andamento da confirmação e o resultado aparecem numa janela; a busca e o erro dela, na barra
  const janela = minha && (minha.tipo === 'confirmar' || (minha.estado === 'pronta' && minha.proposta)) ? minha : null;

  const buscar = async (ev: Event) => {
    ev.preventDefault();
    if (link.trim() && (await loja.buscarDeck({ link: link.trim() }))) setLink('');
  };

  return (
    <div class="tela-fundo">
      <main class="janela cat-tela">
        <header class="cat-topo">
          <div class="marca-jogo"><Marca /><span>COMMANDER DA MESA</span></div>
          <button class="botao fantasma" onClick={() => loja.voltarDoCatalogo()}>Voltar</button>
        </header>
        <div class="cat-titulo">
          <h1 class="titulo">Decks da mesa</h1>
          <span class="suave">{prontos} no saguão{decks.length > prontos ? `, ${decks.length - prontos} em preparação` : ''}</span>
        </div>

        <form class="bloco cat-importar" onSubmit={buscar}>
          <label>
            Link do deck no Moxfield
            <input value={link} onInput={(ev) => setLink((ev.target as HTMLInputElement).value)} placeholder="https://moxfield.com/decks/…" spellcheck={false} autocomplete="off" />
          </label>
          <button class="botao principal" type="submit" disabled={!link.trim() || ocupado}>Buscar deck</button>
          <p class="suave cat-dica">
            O deck precisa ser público ou não listado. Um link que já está na mesa atualiza o deck. Cartas que o jogo
            ainda não tem deixam o deck em preparação até ganharem regras.
          </p>
          {minha?.estado === 'andando' && !janela && <Progresso t={minha} />}
          {ocupado && t!.id !== minha?.id && <p class="suave cat-outra">Outra pessoa está importando {t!.nome ?? 'um deck'}: {t!.etapa.toLowerCase()}…</p>}
          {minha?.estado === 'erro' && minha.tipo === 'verificar' && (
            <p class="cat-erro">{minha.erro} <button type="button" class="botao pequeno fantasma" onClick={() => loja.fecharTarefa()}>Ok</button></p>
          )}
        </form>

        {e.catalogo === null
          ? <p class="suave">Carregando…</p>
          : (
            <div class="cat-grade">
              {decks.map((d) => (
                <CartaoDeck key={d.id} d={d} ocupado={!!ocupado} buscando={!!minha && minha.estado === 'andando' && minha.deck === d.id && minha.tipo === 'verificar'} abrir={() => setDetalhe(d.id)} />
              ))}
            </div>
          )}
      </main>
      {aberto && <JanelaDetalhes d={aberto} fechar={() => setDetalhe(null)} />}
      {janela && <JanelaTarefa t={janela} />}
    </div>
  );
}
