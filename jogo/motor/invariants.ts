// Invariantes do estado: usadas nos testes de estresse para pegar estados ilegais.

import type { GameState, ObjId, ZoneName } from './types.ts';

export function checkInvariants(s: GameState): string[] {
  const errs: string[] = [];
  const seen = new Map<ObjId, string>();
  const note = (id: ObjId, where: string, zone: ZoneName, owner?: number) => {
    if (seen.has(id)) errs.push(`objeto ${id} em duas zonas: ${seen.get(id)} e ${where}`);
    seen.set(id, where);
    const o = s.objects[id];
    if (!o) { errs.push(`zona ${where} aponta para objeto inexistente ${id}`); return; }
    if (o.zone !== zone) errs.push(`objeto ${id} (${o.def}) está em ${where} mas diz zona ${o.zone}`);
    if (owner !== undefined && o.owner !== owner) errs.push(`objeto ${id} (${o.def}) na zona de ${owner} pertence a ${o.owner}`);
  };
  s.players.forEach((p, i) => {
    for (const id of s.zones.library[i]) note(id, `library[${i}]`, 'library', i);
    for (const id of s.zones.hand[i]) note(id, `hand[${i}]`, 'hand', i);
    for (const id of s.zones.graveyard[i]) note(id, `graveyard[${i}]`, 'graveyard', i);
    if (!Number.isInteger(p.life)) errs.push(`vida não inteira de ${p.name}`);
    if (p.left && (s.zones.hand[i].length || s.zones.library[i].length)) errs.push(`${p.name} saiu mas ainda tem cartas`);
  });
  for (const z of ['battlefield', 'stack', 'exile', 'command'] as const) for (const id of s.zones[z]) note(id, z, z);
  for (const id of Object.keys(s.objects).map(Number)) if (!seen.has(id)) errs.push(`objeto ${id} (${s.objects[id].def}) fora de qualquer zona`);
  for (const id of s.zones.stack) if (!s.objects[id]?.stack) errs.push(`objeto ${id} na pilha sem informação de pilha`);
  for (const id of s.zones.battlefield) {
    const o = s.objects[id];
    if (!o) continue;
    if (s.players[o.controller]?.left) errs.push(`permanente ${o.def} controlado por jogador que saiu`);
    for (const [k, v] of Object.entries(o.counters)) if (!Number.isInteger(v) || v < 0) errs.push(`marcador inválido ${k}=${v} em ${o.def}`);
    if (o.damage < 0) errs.push(`dano negativo em ${o.def}`);
  }
  if (s.combat) for (const a of s.combat.attackers) if (!a.removed && !s.objects[a.id]) errs.push(`atacante ${a.id} inexistente ainda no combate`);
  const cards = new Set<number>();
  for (const o of Object.values(s.objects)) {
    if (o.card === null || o.isCopy) continue;
    if (cards.has(o.card)) errs.push(`carta física ${o.card} (${o.def}) representada por dois objetos`);
    cards.add(o.card);
  }
  return errs;
}
