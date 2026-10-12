import { describe, expect, it } from 'vitest';
import { isLand } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Lessons from Life';

describe(N, () => {
  it('compra três cartas; você pode pôr um terreno da mão no campo virado', () => {
    const tg = setup({ battlefield: [['Forest', 'Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Island']] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Lessons from Life') ? { kind: 'select', ids: [d.items[0].id] } : null));
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Swamp', 'Swamp']);
    const pantano = tg.bf('Swamp');
    expect(isLand(tg.g, pantano)).toBe(true);
    expect(tg.state.objects[pantano].tapped).toBe(true);
    // não é jogar terreno: a jogada de terreno do turno continua disponível
    expect(tg.state.turn.landsPlayed ?? 0).toBe(0);
  });
});