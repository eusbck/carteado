// Força (bracket do Commander, 1 a 5) e complexidade de cada deck (servidor/catalogo/forca.ts): selos no cartão do
// deck (saguão e tela Decks) e a explicação na prévia e nos detalhes.

import type { ForcaPublica } from '../../../servidor/protocolo.ts';

export const NOME_BRACKET = { 1: 'Exibição', 2: 'Básico', 3: 'Turbinado', 4: 'Otimizado', 5: 'cEDH' } as const;
export const NOME_COMPLEXIDADE = { 1: 'Baixa', 2: 'Média', 3: 'Alta' } as const;

/** o que cada bracket quer dizer, em uma frase (regras oficiais, beta de 2025 com as atualizações até fev/2026) */
export const SENTIDO_BRACKET = {
  1: 'deck temático e casual, sem nada forte',
  2: 'o nível de um precon: sem Game Changers, combos de duas cartas ou destruição de terrenos em massa',
  3: 'mais forte que um precon: até três Game Changers e combos só no fim do jogo',
  4: 'otimizado: sem limites além das cartas banidas',
  5: 'competitivo (cEDH): o mais forte possível, montado para torneio',
} as const;

const dicaBracket = (f: ForcaPublica) =>
  `Bracket ${f.bracket} · ${NOME_BRACKET[f.bracket]}${f.estimado ? ' (estimado)' : ''}: ${SENTIDO_BRACKET[f.bracket]}.\n${f.motivos.map((m) => `• ${m}`).join('\n')}`;
const dicaComplexidade = (f: ForcaPublica) =>
  `Complexidade ${NOME_COMPLEXIDADE[f.complexidade].toLowerCase()}: ${f.motivosComplexidade.join('; ')}.`;

/** os dois selos pequenos do cartão: "B2" e três barrinhas da complexidade */
export function SeloForca({ forca }: { forca?: ForcaPublica }) {
  if (!forca) return null;
  return (
    <>
      <span class={`deck-bracket b${forca.bracket}`} title={dicaBracket(forca)} aria-label={`Bracket ${forca.bracket}, ${NOME_BRACKET[forca.bracket]}`}>
        B{forca.bracket}{forca.estimado ? '?' : ''}
      </span>
      <span class={`deck-complexidade c${forca.complexidade}`} title={dicaComplexidade(forca)} aria-label={`Complexidade ${NOME_COMPLEXIDADE[forca.complexidade]}`}>
        <i /><i /><i />
      </span>
    </>
  );
}

/** a explicação inteira, para a prévia do deck e a janela de detalhes */
export function ForcaDetalhe({ forca }: { forca?: ForcaPublica }) {
  if (!forca) return null;
  return (
    <div class="forca-detalhe">
      <div class="forca-linha">
        <span class={`deck-bracket grande b${forca.bracket}`}>Bracket {forca.bracket} · {NOME_BRACKET[forca.bracket]}{forca.estimado ? ' (estimado)' : ''}</span>
        <span class="forca-texto">
          {SENTIDO_BRACKET[forca.bracket]}.
          {' '}{forca.motivos.map((m, i) => <span key={i} class="forca-motivo">{m}{i < forca.motivos.length - 1 ? '; ' : '.'}</span>)}
        </span>
      </div>
      <div class="forca-linha">
        <span class={`deck-complexidade grande c${forca.complexidade}`}><i /><i /><i /> Complexidade {NOME_COMPLEXIDADE[forca.complexidade].toLowerCase()}</span>
        <span class="forca-texto">{forca.motivosComplexidade.join('; ')}.</span>
      </div>
    </div>
  );
}
