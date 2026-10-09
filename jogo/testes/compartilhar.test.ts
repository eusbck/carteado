// Reaproveitamento estrutural da vista no cliente (cliente/src/compartilhar.ts): o que não mudou mantém a referência.

import { describe, expect, it } from 'vitest';
import { compartilhar } from '../cliente/src/compartilhar.ts';

describe('compartilhar', () => {
  it('igual em tudo devolve o objeto antigo', () => {
    const a = { x: 1, l: [{ id: 1, n: 'a' }, { id: 2, n: 'b' }], o: { p: [1, 2] } };
    const b = JSON.parse(JSON.stringify(a));
    expect(compartilhar(a, b)).toBe(a);
  });

  it('só o que mudou é novo; o resto mantém a referência', () => {
    const a = { campo: [{ id: 1, virada: false }, { id: 2, virada: false }], vida: 40 };
    const b = { campo: [{ id: 1, virada: false }, { id: 2, virada: true }], vida: 40 };
    const c = compartilhar(a, b);
    expect(c).not.toBe(a);
    expect(c).toEqual(b);
    expect(c.campo[0]).toBe(a.campo[0]);
    expect(c.campo[1]).not.toBe(a.campo[1]);
  });

  it('listas com id casam pelo id, não pela posição', () => {
    const a = { campo: [{ id: 5, n: 'x' }, { id: 6, n: 'y' }] };
    const b = { campo: [{ id: 9, n: 'nova' }, { id: 5, n: 'x' }, { id: 6, n: 'y' }] };
    const c = compartilhar(a, b);
    expect(c.campo[1]).toBe(a.campo[0]);
    expect(c.campo[2]).toBe(a.campo[1]);
    expect(c.campo[0]).toEqual({ id: 9, n: 'nova' });
  });

  it('chave que aparece ou some conta como mudança', () => {
    const a: Record<string, unknown> = { x: 1 };
    expect(compartilhar(a, { x: 1, y: undefined })).not.toBe(a);
    expect(compartilhar({ x: 1, y: 2 }, { x: 1 })).toEqual({ x: 1 });
  });

  it('troca de tipo devolve o novo', () => {
    expect(compartilhar([1], { 0: 1 })).toEqual({ 0: 1 });
    expect(compartilhar({ a: 1 }, null)).toBe(null);
    expect(compartilhar(null, { a: 1 })).toEqual({ a: 1 });
  });
});
