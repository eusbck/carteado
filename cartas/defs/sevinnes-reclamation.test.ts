import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Sevinne's Reclamation", () => {
  it('da mão: devolve uma carta e não copia', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [["Sevinne's Reclamation"], []], graveyard: [['Sol Ring', 'Arcane Signet'], []] });
    tg.choose('valor de mana 3', ['Sol Ring']).cast("Sevinne's Reclamation").resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.find('Arcane Signet')).toBeNull();
  });
  it('por recapitular: pode copiar com novo alvo; a cópia não copia de novo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []], graveyard: [["Sevinne's Reclamation", 'Sol Ring', 'Arcane Signet'], []] });
    tg.choose('valor de mana 3', ['Sol Ring']);
    tg.yes('copiar esta mágica', true).yes('novos alvos', true).choose('valor de mana 3', ['Arcane Signet']);
    tg.cast("Sevinne's Reclamation", 'flashback').resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.find('Arcane Signet')).not.toBeNull();
    expect(tg.names(0, 'exile')).toEqual(["Sevinne's Reclamation"]);
  });
});
