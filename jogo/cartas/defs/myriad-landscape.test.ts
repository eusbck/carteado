import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';

const NOME = 'Myriad Landscape';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('{2}, {T}, sacrifique: dois terrenos básicos do mesmo tipo, virados', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring'], []], library: [['Forest', 'Island', 'Forest', 'Tundra'], []] });
    let segundas: string[] = [];
    tg.choose('(o primeiro)', ['Forest']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('o segundo terreno básico')) return null;
      segundas = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => !i.disabled)!.id] };
    });
    tg.activate(NOME, 'Procure').resolve();
    // só a outra Forest serve como segunda (a Island não compartilha tipo; Tundra não é básica)
    expect(segundas).toEqual(['Forest']);
    expect(tg.all('Forest').map((id) => tg.state.objects[id].tapped)).toEqual([true, true]);
    expect(tg.names(0, 'library').sort()).toEqual(['Island', 'Tundra']);
  });
  it('pode buscar só um terreno básico', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring'], []], library: [['Forest', 'Forest'], []] });
    tg.choose('(o primeiro)', ['Forest']).choose('o segundo terreno básico', []);
    tg.activate(NOME, 'Procure').resolve();
    expect(tg.all('Forest').length).toBe(1);
    expect(tg.names(0, 'library')).toEqual(['Forest']);
  });
});
