// Como jogar / How to play: uma página por cima de tudo. No miolo, o palco fica parado de um lado e uma partida de
// exemplo anda conforme a pessoa rola; do outro lado, um painel por passo, preso no meio da tela, troca com um
// esmaecer. A rolagem é a do navegador (nada de sequestrar a rodinha): ela só diz em que ponto do filme estamos.
// Abre pelo menu da mesa, pela tela inicial e pelo saguão (tutorialLoja.ts) e vem num pacote à parte (app.tsx).

import { Fragment } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useCamada } from '../Janela.tsx';
import { nomeCarta, urlImagem } from '../cartas.ts';
import { IconeFechar, Marca } from '../icones.tsx';
import { TextoComSimbolos } from '../mesa/Simbolos.tsx';
import { mudarPreferencias, usePreferencias } from '../preferencias.ts';
import { CartaArte } from './CartaArte.tsx';
import { ARTES, CARTA_EXEMPLO, FIM, FILME } from './filme.ts';
import { Palco, type Motor } from './Palco.tsx';
import { TEXTOS, type Idioma, type ParteCarta } from './textos.ts';
import { fecharTutorial } from './tutorialLoja.ts';
import './tutorial.css';

/** cada parte da carta: de que lado fica o ponto, a altura dele, até onde vai a linha e a caixa que acende (em %) */
const PARTES: Record<ParteCarta, { lado: 'e' | 'd'; y: number; alvo: number; caixa: [number, number, number, number] }> = {
  nome: { lado: 'e', y: 7.6, alvo: 30, caixa: [5, 4.5, 64, 6.2] },
  custo: { lado: 'd', y: 7.6, alvo: 82, caixa: [72, 4.5, 23, 6.2] },
  tipo: { lado: 'e', y: 58.6, alvo: 26, caixa: [5, 55.6, 76, 6] },
  colecao: { lado: 'd', y: 58.6, alvo: 88, caixa: [81.5, 55.6, 13.5, 6] },
  texto: { lado: 'e', y: 74, alvo: 16, caixa: [6, 62, 88, 24.5] },
  poder: { lado: 'd', y: 90.6, alvo: 86, caixa: [77, 87.5, 18, 6.5] },
};
const IDS_PARTES = Object.keys(PARTES) as ParteCarta[];
const IDIOMAS: readonly (readonly [Idioma, string, string])[] = [['pt', 'PT', 'Português'], ['en', 'EN', 'English']];

const lim = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** "[[termo]]" vira um destaque */
function ComTermos({ texto }: { texto: string }) {
  return <>{texto.split(/\[\[([^\]]+)\]\]/g).map((p, i) => (i % 2 ? <b key={i} class="tut-termo">{p}</b> : <Fragment key={i}>{p}</Fragment>))}</>;
}

export function Tutorial() {
  const idioma: Idioma = usePreferencias().idiomaTutorial ?? 'pt';
  const t = TEXTOS[idioma];
  const rolagem = useRef<HTMLDivElement>(null);
  const motor = useRef<Motor | null>(null);
  const [parte, setParte] = useState<ParteCarta>('nome');
  const [atual, setAtual] = useState(-1);
  useCamada(rolagem, fecharTutorial);

  // a rolagem → o ponto do filme, a opacidade dos painéis e a trilha. Lido uma vez por quadro, só quando rola
  useEffect(() => {
    const raiz = rolagem.current!;
    const blocos = [...raiz.querySelectorAll<HTMLElement>('.tut-bloco')];
    const passos = [...raiz.querySelectorAll<HTMLElement>('.tut-passo')];
    const cabecas = [...raiz.querySelectorAll<HTMLElement>('.tut-cabeca-cap')];
    const enche = raiz.querySelector<HTMLElement>('.tut-trilha-enche');
    // onde cada capítulo começa e acaba, em passos
    const faixas: [number, number][] = [];
    for (const c of TEXTOS.pt.capitulos) { const de = faixas.length ? faixas[faixas.length - 1][1] : 0; faixas.push([de, de + c.passos.length]); }
    /** some depressa perto da divisa (6% do bloco de cada lado): a troca é um corte suave, sem buraco */
    const aparece = (fora: number) => 1 - lim((fora + 0.06) / 0.06);
    const pintar = (el: HTMLElement, o: number, lado: number) => {
      el.style.opacity = String(o);
      el.style.transform = `translateY(${(1 - o) * 14 * lado}px)`;
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      el.toggleAttribute('aria-hidden', o < 0.5);
    };
    let pedido = 0, ultimo = -2;
    // a medida dos blocos é tirada uma vez (e de novo quando a tela muda de tamanho); a cada quadro só a rolagem é
    // lida, sem forçar o navegador a refazer o layout
    let medida = { linha: 0, topos: [] as number[], alturas: [] as number[] };
    const medir = () => {
      const r = raiz.getBoundingClientRect();
      medida = {
        linha: r.height * (r.width < 1024 ? 0.7 : 0.5),
        topos: blocos.map((b) => b.getBoundingClientRect().top - r.top + raiz.scrollTop),
        alturas: blocos.map((b) => b.offsetHeight),
      };
    };
    const atualizar = () => {
      pedido = 0;
      const y = raiz.scrollTop + medida.linha;
      let pos = 0, ativo = -1, s = -1;
      blocos.forEach((_, j) => {
        const p = (y - medida.topos[j]) / medida.alturas[j];
        const tr = FILME.trechos[j];
        if (j === 0 && p < 0) s = p;
        if (p >= 0 && p < 1) { ativo = j; s = j + p; pos = tr.de + lim((p - 0.04) / 0.5) * tr.passos; }
        else if (p >= 1) { pos = Math.max(pos, tr.de + tr.passos); if (j === blocos.length - 1) s = j + p; }
      });
      passos.forEach((el, j) => { const d = s - (j + 0.5); pintar(el, aparece(Math.abs(d) - 0.5), d > 0 ? -1 : 1); });
      cabecas.forEach((el, c) => { const [de, ate] = faixas[c]; const fora = Math.max(de - s, s - ate); pintar(el, aparece(fora), s > ate ? -1 : 1); });
      motor.current?.irPara(Math.min(pos, FIM));
      if (enche) enche.style.transform = `scaleY(${pos / FIM})`;
      if (ativo !== ultimo) { ultimo = ativo; setAtual(ativo); }
    };
    const pedir = () => { if (!pedido) pedido = requestAnimationFrame(atualizar); };
    const remedir = () => { medir(); pedir(); };
    raiz.addEventListener('scroll', pedir, { passive: true });
    // o tamanho muda com a janela, com a fonte que chega depois e com a troca de idioma (textos de outro tamanho)
    const ro = new ResizeObserver(remedir);
    ro.observe(raiz);
    for (const sel of ['.tut-abertura', '.tut-ler', '.tut-miolo']) ro.observe(raiz.querySelector(sel)!);
    void document.fonts?.ready.then(remedir);
    medir();
    atualizar();
    return () => { raiz.removeEventListener('scroll', pedir); ro.disconnect(); cancelAnimationFrame(pedido); };
  }, []);

  const capituloDe = (j: number) => { let n = 0; for (const [c, cap] of t.capitulos.entries()) { if (j < n + cap.passos.length) return c; n += cap.passos.length; } return -1; };
  const capAtual = atual < 0 ? -1 : capituloDe(atual);
  const primeiroDe = (c: number) => t.capitulos.slice(0, c).reduce((s, x) => s + x.passos.length, 0);
  const irPara = (c: number) => rolagem.current?.querySelectorAll<HTMLElement>('.tut-bloco')[primeiroDe(c)]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const imagem = urlImagem(CARTA_EXEMPLO, 0, 'g');

  let j = 0;
  return createPortal(
    // as teclas ficam aqui dentro: os atalhos da mesa (Espaço, Esc da seleção) não ouvem enquanto o tutorial está aberto
    <div class="tut" role="dialog" aria-modal="true" aria-label={t.botao} lang={idioma === 'pt' ? 'pt-BR' : 'en'} onKeyDown={(e) => e.stopPropagation()}>
      <div class="tut-ceu" aria-hidden="true" />
      <header class="tut-topo">
        <div class="marca-jogo"><Marca /><span>COMMANDER</span></div>
        <strong class="tut-topo-titulo">{t.botao}</strong>
        <div class="tut-idiomas" role="group" aria-label={t.idioma}>
          {IDIOMAS.map(([id, sigla, nome]) => (
            <button key={id} type="button" aria-pressed={idioma === id} title={nome} onClick={() => mudarPreferencias({ idiomaTutorial: id })}>{sigla}</button>
          ))}
        </div>
        <button type="button" class="botao icone fantasma janela-x" aria-label={t.fechar} title={t.fechar} onClick={fecharTutorial}><IconeFechar /></button>
      </header>

      <div class="tut-rolagem" ref={rolagem} tabIndex={-1}>
        <section class="tut-abertura">
          <div class="tut-abertura-texto">
            <p class="tut-sobre">{t.abertura.sobre}</p>
            <h1 class="tut-titulo">{t.abertura.titulo}</h1>
            <p class="tut-lide">{t.abertura.texto}</p>
          </div>
          <div class="tut-leque" aria-hidden="true">
            {(['F1', 'elfo', 'cmd', 'anjo', 'espadas'] as const).map((id, i) => (
              <div key={id} class="tut-leque-carta" style={{ '--i': i - 2 }}><CartaArte arte={ARTES[id]} /></div>
            ))}
          </div>
          <p class="tut-rolar" aria-hidden="true"><span>{t.abertura.rolar}</span><i /></p>
        </section>

        <section class="tut-ler">
          <h2 class="tut-cabeca">{t.carta.titulo}</h2>
          <div class="tut-ler-grade">
            <div class="tut-ler-carta">
              {imagem ? <img src={imagem} alt={nomeCarta(CARTA_EXEMPLO, CARTA_EXEMPLO)} draggable={false} /> : <div class="tut-sem-arte">{CARTA_EXEMPLO}</div>}
              <div class="tut-ler-recorte">
                {IDS_PARTES.map((id) => {
                  const q = PARTES[id];
                  return <span key={id} class={`tut-caixa ${parte === id ? 'ativa' : ''}`} style={{ left: `${q.caixa[0]}%`, top: `${q.caixa[1]}%`, width: `${q.caixa[2]}%`, height: `${q.caixa[3]}%` }} />;
                })}
              </div>
              {IDS_PARTES.map((id, n) => {
                const q = PARTES[id];
                const linha = q.lado === 'e' ? { left: '-26px', width: `calc(${q.alvo}% + 26px)` } : { right: '-26px', width: `calc(${100 - q.alvo}% + 26px)` };
                return (
                  <Fragment key={id}>
                    <i class={`tut-guia ${q.lado} ${parte === id ? 'ativa' : ''}`} style={{ top: `${q.y}%`, ...linha }} />
                    <button type="button" class={`tut-ponto ${q.lado} ${parte === id ? 'ativo' : ''}`} style={{ top: `${q.y}%` }}
                      aria-pressed={parte === id} aria-label={t.carta.partes[id].nome} title={t.carta.partes[id].nome} onClick={() => setParte(id)}>{n + 1}</button>
                  </Fragment>
                );
              })}
            </div>
            <div class="tut-ler-texto">
              <p class="tut-resumo">{t.carta.resumo}</p>
              <div class="tut-explica" key={parte}>
                <span class="tut-explica-n">{IDS_PARTES.indexOf(parte) + 1}</span>
                <h3>{t.carta.partes[parte].nome}</h3>
                <p><TextoComSimbolos texto={t.carta.partes[parte].texto} /></p>
              </div>
              <div class="tut-chips">
                {IDS_PARTES.map((id, n) => (
                  <button key={id} type="button" class={parte === id ? 'ativo' : ''} aria-pressed={parte === id} onClick={() => setParte(id)}><b>{n + 1}</b>{t.carta.partes[id].nome}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div class="tut-miolo">
          <div class="tut-palco-col"><Palco t={t.palco} registrar={(m) => { motor.current = m; }} /></div>
          <nav class="tut-trilha" aria-label={t.botao}>
            <i class="tut-trilha-linha"><i class="tut-trilha-enche" /></i>
            {t.capitulos.map((c, n) => (
              <button key={n} type="button" class={n === capAtual ? 'atual' : n < capAtual ? 'feito' : ''} aria-current={n === capAtual ? 'step' : undefined}
                title={`${n + 1}. ${c.titulo}`} aria-label={`${n + 1}. ${c.titulo}`} onClick={() => irPara(n)}><span>{n + 1}</span></button>
            ))}
          </nav>
          <div class="tut-texto-col">
            <div class="tut-paineis">
              <div class="tut-paineis-meio">
                {t.capitulos.map((c, n) => (
                  <header key={n} class="tut-cabeca-cap">
                    <h2 class="tut-cap"><span>{n + 1}.</span> {c.titulo}</h2>
                    <p class="tut-cap-resumo">{c.resumo}</p>
                  </header>
                ))}
                {t.capitulos.map((c) => c.passos.map((passo, k) => (
                  <article key={passo.cena} class="tut-passo">
                    <p class="tut-passo-n">{k + 1}/{c.passos.length}</p>
                    <h3>{passo.titulo}</h3>
                    <p><ComTermos texto={passo.texto} /></p>
                  </article>
                )))}
              </div>
            </div>
            {t.capitulos.map((c, n) => c.passos.map((passo, k) => {
              const idx = j++;
              return <section key={passo.cena} class={`tut-bloco ${idx === atual ? 'ativo' : ''}`} data-cena={passo.cena} data-capitulo={k === 0 ? n : undefined} aria-hidden="true" />;
            }))}
          </div>
        </div>

        <section class="tut-fim">
          <h2 class="tut-titulo">{t.fim.titulo}</h2>
          <p class="tut-lide">{t.fim.texto}</p>
          <div class="tut-fim-botoes">
            <button type="button" class="tut-cta" onClick={fecharTutorial}>{t.fim.botao}</button>
            <button type="button" class="tut-cta fantasma" onClick={() => rolagem.current?.scrollTo({ top: 0, behavior: 'smooth' })}>{t.fim.voltar}</button>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  );
}
