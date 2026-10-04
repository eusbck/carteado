import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { temPalavrasChave } from '../../testes/padroes.ts';

describe('Arboreal Grazer', () => {
  it('alcance', () => expect(temPalavrasChave('Arboreal Grazer', 'reach')).toBe(true));
  it('CR 305.4: pôr um terreno não conta como jogar terreno', () => {
    const tg = setup({ battlefield: [['Forest'], []], hand: [['Arboreal Grazer', 'Plains', 'Island'], []] });
    tg.play('Plains');
    tg.choose('pôr um terreno', ['Island']).cast('Arboreal Grazer').resolve().resolve();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    expect(tg.state.turn.landsPlayed).toBe(1);
  });
});
