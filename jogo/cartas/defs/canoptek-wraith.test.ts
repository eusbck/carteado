import { describe, expect, it } from 'vitest';
import { canBlock } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Canoptek Wraith';

describe(N, () => {
  it('não pode ser bloqueada', () => {
    const tg = setup({ battlefield: [[N], ['Wall of Omens']] });
    expect(canBlock(tg.g, tg.bf('Wall of Omens'), tg.bf(N))).toBe(false);
  });

  it('pagando {3} e sacrificando, busca até dois terrenos básicos com o nome do terreno escolhido, virados', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Island', 'Island', 'Island'], []], library: [['Swamp', 'Island', 'Swamp', 'Swamp', 'Sol Ring'], ['Island']] });
    const original = tg.bf('Swamp');
    tg.script.push((d) => { const i = d.kind === 'select' && d.prompt.includes('escolha um terreno que você controla') ? d.items.find((x) => x.label === 'Swamp') : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('chamadas Swamp')) return null;
      const ativos = d.items.filter((i) => !(i as { disabled?: boolean }).disabled);
      expect(ativos.every((i) => i.label === 'Swamp')).toBe(true);
      return { kind: 'select', ids: ativos.slice(0, 2).map((i) => i.id) };
    });
    tg.yes('Canoptek Wraith', true).attack([[N, 1]]).passTo('main2', 0);
    expect(tg.find(N)).toBeNull();
    const pantanos = tg.all('Swamp');
    expect(pantanos).toHaveLength(3);
    // os dois buscados entram virados (o Swamp original pode ter sido virado para pagar o {3})
    expect(pantanos.filter((id) => id !== original && tg.state.objects[id].tapped)).toHaveLength(2);
  });
});