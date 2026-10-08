import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Raffine's Guidance", () => {
  it('+1/+1; pode ser conjurada do cemitério por {2}{W}', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Wall of Omens'], []], graveyard: [["Raffine's Guidance"], []] });
    tg.choose('criatura', ['Wall of Omens']);
    tg.cast("Raffine's Guidance", 'cemiterio').resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 5]);
  });
});
