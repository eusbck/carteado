// O palco do Como jogar: uma mesa de exemplo com cartas de verdade do jogo. Recebe a cena do passo que está no meio da
// tela e toca os quadros dela (cenas.ts); o movimento entre um quadro e o outro é do CSS (tutorial.css).

import { useEffect, useState } from 'preact/hooks';
import { nomeCarta, urlImagem } from '../cartas.ts';
import { ATORES, CEMITERIO, CENAS, COMANDO, GRIMORIO, VIDA_OPONENTE, VIDA_VOCE, estados, type Ator, type IdCena } from './cenas.ts';
import type { Textos } from './textos.ts';

const NOMES = Object.keys(ATORES) as Ator[];

const semMovimento = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const lugar = (p: { x: number; y: number }) => ({ left: `${p.x}%`, top: `${p.y}%` });

export function Palco({ cena, t }: { cena: IdCena; t: Textos['palco'] }) {
  // o quadro vale só para a cena em que foi marcado: trocando de cena, volta ao primeiro sem piscar o da anterior
  const [ponto, setPonto] = useState({ cena, i: 0 });
  const quadros = CENAS[cena];
  const i = ponto.cena === cena ? Math.min(ponto.i, quadros.length - 1) : 0;

  useEffect(() => {
    const lista = CENAS[cena];
    // quem pediu menos movimento vê a cena já pronta
    if (semMovimento()) { setPonto({ cena, i: lista.length - 1 }); return; }
    setPonto({ cena, i: 0 });
    let n = 0;
    let relogio: ReturnType<typeof setTimeout> | undefined;
    const seguir = () => {
      n++;
      if (n >= lista.length) return;
      relogio = setTimeout(() => { setPonto({ cena, i: n }); seguir(); }, lista[n].espera);
    };
    seguir();
    return () => clearTimeout(relogio);
  }, [cena]);

  const quadro = quadros[i];
  const est = estados(quadro);
  const vida = quadro.vida ?? [40, 40];

  return (
    <div class="tut-palco" role="img" aria-label={t.rotulo}>
      <ol class={`tut-fases ${quadro.fase === undefined ? 'fora' : ''}`} aria-hidden="true">
        {t.fases.map((f, n) => <li key={n} class={n === quadro.fase ? 'atual' : ''}>{f}</li>)}
      </ol>
      <div class="tut-mesa" aria-hidden="true">
        <div class="tut-meio" />
        <div class="tut-zona" style={lugar(GRIMORIO)}><span>{t.grimorio}</span></div>
        <div class="tut-zona" style={lugar(CEMITERIO)}><span>{t.cemiterio}</span></div>
        <div class={`tut-zona comando ${quadro.comando ? '' : 'fora'}`} style={lugar(COMANDO)}><span>{t.comando}</span></div>
        <div class={`tut-vida ${quadro.pulsoVida ? 'pulso' : ''}`} style={lugar(VIDA_OPONENTE)}><strong key={vida[1]}>{vida[1]}</strong><span>{t.oponente}</span></div>
        <div class={`tut-vida voce ${quadro.pulsoVida ? 'pulso' : ''}`} style={lugar(VIDA_VOCE)}><strong key={vida[0]}>{vida[0]}</strong><span>{t.voce}</span></div>
        {NOMES.map((a) => {
          const e = est[a];
          const def = ATORES[a];
          const img = urlImagem(def, 0, a === 'cmd' ? 'm' : 'p');
          return (
            <div key={a} class={`tut-carta ${e.oculta ? 'oculta' : ''} ${e.some ? 'some' : ''} ${e.brilho ? 'brilho' : ''}`}
              style={{ '--x': e.x, '--y': e.y, '--r': `${e.r ?? 0}deg`, '--s': e.s ?? 1, '--d': `${e.d ?? 0}ms`, zIndex: e.z ?? (e.oculta ? 1 : 5) }}>
              <div class="tut-carta-dentro">
                {img ? <img class="tut-frente" src={img} alt="" draggable={false} /> : <div class="tut-frente tut-sem-arte">{nomeCarta(def, def)}</div>}
                <div class="verso" />
              </div>
            </div>
          );
        })}
        {(quadro.marcas ?? []).map((m) => (
          <span key={`${cena}-${i}-${m.x}-${m.y}`} class={`tut-marca ${m.tipo}`} style={lugar(m)}>{m.rotulo ? t[m.rotulo] : m.t}</span>
        ))}
      </div>
    </div>
  );
}
