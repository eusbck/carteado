// Fundo das telas de fora da mesa (entrar no servidor, criar ou entrar numa sala, saguão e Decks): uma coleção
// de wallpapers do Magic que troca sozinha. Cada abertura começa por uma imagem nova (a ordem embaralhada fica
// guardada no navegador e passa por todas antes de repetir) e, com a página aberta, troca a cada minuto com um
// fade lento. Fica bem apagada (opacidade e vinheta no estilo.css) para não disputar com o conteúdo.
// As imagens e as fontes estão em imagens/fundos/ (FONTES.md).

import { useEffect, useState } from 'preact/hooks';

const IMAGENS = Object.values(import.meta.glob<string>('./imagens/fundos/*.webp', { eager: true, query: '?url', import: 'default' }));
const CHAVE = 'commander-da-mesa:fundos';
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

/** a próxima imagem da ordem guardada (sem armazenamento, a ordem vale só enquanto a página está aberta) */
let memoria: Ordem | null = null;
function proxima(): string {
  let o = memoria;
  if (!o) {
    try { o = JSON.parse(localStorage.getItem(CHAVE) ?? 'null') as Ordem | null; } catch { o = null; }
  }
  if (!o || o.n !== IMAGENS.length || !Array.isArray(o.ordem)) o = { n: IMAGENS.length, ordem: embaralhar(IMAGENS.length, null), pos: -1 };
  let pos = o.pos + 1;
  if (pos >= o.ordem.length) { o.ordem = embaralhar(IMAGENS.length, o.ordem[o.ordem.length - 1] ?? null); pos = 0; }
  o.pos = pos;
  memoria = o;
  try { localStorage.setItem(CHAVE, JSON.stringify(o)); } catch { /* sem armazenamento: só não lembra entre aberturas */ }
  return IMAGENS[o.ordem[pos]];
}

/** quanto dura o fade da troca (o mesmo do CSS: fundo-entra e a transição de .saindo) */
const FADE_MS = 2500;

export function FundoArte() {
  // a nova entra com fade enquanto a anterior some com fade e depois sai da página: as camadas são semitransparentes,
  // então duas inteiras ao mesmo tempo apareciam uma através da outra
  const [camadas, setCamadas] = useState<{ url: string; id: number; saindo?: boolean }[]>(() => (IMAGENS.length ? [{ url: proxima(), id: 0 }] : []));
  useEffect(() => {
    if (IMAGENS.length < 2) return;
    let id = 1;
    let vivo = true;
    const t = setInterval(() => {
      const url = proxima();
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
