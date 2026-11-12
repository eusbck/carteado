import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Malevolent Rumble', () => {
  it('revela quatro, uma carta de permanente vai para a mão, o resto para o cemitério; cria um Eldrazi Spawn', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [['Malevolent Rumble'], []], library: [["Night's Whisper", 'Sol Ring', 'Forest', 'Island', 'Plains'], []] });
    tg.choose('carta de permanente', ['Sol Ring']).cast('Malevolent Rumble').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Forest', 'Island', 'Malevolent Rumble', "Night's Whisper"].sort());
    expect(tg.names(0, 'library')).toEqual(['Plains']);
    expect(tg.all('Eldrazi Spawn').length).toBe(1);
  });
});
