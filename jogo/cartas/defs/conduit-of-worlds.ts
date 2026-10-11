// Conduit of Worlds
// You may play lands from your graveyard.
// {T}: Choose target nonland permanent card in your graveyard. If you haven't cast a spell this turn, you may cast that
// card. If you do, you can't cast additional spells this turn. Activate only as a sorcery.
import { activated, defineAbility, defineCard, isLand, isPermanentCard, mayCastDuringResolution, nameOf, ruleEffect, staticAbility, t, tgt } from '../../motor/api.ts';
import type { SCtx, StaticDef } from '../../motor/defs.ts';
import type { PlayerId } from '../../motor/types.ts';

// "você não pode conjurar outras mágicas neste turno"
const SEM_MAIS_MAGICAS = defineAbility<StaticDef>('Conduit of Worlds:semMagicas', {
  kind: 'static',
  rules: { cantCastSpells: (c, p) => (c as SCtx & { params?: { player: PlayerId } }).params?.player === p },
});

export default defineCard({
  name: 'Conduit of Worlds',
  faces: [{
    abilities: [
      // ruling 1: não muda quando nem quantos terrenos você joga
      staticAbility({
        rules: { mayPlayFrom: (c, p, carta) => (p === c.you && c.g.state.objects[carta]?.zone === 'graveyard' && c.g.state.objects[carta].owner === p && isLand(c.g, carta) ? { key: `conduit:${c.source}`, label: 'Conduit of Worlds', land: true } : null) },
        text: 'Você pode jogar terrenos do seu cemitério.',
      }),
      activated('{T}', function* (c) {
        const carta = tgt(c);
        if (carta === null || c.g.state.objects[carta]?.zone !== 'graveyard') return;
        // ruling 3: conta as mágicas conjuradas antes de o Conduit entrar, anuladas ou não, e ele mesmo
        if (c.g.state.turnStats[c.you].spellsCast > 0) return;
        // ruling 2: só agora, durante a resolução, pagando os custos
        const conjurou = yield* mayCastDuringResolution(c.g, c.you, carta, { prompt: `Conduit of Worlds: conjurar ${nameOf(c.g, carta)} do seu cemitério? (você não poderá conjurar outras mágicas neste turno)` });
        if (conjurou) ruleEffect(c, SEM_MAIS_MAGICAS.id!, { kind: 'endOfTurn' }, { params: { player: c.you } });
      }, {
        timing: 'sorcery',
        targets: [t.card('graveyard', (c, id) => isPermanentCard(c.g, id) && !isLand(c.g, id), 'carta de permanente alvo, que não é terreno, do seu cemitério', 'you')],
        text: '{T}: Escolha a carta de permanente alvo, que não é terreno, do seu cemitério. Se você não conjurou uma mágica neste turno, você pode conjurar essa carta. Se fizer isso, você não pode conjurar outras mágicas neste turno. Ative somente como feitiço.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: você joga um terreno do seu cemitério, como a jogada de terreno do turno',
    2: 'teste: sem ter conjurado mágica no turno, você conjura a carta do cemitério e não conjura mais nada no turno',
    3: 'teste: tendo conjurado uma mágica no turno, a habilidade não deixa conjurar a carta',
  },
});