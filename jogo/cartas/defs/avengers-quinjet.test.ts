import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Avengers Quinjet';
const POR = 'Você pode pôr no campo uma carta de criatura Hero da sua mão';
const DEVOLVER = 'Devolva a carta de criatura Hero alvo do seu cemitério para a sua mão';

describe(N, () => {
  it('ao entrar: põe no campo uma criatura Hero da mão', () => {
    const tg = setup({ battlefield: [Array(5).fill('Plains'), []], hand: [[N, 'Patriot, Shield Wielder', 'Silver Myr'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Hero da mão')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Patriot, Shield Wielder']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.choose('escolha', [POR]).cast(N).resolveAll();
    expect(tg.find('Patriot, Shield Wielder')).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Silver Myr']);
  });

  it('ou devolve uma carta de criatura Hero do cemitério para a mão', () => {
    const tg = setup({ battlefield: [Array(5).fill('Plains'), []], hand: [[N], []], graveyard: [['Patriot, Shield Wielder', 'Silver Myr'], []] });
    tg.choose('carta de criatura Hero alvo no seu cemitério', ['Patriot, Shield Wielder']).choose('escolha', [DEVOLVER]).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Patriot, Shield Wielder']);
  });
});