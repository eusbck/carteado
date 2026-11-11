import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Splendid Reclamation";

describe(C, () => {
  it('devolve todos os terrenos do cemitério virados', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Forest')], []], hand: [[C], []], graveyard: [['Island', 'Swamp'], []] });
    tg.cast(C).resolve();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    expect(tg.find('Swamp')).not.toBeNull();
  });
});
