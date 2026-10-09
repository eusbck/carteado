// Configurações › Desempenho: a chave do modo Desempenho, para computadores mais fracos. Desligada por padrão: só a
// pessoa liga, nada muda sozinho, e desligada o visual é o de sempre. O que o modo tira está em preferencias.ts
// (Preferencias.desempenho) e no fim do estilo.css.

import { mudarPreferencias, type Preferencias } from '../preferencias.ts';

export function ConfigDesempenho({ pref }: { pref: Preferencias }) {
  return (
    <section class="bloco-config" aria-labelledby="cfg-desempenho-rot">
      <p class="rot" id="cfg-desempenho-rot">Desempenho <span class="rot-nota">guardado neste navegador</span></p>
      <label class="caixa"><input type="checkbox" id="cfg-desempenho" checked={pref.desempenho} onChange={() => mudarPreferencias({ desempenho: !pref.desempenho })} /> Modo Desempenho, para computadores mais fracos</label>
      <p class="suave">Tira os desfoques atrás dos painéis, o movimento lento dos fundos, as brasas e as faíscas, a aura que respira no avatar e os brilhos de dano, e toca a música sem guardar a faixa inteira na memória. Desligado, tudo fica como sempre.</p>
    </section>
  );
}
