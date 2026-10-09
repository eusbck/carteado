// Prévia de um deck no saguão, antes de escolher: o comandante, as cores e as cartas separadas por tipo. Passar o
// mouse (ou o foco) numa carta mostra ela grande ao lado. A lista vem do servidor (/api/catalogo/<id>/cartas) e
// fica guardada enquanto a página está aberta.

import { useEffect, useState } from 'preact/hooks';
import type { CartaCatalogo, DeckResumo, ListaDeck } from '../../../servidor/protocolo.ts';
import { nomeCarta, urlArte } from '../cartas.ts';
import { Janela } from '../Janela.tsx';
import { Simbolos } from '../mesa/Simbolos.tsx';

const guardadas = new Map<string, Promise<ListaDeck | null>>();
function buscarLista(id: string): Promise<ListaDeck | null> {
  let p = guardadas.get(id);
  if (!p) {
    p = fetch(`/api/catalogo/${encodeURIComponent(id)}/cartas`).then((r) => (r.ok ? r.json() as Promise<ListaDeck> : null)).catch(() => null);
    p.then((l) => { if (!l) guardadas.delete(id); });
    guardadas.set(id, p);
  }
  return p;
}

/** grupos na ordem de uma lista de Commander; uma carta entra no primeiro que bater (Criatura Artefato é criatura) */
const GRUPOS: [string, RegExp][] = [
  ['Criaturas', /criatura|creature/i],
  ['Planeswalkers', /planeswalker/i],
  ['Terrenos', /terreno|land/i],
  ['Instantâneas', /instant/i],
  ['Feitiços', /feiti|sorcery/i],
  ['Artefatos', /artefato|artifact/i],
  ['Encantamentos', /encantamento|enchantment/i],
  ['Batalhas', /batalha|battle/i],
];

function agrupar(cartas: CartaCatalogo[]): { nome: string; cartas: CartaCatalogo[]; total: number }[] {
  const grupos = new Map<string, CartaCatalogo[]>();
  for (const c of cartas) {
    const g = GRUPOS.find(([, re]) => re.test(c.tipo))?.[0] ?? 'Outras';
    grupos.set(g, [...(grupos.get(g) ?? []), c]);
  }
  return [...GRUPOS.map(([n]) => n), 'Outras']
    .filter((n) => grupos.has(n))
    .map((n) => {
      const l = grupos.get(n)!.sort((a, b) => (a.pt ?? a.nome).localeCompare(b.pt ?? b.nome));
      return { nome: n, cartas: l, total: l.reduce((s, c) => s + c.quantidade, 0) };
    });
}

/** as categorias em colunas de altura parecida, na ordem (cada uma vai para a coluna mais curta até ali) */
function emColunas<T extends { cartas: unknown[] }>(grupos: T[], n: number): T[][] {
  const colunas: T[][] = Array.from({ length: n }, () => []);
  const altura = Array(n).fill(0);
  for (const g of grupos) {
    const k = altura.indexOf(Math.min(...altura));
    colunas[k].push(g);
    altura[k] += g.cartas.length + 2;
  }
  return colunas.filter((c) => c.length);
}

const imagem = (c: CartaCatalogo | null, tamanho: 'p' | 'm') => (c?.img ? `/img/${c.img}/frente/${tamanho}` : null);

export function PreviaDeck({ d, meu, escolher, fechar }: { d: DeckResumo; meu: boolean; escolher: () => void; fechar: () => void }) {
  const [lista, setLista] = useState<ListaDeck | null | 'carregando'>('carregando');
  const [destaque, setDestaque] = useState<CartaCatalogo | null>(null);
  useEffect(() => {
    let vivo = true;
    void buscarLista(d.id).then((l) => { if (vivo) setLista(l); });
    return () => { vivo = false; };
  }, [d.id]);
  const arte = urlArte(d.comandante);
  const cores = d.cores.map((c) => `{${c}}`).join('');
  const total = lista && lista !== 'carregando' ? 1 + lista.cartas.reduce((s, c) => s + c.quantidade, 0) : null;
  const grande = imagem(destaque ?? (lista && lista !== 'carregando' ? lista.comandante : null), 'm');

  return (
    <Janela titulo={d.nome} larga classe="previa-deck" fechar={fechar}>
      <header class="previa-topo" style={arte ? { backgroundImage: `url(${arte})` } : undefined}>
        <div class="previa-topo-texto">
          <span class="rot">Comandante</span>
          <strong>{nomeCarta(d.comandante, d.comandante)}</strong>
          <span class="previa-topo-linha"><Simbolos custo={cores} />{total !== null && <span>{total} cartas</span>}</span>
        </div>
      </header>
      {lista === 'carregando' && <p class="suave previa-aviso">Carregando a lista…</p>}
      {lista === null && <p class="suave previa-aviso">Não foi possível carregar a lista deste deck.</p>}
      {lista && lista !== 'carregando' && (
        <div class="previa-corpo">
          <div class="previa-grupos" onMouseLeave={() => setDestaque(null)}>
            {emColunas(agrupar(lista.cartas), 3).map((coluna, k) => <div key={k} class="previa-coluna">{coluna.map((g) => (
              <section key={g.nome} class="previa-grupo">
                <h3 class="rot">{g.nome} <span>{g.total}</span></h3>
                <ul>
                  {g.cartas.map((c) => (
                    <li key={c.nome}>
                      <button type="button" class={destaque?.nome === c.nome ? 'ativa' : ''} onMouseEnter={() => setDestaque(c)} onFocus={() => setDestaque(c)}>
                        <span class="previa-qtd">{c.quantidade > 1 ? `${c.quantidade}×` : ''}</span>
                        <span class="previa-nome">{c.pt ?? c.nome}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}</div>)}
          </div>
          <aside class="previa-carta" aria-hidden="true">
            {grande ? <img key={grande} src={grande} alt="" /> : <span class="previa-sem-imagem" />}
            <p>{destaque ? (destaque.pt ? `${destaque.pt} · ${destaque.nome}` : destaque.nome) : 'Passe o mouse numa carta para ver'}</p>
          </aside>
        </div>
      )}
      <div class="botoes-linha previa-acoes">
        <button class="botao" onClick={fechar}>Fechar</button>
        <button class="botao cheio grande" disabled={meu} onClick={() => { escolher(); fechar(); }}>{meu ? 'Este já é o seu deck' : 'Escolher este deck'}</button>
      </div>
    </Janela>
  );
}
