// Como jogar / How to play: uma página por cima de tudo que ensina o jogo conforme a pessoa rola. No miolo, o palco
// fica parado de um lado e os passos passam do outro; o passo que está no meio da tela escolhe a cena do palco.
// Abre pelo menu da mesa, pela tela inicial e pelo saguão (tutorialLoja.ts) e vem num pacote à parte (app.tsx).

import { createPortal } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useCamada } from '../Janela.tsx';
import { nomeCarta, urlImagem } from '../cartas.ts';
import { IconeFechar, Marca } from '../icones.tsx';
import { TextoComSimbolos } from '../mesa/Simbolos.tsx';
import { mudarPreferencias, usePreferencias } from '../preferencias.ts';
import { CARTA_EXEMPLO, type IdCena } from './cenas.ts';
import { Palco } from './Palco.tsx';
import { TEXTOS, type Idioma, type ParteCarta } from './textos.ts';
import { fecharTutorial } from './tutorialLoja.ts';
import './tutorial.css';

/** onde fica cada ponto sobre a carta, em % da largura e da altura (moldura moderna): ao lado do que aponta, sem tapar */
const PONTOS: Record<ParteCarta, readonly [number, number]> = {
  nome: [53, 7.3],
  custo: [72, 7.3],
  tipo: [51, 57.4],
  colecao: [78.5, 57.4],
  texto: [62, 69],
  poder: [74.5, 90.6],
};
const PARTES = Object.keys(PONTOS) as ParteCarta[];
const IDIOMAS: readonly (readonly [Idioma, string, string])[] = [['pt', 'PT', 'Português'], ['en', 'EN', 'English']];

export function Tutorial() {
  const idioma: Idioma = usePreferencias().idiomaTutorial ?? 'pt';
  const t = TEXTOS[idioma];
  const rolagem = useRef<HTMLDivElement>(null);
  const [cena, setCena] = useState<IdCena>(t.capitulos[0].passos[0].cena);
  const [parte, setParte] = useState<ParteCarta | null>(null);
  useCamada(rolagem, fecharTutorial);

  // o passo atual é o que contém uma linha da tela: o meio dela ou, em tela estreita (o palco ocupa o alto), mais abaixo.
  // O observador só avisa que algum passo cruzou a linha; quem é o atual sai da geometria (na divisa, dois passos
  // cruzam ao mesmo tempo)
  useEffect(() => {
    const raiz = rolagem.current;
    if (!raiz || typeof IntersectionObserver !== 'function') return;
    const linha = matchMedia('(max-width: 1023px)').matches ? 66 : 50;
    const passos = [...raiz.querySelectorAll<HTMLElement>('[data-cena]')];
    const escolher = () => {
      const r = raiz.getBoundingClientRect();
      const y = r.top + r.height * linha / 100;
      const atual = passos.find((el) => { const b = el.getBoundingClientRect(); return b.top <= y && y < b.bottom; });
      if (atual) setCena(atual.dataset.cena as IdCena);
    };
    const olho = new IntersectionObserver(escolher, { root: raiz, rootMargin: `-${linha - 1}% 0px -${99 - linha}% 0px` });
    for (const el of passos) olho.observe(el);
    return () => olho.disconnect();
  }, []);

  const capAtual = t.capitulos.findIndex((c) => c.passos.some((p) => p.cena === cena));
  const irPara = (n: number) => rolagem.current?.querySelector(`[data-capitulo="${n}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const imagem = urlImagem(CARTA_EXEMPLO, 0, 'g');

  return createPortal(
    // as teclas ficam aqui dentro: os atalhos da mesa (Espaço, Esc da seleção) não ouvem enquanto o tutorial está aberto
    <div class="tut" role="dialog" aria-modal="true" aria-label={t.botao} lang={idioma === 'pt' ? 'pt-BR' : 'en'} onKeyDown={(e) => e.stopPropagation()}>
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
          <p class="rot">{t.abertura.sobre}</p>
          <h1 class="tut-titulo">{t.abertura.titulo}</h1>
          <p class="tut-lide">{t.abertura.texto}</p>
          <p class="tut-rolar" aria-hidden="true"><span>{t.abertura.rolar}</span><i /></p>
        </section>

        <section class="tut-ler">
          <div class="tut-ler-carta">
            {imagem ? <img src={imagem} alt={nomeCarta(CARTA_EXEMPLO, CARTA_EXEMPLO)} draggable={false} /> : <div class="tut-sem-arte">{CARTA_EXEMPLO}</div>}
            {PARTES.map((p, n) => (
              <button key={p} type="button" class={`tut-ponto ${parte === p ? 'ativo' : ''}`} style={{ left: `${PONTOS[p][0]}%`, top: `${PONTOS[p][1]}%` }}
                aria-pressed={parte === p} aria-label={t.carta.partes[p].nome} title={t.carta.partes[p].nome} onClick={() => setParte(parte === p ? null : p)}>{n + 1}</button>
            ))}
          </div>
          <div class="tut-ler-texto">
            <h2 class="tut-subtitulo">{t.carta.titulo}</h2>
            <p class="tut-resumo">{t.carta.resumo}</p>
            <ol class="tut-partes">
              {PARTES.map((p, n) => (
                <li key={p} class={parte === p ? 'ativo' : ''}>
                  <button type="button" aria-expanded={parte === p} onClick={() => setParte(parte === p ? null : p)}><b>{n + 1}</b>{t.carta.partes[p].nome}</button>
                  {parte === p && <p><TextoComSimbolos texto={t.carta.partes[p].texto} /></p>}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div class="tut-miolo">
          <div class="tut-palco-col"><Palco cena={cena} t={t.palco} /></div>
          <nav class="tut-trilha" aria-label={t.botao}>
            {t.capitulos.map((c, n) => (
              <button key={n} type="button" class={n === capAtual ? 'atual' : ''} aria-current={n === capAtual ? 'step' : undefined} title={`${n + 1}. ${c.titulo}`} aria-label={`${n + 1}. ${c.titulo}`} onClick={() => irPara(n)} />
            ))}
          </nav>
          <div class="tut-passos">
            {t.capitulos.map((c, n) => (
              <section key={n} class="tut-capitulo" data-capitulo={n}>
                <header class="tut-cap-topo">
                  <span class="tut-cap-n">{n + 1}</span>
                  <h2 class="tut-subtitulo">{c.titulo}</h2>
                  <p class="tut-resumo">{c.resumo}</p>
                </header>
                {c.passos.map((p, k) => (
                  <article key={p.cena} class={`tut-passo ${p.cena === cena ? 'ativo' : ''}`} data-cena={p.cena}>
                    <p class="rot">{n + 1}.{k + 1} · {c.titulo}</p>
                    <h3>{p.titulo}</h3>
                    <p>{p.texto}</p>
                  </article>
                ))}
              </section>
            ))}
          </div>
        </div>

        <section class="tut-fim">
          <h2 class="tut-titulo">{t.fim.titulo}</h2>
          <p class="tut-lide">{t.fim.texto}</p>
          <button type="button" class="botao principal grande" onClick={fecharTutorial}>{t.fim.botao}</button>
        </section>
      </div>
    </div>,
    document.body,
  );
}
