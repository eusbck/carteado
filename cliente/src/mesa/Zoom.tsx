// Visualização ampliada da carta sob o cursor, com o texto (útil para as cartas em modo manual).
// Fica colada à esquerda ou à direita da mesa, centralizada na altura e proporcional à tela; com
// muito texto ela cresce (o texto vai para o lado) sem sair da tela (medidas em medidaZoom.ts).

import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { ObjView } from '../../../motor/view.ts';
import { info, nomeCarta, urlImagem } from '../cartas.ts';
import { TextoComSimbolos } from './Simbolos.tsx';
import { palavraChave } from '../pt.ts';
import { larguraImagemZoom, medidaZoom } from './medidaZoom.ts';

/** a mesa (sem a barra lateral) e a altura da tela, atualizadas quando a janela do navegador muda */
function useTela(): { largura: number; altura: number } {
  const ler = () => ({ largura: (document.querySelector('.tabuleiro') as HTMLElement | null)?.clientWidth ?? innerWidth, altura: innerHeight });
  const [t, setT] = useState(ler);
  useEffect(() => {
    const f = () => setT(ler());
    addEventListener('resize', f);
    return () => removeEventListener('resize', f);
  }, []);
  return t;
}

/** `enjoo`: diz quando a criatura ainda não pode atacar (só com o auxílio das cartas jogáveis) */
export function Zoom({ o, lado = 'esq', fixo = false, enjoo = true }: { o: ObjView | null; lado?: 'esq' | 'dir'; fixo?: boolean; enjoo?: boolean }) {
  const caixa = useRef<HTMLElement>(null);
  const texto = useRef<HTMLDivElement>(null);
  const tela = useTela();
  // mede o texto na largura de cada tentativa e aplica a medida antes de desenhar (sem piscar)
  useLayoutEffect(() => {
    const el = caixa.current, tx = texto.current;
    if (fixo || !el || !tx) return;
    const t = { largura: (document.querySelector('.tabuleiro') as HTMLElement | null)?.clientWidth ?? tela.largura, altura: innerHeight };
    const m = medidaZoom(t, (w, e) => { tx.style.width = `${w}px`; el.style.setProperty('--ze', String(e)); return tx.offsetHeight; });
    el.dataset.modo = m.modo;
    el.style.setProperty('--zi', `${m.imagem}px`);
    el.style.setProperty('--ze', String(m.escala));
    tx.style.width = `${m.texto}px`;
    el.style.top = `${m.topo}px`;
  });
  if (!o || !o.def) return null;
  const def = o.copyOfDef ?? o.def;
  const img = urlImagem(def, o.face, fixo || larguraImagemZoom(tela) > 500 ? 'g' : 'm');
  // a miniatura da mesa (já carregada) aparece por baixo enquanto a imagem grande chega
  const previa = fixo ? null : urlImagem(def, o.face, 'p');
  const i = info(def);
  const textos = o.abilities.length ? o.abilities : [];
  return (
    <aside ref={caixa} class={fixo ? 'zoom-fixo' : `zoom ${lado}`} aria-hidden={fixo ? undefined : 'true'}>
      <div class="zoom-imagem" style={previa ? { backgroundImage: `url(${previa})` } : undefined}>{img ? <img src={img} alt="" /> : <div class="zoom-sem-arte"><strong>{nomeCarta(def, o.name)}</strong></div>}</div>
      <div class="zoom-texto" ref={texto}>
        <strong>{nomeCarta(def, o.name)}</strong>
        {i?.pendente && <p class="pendente-aviso">Carta em modo manual: aplique o efeito com "Ajuste manual". O texto está na própria carta.</p>}
        {o.power !== null && <p>Força e resistência atuais: {o.power}/{o.toughness}</p>}
        {enjoo && o.sick && o.types.includes('Creature') && <p>Enjoo de invocação: ainda não pode atacar nem usar habilidades com {'{T}'}.</p>}
        {o.loyalty !== null && o.counters.loyalty !== undefined && <p>Lealdade: {o.counters.loyalty}</p>}
        {o.keywords.length > 0 && <p>Palavras-chave: {o.keywords.map(palavraChave).join(', ')}</p>}
        {textos.map((t, k) => <p key={k}><TextoComSimbolos texto={t} /></p>)}
      </div>
    </aside>
  );
}
