import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const terrenos = ['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'];

describe('Creative Technique', () => {
  it('sem copiar, ninguém copia; revela até uma carta não terreno e pode conjurá-la de graça', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [['Creative Technique'], []], library: [['Forest', 'Wall of Omens', 'Island'], []] });
    tg.yes('Demonstrar', false).yes('Conjurar Wall of Omens', true);
    tg.cast('Creative Technique');
    tg.resolveAll();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.state.zones.stack.length).toBe(0);
  });
  it('a cópia do oponente resolve primeiro', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [['Creative Technique'], []], library: [['Forest', 'Island'], ['Wall of Omens', 'Island', 'Island']] });
    tg.yes('Demonstrar', true).choose('oponente para também copiar', ['Bruno']);
    tg.cast('Creative Technique').resolve();
    const pilha = tg.state.zones.stack.map((id) => tg.state.objects[id].stack!.controller);
    expect(pilha).toEqual([0, 0, 1]); // original, cópia de Ana, cópia de Bruno no topo
    tg.yes('Conjurar Wall of Omens', true);
    tg.resolve(); // a cópia de Bruno: ele revela e conjura a Wall
    tg.resolve(); // a Wall de Bruno
    expect(tg.find('Wall of Omens', 'battlefield', 1)).not.toBeNull();
  });
});
