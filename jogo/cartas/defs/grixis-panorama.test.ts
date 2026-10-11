import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Grixis Panorama';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('{1}, {T}, sacrifique: Island, Swamp ou Mountain básica no campo, virada', () => {
    const tg = setup({ battlefield: [[NOME, 'Plains'], []], library: [['Forest', 'Underground Sea', 'Mountain'], []] });
    let habilitadas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Island, Swamp ou Mountain')) return null;
      habilitadas = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Mountain')!.id] };
    });
    tg.activate(NOME, 'Sacrifique').resolve();
    // Underground Sea tem os tipos, mas não é básica
    expect(habilitadas).toEqual(['Mountain']);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(true);
  });
});
