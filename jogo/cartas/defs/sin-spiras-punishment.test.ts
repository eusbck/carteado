import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Sin, Spira's Punishment";

describe(C, () => {
  it('ao entrar, exila e copia permanentes até achar um não terreno', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Forest'), 'Swamp', 'Island', 'Island'], []], hand: [[C], []], graveyard: [['Memnite'], []] });
    tg.cast(C).resolve().resolveAll();
    expect(tg.all('Memnite').length).toBe(1);
    expect(tg.state.objects[tg.bf('Memnite')].tapped).toBe(true);
  });
});
