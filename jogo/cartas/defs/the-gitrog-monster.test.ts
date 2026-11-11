import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "The Gitrog Monster";

describe(C, () => {
  it('compra quando terreno vai para o cemitério; terreno adicional', () => {
    const tg = setup({ battlefield: [[C, 'Zuran Orb', 'Forest'], []], library: [['Opt'], []] });
    tg.activate('Zuran Orb').resolveAll();
    expect(tg.names(0, 'hand')).toContain('Opt');
  });
});
