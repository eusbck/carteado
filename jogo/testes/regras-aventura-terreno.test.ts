// Aventureiro cuja carta normal é terreno (CR 715, 305.9; Ishgard, the Holy See // Faith & Grief): a carta normal não
// se conjura, só se joga; depois de a aventura resolver, o terreno se joga do exílio com a jogada de terreno do turno.
import { describe, expect, it } from 'vitest';
import { facesConjuraveis, facesDeTerreno } from '../motor/formatos.ts';
import { fixture as setup } from './artefatos.ts';

const ISH = 'Ishgard, the Holy See // Faith & Grief';
const VIRTUE = 'Virtue of Persistence // Locthwain Scorn';

describe('Aventura com terreno (CR 715)', () => {
  it('CR 305.9: a face de terreno não se conjura; o aventureiro comum continua com as duas faces', () => {
    expect(facesConjuraveis(ISH, 'hand')).toEqual([1]);
    expect(facesDeTerreno(ISH)).toEqual([0]);
    expect(facesConjuraveis(VIRTUE, 'hand')).toEqual([0, 1]);
    expect(facesDeTerreno(VIRTUE)).toEqual([]);
  });

  it('CR 715.3d, 305.1: do exílio, quem conjurou a aventura joga o terreno, gastando a jogada de terreno', () => {
    const tg = setup({ battlefield: [Array(5).fill('Plains'), []], hand: [[ISH], []] });
    tg.cast(ISH, 'hand@1').resolve();
    const ex = tg.find(ISH, 'exile')!;
    const acao = tg.actionIds().find((a) => a.startsWith(`play:${ex}:`));
    expect(acao).toBe(`play:${ex}:adventure`);
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    expect(tg.find(ISH)).not.toBeNull();
    expect(tg.state.turn.landsPlayed).toBe(1);
  });
});
