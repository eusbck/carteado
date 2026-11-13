import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Return the Favor';
const M1 = '+ {1} — Copie';
const M2 = '+ {1} — Mude o alvo';
const modo = (prefixo: string) => (d: import('../../motor/types.ts').Decision) =>
  (d.kind === 'select' && d.prompt.includes('modo') ? { kind: 'select' as const, ids: [d.items.find((i) => i.label.startsWith(prefixo))!.id] } : null);

describe(N, () => {
  it('muda o alvo da mágica do oponente para outra criatura', () => {
    const tg = setup({ active: 1, battlefield: [['Mountain', 'Mountain', 'Mountain', 'Llanowar Elves'], ['Mountain', 'Elvish Mystic']], hand: [[N], ['Lightning Bolt']] });
    tg.choose('qualquer alvo', ['Llanowar Elves']).cast('Lightning Bolt').pass();
    tg.script.push(modo(M2));
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Mudar os alvos') ? { kind: 'select', ids: [d.items.find((i) => i.label === 'Elvish Mystic')!.id] } : null));
    tg.choose('um único alvo', ['Lightning Bolt']).cast(N);
    tg.resolveAll();
    expect(tg.find('Llanowar Elves')).not.toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
  });
  it('copia a instantânea do oponente e escolhe outro alvo para a cópia', () => {
    const tg = setup({ active: 1, battlefield: [['Mountain', 'Mountain', 'Mountain', 'Llanowar Elves'], ['Mountain', 'Elvish Mystic']], hand: [[N], ['Lightning Bolt']] });
    tg.choose('qualquer alvo', ['Llanowar Elves']).cast('Lightning Bolt').pass();
    tg.script.push(modo(M1));
    tg.choose('habilidade ativada ou desencadeada, alvo', ['Lightning Bolt']).yes('novos alvos', true).choose('qualquer alvo', ['Elvish Mystic']);
    tg.cast(N);
    tg.resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Llanowar Elves')).toBeNull();
  });
});
