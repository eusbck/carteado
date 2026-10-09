// Fundo das telas de fora da mesa (entrar no servidor, criar ou entrar numa sala, saguão e Decks): uma coleção
// de wallpapers do Magic que troca sozinha. Cada abertura começa por uma imagem nova (a ordem embaralhada fica
// guardada no navegador e passa por todas antes de repetir) e, com a página aberta, troca a cada minuto com um
// fade lento. Fica bem apagada (opacidade e vinheta no estilo.css) para não disputar com o conteúdo.
// A tela de entrar no servidor ("Bem-vindo, feiticeiro") tem as suas: só a 08 (Chandra nas chamas) e a 13, uma de
// cada vez, do mesmo jeito (a outra a cada abertura e a cada minuto).
// As imagens e as fontes estão em imagens/fundos/ (FONTES.md).

import { useEffect, useState } from 'preact/hooks';

const TODAS = import.meta.glob<string>('./imagens/fundos/*.webp', { eager: true, query: '?url', import: 'default' });
const COLECOES = {
  geral: { imagens: Object.values(TODAS), chave: 'commander-da-mesa:fundos' },
  entrada: { imagens: ['08', '13'].map((n) => TODAS[`./imagens/fundos/${n}.webp`]).filter(Boolean), chave: 'commander-da-mesa:fundos-entrada' },
};
type Colecao = keyof typeof COLECOES;
const TROCA_MS = 60_000;

interface Ordem { n: number; ordem: number[]; pos: number }

function embaralhar(n: number, evitarPrimeiro: number | null): number[] {
  const l = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  // a última de uma volta não abre a volta seguinte
  if (n > 1 && l[0] === evitarPrimeiro) [l[0], l[1]] = [l[1], l[0]];
  return l;
}

/** a próxima imagem da ordem guardada de cada coleção (sem armazenamento, a ordem vale só com a página aberta) */
const memoria: Partial<Record<Colecao, Ordem>> = {};
function proxima(colecao: Colecao): string {
  const { imagens, chave } = COLECOES[colecao];
  let o = memoria[colecao];
  if (!o) {
    try { o = JSON.parse(localStorage.getItem(chave) ?? 'null') as Ordem | undefined; } catch { o = undefined; }
  }
  if (!o || o.n !== imagens.length || !Array.isArray(o.ordem)) o = { n: imagens.length, ordem: embaralhar(imagens.length, null), pos: -1 };
  let pos = o.pos + 1;
  if (pos >= o.ordem.length) { o.ordem = embaralhar(imagens.length, o.ordem[o.ordem.length - 1] ?? null); pos = 0; }
  o.pos = pos;
  memoria[colecao] = o;
  try { localStorage.setItem(chave, JSON.stringify(o)); } catch { /* sem armazenamento: só não lembra entre aberturas */ }
  return imagens[o.ordem[pos]];
}

/** quanto dura o fade da troca (o mesmo do CSS: fundo-entra e a transição de .saindo) */
const FADE_MS = 2500;

export function FundoArte({ colecao = 'geral' }: { colecao?: Colecao }) {
  const imagens = COLECOES[colecao].imagens;
  // a nova entra com fade enquanto a anterior some com fade e depois sai da página: as camadas são semitransparentes,
  // então duas inteiras ao mesmo tempo apareciam uma através da outra
  const [camadas, setCamadas] = useState<{ url: string; id: number; saindo?: boolean }[]>(() => (imagens.length ? [{ url: proxima(colecao), id: 0 }] : []));
  useEffect(() => {
    if (imagens.length < 2) return;
    let id = 1;
    let vivo = true;
    const t = setInterval(() => {
      const url = proxima(colecao);
      // só troca depois de carregar, para o fade não mostrar um buraco
      const img = new Image();
      img.onload = () => {
        if (!vivo) return;
        setCamadas((c) => [...c.filter((x) => !x.saindo).map((x) => ({ ...x, saindo: true })), { url, id: id++ }]);
        setTimeout(() => { if (vivo) setCamadas((c) => c.filter((x) => !x.saindo)); }, FADE_MS + 300);
      };
      img.src = url;
    }, TROCA_MS);
    return () => { vivo = false; clearInterval(t); };
  }, []);
  if (!camadas.length) return null;
  return (
    <div class="fundo-arte" aria-hidden="true">
      {camadas.map((c) => <div key={c.id} class={`fundo-arte-img ${c.saindo ? 'saindo' : ''}`} style={{ backgroundImage: `url(${c.url})` }} />)}
    </div>
  );
}
