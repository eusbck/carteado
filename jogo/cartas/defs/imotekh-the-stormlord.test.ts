import { describe, expect, it } from 'vitest';
import { moveObjects } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Imotekh the Stormlord';

describe(N, () => {
  it('cartas de artefato saindo juntas do seu cemitério criam só dois Necron Warriors', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Silver Myr', 'Sol Ring', 'Elvish Mystic'], []] });
    runEffect(tg, moveObjects(tg.g, [{ id: tg.find('Elvish Mystic', 'graveyard')!, to: 'hand' }], 'effect'));
    tg.resolveAll();
    expect(tg.all('Necron Warrior')).toHaveLength(0);
    runEffect(tg, moveObjects(tg.g, [{ id: tg.find('Silver Myr', 'graveyard')!, to: 'hand' }, { id: tg.find('Sol Ring', 'graveyard')!, to: 'hand' }], 'effect'));
    tg.resolveAll();
    expect(tg.all('Necron Warrior')).toHaveLength(2);
  });

  it('no início do seu combate, outra criatura artefato sua recebe +2/+2 e ameaçar até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Elvish Mystic'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('outra criatura artefato alvo')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Silver Myr']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.passTo('declareAttackers', 0);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'menace')).toBe(true);
  });
});