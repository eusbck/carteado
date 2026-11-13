// Escolha do número de jogadores da sala (2 a 6): ao criar a sala e, para o anfitrião, no saguão.

import { descricaoLugares, LUGARES } from '../lugares.ts';

/** de 2 a 6 lugares; `minimo`: os menores ficam desligados (no saguão, os lugares já ocupados) */
export function EscolhaLugares({ valor, mudar, minimo = 2 }: { valor: number; mudar: (n: number) => void; minimo?: number }) {
  return (
    <div class="segmentado escolha-lugares" role="radiogroup" aria-label="Número de jogadores">
      {LUGARES.map((n) => (
        <button key={n} type="button" role="radio" aria-checked={valor === n} class={valor === n ? 'ativo' : ''} disabled={n < minimo}
          title={n < minimo ? 'Há mais gente sentada que isso' : descricaoLugares(n)} onClick={() => mudar(n)}>
          {n}<small>{n === 2 ? 'duelo' : 'jogadores'}</small>
        </button>
      ))}
    </div>
  );
}
