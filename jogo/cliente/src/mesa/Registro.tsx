// Registro da partida, numa janela como as outras do menu (Paradas, Configurações). Onda B (estudo do Arena, registro
// R4 a R8 e R11): a estrutura das linhas aparece para quem joga.
//  - rodada → vez de cada jogador → etapa, com as rodadas antigas recolhidas;
//  - um ícone por tipo de linha e filtros por tipo, por jogador e "Comigo" (o que afetou você), além da busca;
//  - as linhas que afetaram você ganham uma borda na sua cor;
//  - cartas e jogadores clicáveis: o mouse na carta mostra a imagem; o clique acende a carta na mesa (a janela some um
//    instante para ela aparecer) ou, fora da mesa, deixa a imagem aberta; o jogador filtra pelas linhas dele;
//  - linhas de sistema da sala (entrou, saiu, desfazer) e do motor (turno, fim, concessão) com estilo próprio;
//  - "Copiar" leva o que está filtrado, com os cabeçalhos, como texto.
// A lógica (categorias, filtros, árvore, texto copiado) fica em registroLogica.ts. Atualiza com a janela aberta e
// acompanha o fim enquanto você não sobe para ler.

import type { ComponentChildren, JSX } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ObjId } from '../../../motor/types.ts';
import type { GameView, LogLinhaView, LogRefView } from '../../../motor/view.ts';
import { nomeDaRef, textoDaLinha, traduzir, urlImagem } from '../cartas.ts';
import {
  IconeCopiar, IconeRegAtaque, IconeRegCompra, IconeRegDano, IconeRegFicha, IconeRegGatilho, IconeRegMagia, IconeRegManual,
  IconeRegMorte, IconeRegOutro, IconeRegSistema, IconeRegVida, IconeRecolher,
} from '../icones.tsx';
import { Janela } from '../Janela.tsx';
import { useLoja } from '../loja.ts';
import {
  afetou, agrupar, CATEGORIAS, intercalar, normalizar, passa, textoParaCopiar, tituloRodada, tituloVez, type BlocoRodada,
  type Categoria, type Filtros, type LinhaReg,
} from './registroLogica.ts';
import { acenderFonte } from './zoomPilha.ts';

/** quantas linhas a vista traz (motor/view.ts) */
const LINHAS_DA_VISTA = 200;
/** quantas rodadas, do fim para trás, começam abertas */
const RODADAS_ABERTAS = 2;
/** quanto tempo a janela some para a carta acender na mesa */
const MOSTRAR_NA_MESA_MS = 1600;

const ICONES: Record<Categoria, () => JSX.Element> = {
  magia: IconeRegMagia, gatilho: IconeRegGatilho, ataque: IconeRegAtaque, dano: IconeRegDano, vida: IconeRegVida,
  morte: IconeRegMorte, compra: IconeRegCompra, ficha: IconeRegFicha, sistema: IconeRegSistema, manual: IconeRegManual,
  outro: IconeRegOutro,
};

type Jogadores = GameView['players'];

interface Previa { def: string; x: number; y: number; fixa: boolean }

/** o texto mostrado de uma linha (o da busca e o copiado) */
function textoMostrado(l: LinhaReg, jogadores: Jogadores): string {
  if (l.sistema) return l.sistema.texto;
  return textoDaLinha(l.log!, jogadores);
}

export function Registro({ v, cor, fechar }: { v: GameView; cor: (p: number) => string; fechar: () => void }) {
  const sistema = useLoja((x) => x.sistema);
  const [busca, setBusca] = useState('');
  const [categorias, setCategorias] = useState<Set<Categoria>>(new Set());
  const [jogadores, setJogadores] = useState<Set<number>>(new Set());
  const [comigo, setComigo] = useState(false);
  /** rodadas abertas ou fechadas à mão (as outras seguem o padrão) */
  const [abertas, setAbertas] = useState<Map<string, boolean>>(new Map());
  const [previa, setPrevia] = useState<Previa | null>(null);
  const [naMesa, setNaMesa] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const lista = useRef<HTMLDivElement>(null);
  const noFim = useRef(true);
  const eu = v.you;

  const filtrando = !!(busca.trim() || categorias.size || jogadores.size || comigo);

  // as linhas com o texto mostrado; os começos de turno viram o cabeçalho da vez e saem da lista
  const todas = useMemo(() => intercalar(v.log, sistema, v.players.length), [v.log, sistema, v.players.length]);
  const vezDe = useMemo(() => {
    const m = new Map<number, number>();
    for (const l of v.log) if (l.kind === 'turno' && l.actor != null) m.set(l.turn, l.actor);
    return (t: number) => m.get(t) ?? (t === v.turn.number ? v.turn.active : null);
  }, [v.log, v.turn.number, v.turn.active]);

  const { arvore, total, textos } = useMemo(() => {
    const f: Filtros = { categorias, jogadores, comigo, termo: normalizar(busca.trim()) };
    const textos = new Map<string, string>();
    const visiveis: LinhaReg[] = [];
    for (const l of todas) {
      if (l.log?.kind === 'turno') continue;
      const t = textoMostrado(l, v.players);
      if (!passa(l, f, eu, t)) continue;
      textos.set(l.chave, t);
      visiveis.push(l);
    }
    return { arvore: agrupar(visiveis, vezDe), total: visiveis.length, textos };
  }, [todas, v.players, categorias, jogadores, comigo, busca, eu, vezDe]);

  // abre no fim; com linhas novas, continua no fim se você estava lá
  useLayoutEffect(() => {
    const el = lista.current;
    if (el && noFim.current) el.scrollTop = el.scrollHeight;
  }, [v.log.length, sistema.length, busca, categorias, jogadores, comigo]);
  const rolou = () => {
    const el = lista.current;
    if (el) noFim.current = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
  };

  // a carta acesa e a prévia saem com a janela
  useEffect(() => () => acenderFonte(null), []);

  const alternar = <T,>(s: Set<T>, x: T, set: (n: Set<T>) => void) => {
    const n = new Set(s);
    if (n.has(x)) n.delete(x); else n.add(x);
    noFim.current = true;
    set(n);
  };

  const aberta = (r: BlocoRodada<LinhaReg>, i: number) => abertas.get(r.chave) ?? (filtrando || i >= arvore.length - RODADAS_ABERTAS);

  // ids na mesa (campo, comando): o clique acende a carta lá
  const naMesaIds = useMemo(() => new Set<ObjId>([...v.battlefield, ...v.command].map((o) => o.id)), [v.battlefield, v.command]);

  const mostrarPrevia = (r: LogRefView, el: HTMLElement, fixa: boolean) => {
    if (r.k !== 'obj' || !r.def) return;
    const q = el.getBoundingClientRect();
    setPrevia({ def: r.def, x: q.left, y: q.top, fixa });
    if (r.id !== undefined && naMesaIds.has(r.id)) acenderFonte(r.id);
  };
  const soltarPrevia = () => {
    setPrevia((p) => (p?.fixa ? p : null));
    if (!naMesa) acenderFonte(null);
  };
  const clicarCarta = (r: LogRefView, el: HTMLElement) => {
    if (r.k !== 'obj') return;
    if (r.id !== undefined && naMesaIds.has(r.id)) {
      // a janela some um instante e a carta fica acesa na mesa
      acenderFonte(r.id);
      setPrevia(null);
      setNaMesa(true);
      setTimeout(() => { setNaMesa(false); acenderFonte(null); }, MOSTRAR_NA_MESA_MS);
      return;
    }
    if (previa?.fixa && previa.def === r.def) { setPrevia(null); return; }
    mostrarPrevia(r, el, true);
  };

  const pedacos = (l: LogLinhaView): ComponentChildren => {
    if (!l.parts?.length || !l.refs) {
      // sem partes: o autor (pelo `actor`) em destaque, se o texto começa por ele
      const texto = traduzir(l.text);
      const nome = l.actor != null ? v.players[l.actor]?.name : undefined;
      if (nome && (texto.startsWith(`${nome} `) || texto.startsWith(`${nome}:`))) return <>{botaoJogador(l.actor!)}{texto.slice(nome.length)}</>;
      return texto;
    }
    return l.parts.map((p, i) => {
      if (typeof p === 'string') return traduzir(p);
      const r = l.refs![p.ref];
      if (!r) return null;
      if (r.k === 'jogador') return <span key={i}>{botaoJogador(r.id)}</span>;
      const nome = nomeDaRef(r, v.players);
      if (!r.def) return <span key={i} class="reg-carta oculta">{nome}</span>;
      const mesa = r.id !== undefined && naMesaIds.has(r.id);
      return (
        <button key={i} type="button" class={`reg-carta ${mesa ? 'na-mesa' : ''}`} title={mesa ? 'Mostrar na mesa' : 'Ver a carta'}
          onMouseEnter={(e) => mostrarPrevia(r, e.currentTarget, false)} onMouseLeave={soltarPrevia}
          onFocus={(e) => mostrarPrevia(r, e.currentTarget, false)} onBlur={soltarPrevia}
          onClick={(e) => clicarCarta(r, e.currentTarget)}>{nome}</button>
      );
    });
  };

  function botaoJogador(p: number) {
    const nome = v.players[p]?.name ?? '?';
    return (
      <button type="button" class={`reg-jogador ${jogadores.has(p) ? 'marcado' : ''}`} style={{ color: cor(p) }} title={`Só as linhas de ${nome}`}
        onClick={() => alternar(jogadores, p, setJogadores)}>{nome}</button>
    );
  }

  const copiar = async () => {
    const texto = textoParaCopiar(arvore, (p) => v.players[p]?.name ?? null, (l) => `${textos.get(l.chave) ?? ''}${l.log?.rule ? ` (CR ${l.log.rule})` : ''}`);
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(total === 1 ? '1 linha copiada' : `${total} linhas copiadas`);
    } catch {
      setCopiado('Não deu para copiar');
    }
    setTimeout(() => setCopiado(null), 2500);
  };

  const Icone = (c: Categoria) => { const I = ICONES[c]; return <span class={`reg-icone c-${c}`} aria-hidden="true"><I /></span>; };

  return (
    <>
      <Janela titulo="Registro da partida" classe="registro-janela" fechar={fechar} escondida={naMesa}>
        <div class="registro-busca">
          <input type="search" value={busca} placeholder="Procurar (carta, jogador, regra…)" aria-label="Procurar no registro"
            onInput={(ev) => { noFim.current = true; setBusca((ev.target as HTMLInputElement).value); }} />
          {filtrando && <span class="suave">{total === 1 ? '1 linha' : `${total} linhas`}</span>}
          <button type="button" class="registro-copiar" onClick={copiar} title="Copiar o que está na lista, como texto" disabled={!total}>
            <IconeCopiar />{copiado ?? 'Copiar'}
          </button>
        </div>
        <div class="registro-filtros" role="group" aria-label="Filtros do registro">
          {eu !== null && (
            <button type="button" class={`reg-filtro comigo ${comigo ? 'marcado' : ''}`} style={{ '--cor': cor(eu) }} aria-pressed={comigo}
              onClick={() => { noFim.current = true; setComigo(!comigo); }} title="Só o que afetou você: alvo, dano, vida perdida, permanente perdida">Comigo</button>
          )}
          {CATEGORIAS.map((c) => (
            <button key={c.id} type="button" class={`reg-filtro ${categorias.has(c.id) ? 'marcado' : ''}`} aria-pressed={categorias.has(c.id)}
              onClick={() => alternar(categorias, c.id, setCategorias)}>{Icone(c.id)}{c.nome}</button>
          ))}
          <span class="reg-filtros-sep" aria-hidden="true" />
          {v.players.map((p) => (
            <button key={p.id} type="button" class={`reg-filtro jogador ${jogadores.has(p.id) ? 'marcado' : ''}`} style={{ '--cor': cor(p.id) }} aria-pressed={jogadores.has(p.id)}
              onClick={() => alternar(jogadores, p.id, setJogadores)}>{p.name}</button>
          ))}
          {filtrando && (
            <button type="button" class="reg-filtro limpar" onClick={() => { noFim.current = true; setBusca(''); setCategorias(new Set()); setJogadores(new Set()); setComigo(false); }}>Limpar</button>
          )}
        </div>
        <div class="registro-lista" ref={lista} onScroll={rolou}>
          {v.log.length >= LINHAS_DA_VISTA && !filtrando && <p class="suave registro-nota">Mostrando as últimas {LINHAS_DA_VISTA} linhas da partida.</p>}
          {total === 0 && <p class="suave">{filtrando ? 'Nada encontrado.' : 'Nada aconteceu ainda.'}</p>}
          {arvore.map((r, ri) => {
            const abre = aberta(r, ri);
            const nLinhas = r.vezes.reduce((n, x) => n + x.etapas.reduce((m, e) => m + e.linhas.length, 0), 0);
            return (
              <section key={r.chave} class={`registro-rodada ${abre ? 'aberta' : ''}`}>
                <h3>
                  <button type="button" aria-expanded={abre} onClick={() => setAbertas(new Map(abertas).set(r.chave, !abre))}>
                    <IconeRecolher />{tituloRodada(r.rodada)}{!abre && <span class="suave"> · {nLinhas === 1 ? '1 linha' : `${nLinhas} linhas`}</span>}
                  </button>
                </h3>
                {abre && r.vezes.map((vz) => {
                  const tv = vz.vez !== null && v.players[vz.vez] ? tituloVez(v.players[vz.vez].name) : null;
                  return (
                    <div key={vz.chave} class="registro-vez" style={vz.vez !== null ? { '--cor': cor(vz.vez) } : undefined}>
                      {tv && <h4>{tv}</h4>}
                      {vz.etapas.map((et) => (
                        <div key={et.chave} class="registro-etapa">
                          {et.etapa && <span class="registro-etapa-nome">{et.etapa}</span>}
                          <ol>
                            {et.linhas.map((l) => {
                              if (l.sistema) {
                                return (
                                  <li key={l.chave} class={`sistema s-${l.sistema.tipo}`}>
                                    {Icone('sistema')}<span>{l.sistema.texto}</span>
                                  </li>
                                );
                              }
                              const log = l.log!;
                              const meu = afetou(log, eu);
                              const classe = [l.categoria === 'sistema' ? 'sistema' : '', l.categoria === 'manual' ? 'manual' : '', meu ? 'afetou' : ''].filter(Boolean).join(' ');
                              return (
                                <li key={l.chave} class={classe} style={meu && eu !== null ? { '--minha': cor(eu) } : undefined}>
                                  {Icone(l.categoria)}
                                  <span>
                                    {pedacos(log)}
                                    {log.rule && <span class="regra"> (CR {log.rule})</span>}
                                  </span>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      </Janela>
      {previa && !naMesa && <PreviaCarta previa={previa} fechar={() => setPrevia(null)} />}
    </>
  );
}

/** a imagem da carta ao lado do nome (fora da janela, para não ser cortada); a fixa fecha no clique */
function PreviaCarta({ previa, fechar }: { previa: Previa; fechar: () => void }) {
  const url = urlImagem(previa.def, 0, 'm');
  if (!url) return null;
  const larg = 230;
  const alt = Math.round(larg * 1.395);
  // à esquerda do nome quando cabe; senão à direita; sempre dentro da tela
  const x = previa.x - larg - 16 >= 8 ? previa.x - larg - 16 : Math.min(innerWidth - larg - 8, previa.x + 16);
  const y = Math.max(8, Math.min(innerHeight - alt - 8, previa.y - alt / 2));
  return createPortal(
    <div class={`registro-previa ${previa.fixa ? 'fixa' : ''}`} style={{ left: `${x}px`, top: `${y}px`, width: `${larg}px` }} onClick={fechar}>
      <img src={url} alt="" draggable={false} />
    </div>,
    document.body,
  );
}
