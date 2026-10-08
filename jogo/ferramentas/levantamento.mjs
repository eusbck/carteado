// Levantamento das cartas dos 7 decks: agrupa por padrão de habilidade e marca
// as que dependem de mecanismos de regra raros ou de código específico.
// Lê ../cartas (somente leitura) e grava em levantamento/.
// Uso: node ferramentas/levantamento.mjs

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const cartasDir = join(raiz, '..', 'cartas');
const saida = join(raiz, 'levantamento');
mkdirSync(saida, { recursive: true });

const cards = JSON.parse(readFileSync(join(cartasDir, 'data', 'cards.json'), 'utf8'));
const rulings = JSON.parse(readFileSync(join(cartasDir, 'data', 'rulings.json'), 'utf8')).by_oracle_id;

// Decks: id da carta -> lista de decks (abreviados)
const ABREV = { 'Abzan Armor': 'Abz', 'Blight Curse': 'Bli', 'Lorehold Spirit': 'Lor', 'Prismari Artistry': 'Pri', 'Silverquill Influence': 'Sil', 'Terra': 'Ter', 'Witherbloom Pestilence': 'Wit' };
const decksDaCarta = new Map();
const comandantes = new Set();
for (const pasta of readdirSync(join(cartasDir, 'decks'))) {
  const deck = JSON.parse(readFileSync(join(cartasDir, 'decks', pasta, 'deck.json'), 'utf8'));
  for (const e of deck.entries) {
    if (!decksDaCarta.has(e.card_id)) decksDaCarta.set(e.card_id, new Set());
    decksDaCarta.get(e.card_id).add(ABREV[deck.name]);
    if (e.zone === 'commanders') comandantes.add(e.card_id);
  }
}

// ---------------------------------------------------------------------------
// Padrões de habilidade (uma carta pode estar em vários grupos)
// ---------------------------------------------------------------------------
const PADROES = [
  ['mana', 'Habilidade de mana', /(^|\n)[^"\n]*:\s*add\b|\badd (\{|one mana|two mana|three mana|x mana)/],
  ['entra-virado', 'Entra virado (com ou sem condição)', /enters tapped/],
  ['etb', 'Gatilho de entrada no campo', /\bwhen(ever)? [^.]*\benters?\b/],
  ['morte', 'Gatilho de morte ou de sair do campo', /\bdies\b|put into (a|your|its owner's) graveyard from the battlefield|leaves the battlefield/],
  ['ataque', 'Gatilho de ataque ou de dano de combate', /\battacks?\b|attack with|deals combat damage/],
  ['etapa', 'Gatilho de início de etapa ou fase', /at the beginning of/],
  ['conjuracao', 'Gatilho de conjurar ou copiar', /whenever [^.]*\bcasts?\b|magecraft|\bopus\b/],
  ['cemiterio', 'Gatilho de carta saindo do cemitério', /leaves? your graveyard|left your graveyard|leave your graveyard/],
  ['marcadores', 'Marcadores (+1/+1, -1/-1 e outros), proliferar, blight', /counters? (on|from)|proliferate|\bblight\b/],
  ['vida', 'Ganho e perda de vida', /gains? (\d+|x|that much|\w+) life|you gain|gained life|loses? (\d+|x|that much|\w+) life|life total/],
  ['sacrificio', 'Sacrifício', /sacrific/],
  ['ativada', 'Habilidade ativada (não de mana)', null],
  ['estatica', 'Habilidade estática (bônus, custo, proibição)', /\bget \+|\bgets \+|\bhave\b|\bhas\b|costs? (\{\d\}|\{x\}|\d) less|cost \{\d\} less|can't|no maximum hand size/],
  ['substituicao', 'Efeito de substituição ou "ao entrar"', /enters with|\binstead\b|rather than|\bif [^.]* would\b|as (this \w+|~) enters|enters prepared|escapes with/],
  ['copia', 'Cópia de permanente ou de mágica', /\bcop(y|ies)\b|populate|demonstrate|replicate|gravestorm|myriad|encore/],
  ['fichas', 'Cria fichas', /\bcreates?\b|living weapon|populate|encore/],
  ['custos', 'Custo alternativo, adicional, X ou redução', /flashback|escape|delve|kicker|bestow|suspend|encore|unearth|as an additional cost|replicate|\{x\}|without paying|costs? [^.]*less|affinity|strive|compleated|converge/],
  ['faces', 'Faces duplas, preparação, Saga ou Classe', null],
  ['aura-equip', 'Aura ou Equipamento', /enchant |\bequip\b|\baura\b|equipment/],
  ['remocao', 'Remoção (destruir, exilar, dano, -X/-X)', /\bdestroy\b|exile target (creature|permanent|nonland|artifact)|deals? \d+ damage (?!to you)|deals x damage|damage to each|-\d\/-\d|-x\/-x|\d -1\/-1 counters? on target/],
  ['reanimacao', 'Do cemitério para o campo', /graveyards? to the battlefield|from (a|your|all) graveyards? onto the battlefield|return (this card|~) from your graveyard to the battlefield|from your graveyard to the battlefield|from a graveyard onto the battlefield|creature cards? from all graveyards/],
  ['busca', 'Busca no grimório', /search your library|search their library/],
  ['outras-zonas', 'Jogar ou conjurar de outra zona', /you may (play|cast) (that|those|the exiled|it|cards|spells|a spell|any number|a creature|a permanent|an aura|the copy|a land)|play (that|those|the exiled) card|cast (this card|~) from your graveyard|from among cards in your graveyard|may cast it this turn|may play/],
  ['multi', 'Afeta oponentes/jogadores (relevante em multijogador)', /each opponent|each player|target opponent|an opponent|each other player|for each opponent|target player|another player|any number of target players/],
  ['aleatorio', 'Aleatoriedade (embaralhar, ao acaso)', /at random|random order|\bshuffle/],
  ['oculta', 'Informação oculta (olhar, revelar, buscar, virada para baixo)', /look at|face[- ]down|\breveal|search|scry|surveil/],
  ['modal', 'Modal (escolha um ou mais modos)', /choose (one|two|one or more)/],
];

// Linha de habilidade ativada: "custo: efeito" fora de lembretes e fora de habilidades de mana
function temAtivadaNaoMana(texto) {
  return texto.split('\n').some((l) => {
    const s = l.replace(/\([^)]*\)/g, '').trim();
    const i = s.indexOf(':');
    if (i <= 0) return false;
    const custo = s.slice(0, i);
    if (/^(•|i|ii|iii|iv|[a-z ]+ —)/i.test(custo)) return false;
    if (custo.length > 90) return false;
    const efeito = s.slice(i + 1).toLowerCase();
    return !/^\s*add\b/.test(efeito);
  });
}

// ---------------------------------------------------------------------------
// Mecanismos de regra raros: implementados uma vez no motor, usados por poucas cartas.
// Levantados lendo o texto Oracle das 547 cartas; números conferidos no CR de 25/09/2026.
// ---------------------------------------------------------------------------
const MECANISMOS = {
  'Efeitos de cópia de permanente (camada 1) e fichas cópia': ['613.2a', '707', ['Ashling\'s Command', 'Brudiclad, Telchor Engineer', 'Cursed Mirror', 'Determined Iteration', 'Espers to Magicite', 'Gogo, Mysterious Mime', 'Hofri Ghostforge', 'Inspired Skypainter // Maestro\'s Gift', 'Leitmotif Composer', 'Lorehold Archivist // Restore Relic', 'Muddle, the Ever-Changing', 'Replication Technique', 'Rionya, Fire Dancer', 'Rite of Replication', 'Spirit of Resilience', 'Twilight Diviner', 'Twinflame', 'Angel of Indemnity']],
  'Cópia de mágica e conjurar cópia': ['707.10, 707.12', '707', ['Changing Loyalty', 'Creative Technique', 'Ominous Harvest', 'Plumb the Forbidden', 'Renegade Bull', 'Replication Technique', 'Sevinne\'s Reclamation', 'Spinerock Tyrant', 'Surge to Victory', 'Thunderclap Drake', 'Veyran, Voice of Duality']],
  'Preparação (prepare spell)': ['722', '722', ['Dirgur Focusmage // Braingeyser', 'Eccentric Pestfinder // Turn Stones', 'Eiganjo Dynastorian // Replenish', 'Grave Researcher // Reanimate', 'Inspired Skypainter // Maestro\'s Gift', 'Kirol, History Buff // Pack a Punch', 'Lorehold Archivist // Restore Relic', 'Sanar, Unfinished Genius // Wild Idea', 'Stensian Sanguinist // Exsanguinate']],
  'Carta de duas faces que transforma': ['712, 701.27', '712', ['Ashling, Rekindled // Ashling, Rimebound', 'Joshua, Phoenix\'s Dominant // Phoenix, Warden of Fire']],
  'Saga (inclusive Saga criatura)': ['714', '714', ['Summon: Esper Valigarmanda', 'Joshua, Phoenix\'s Dominant // Phoenix, Warden of Fire']],
  'Classe': ['716', '716', ['Advanced Reconstruction']],
  'Virada para baixo / manifestar': ['708, 701.40', '708', ['Reality Shift', 'Abstract Performance']],
  'Fase (phasing)': ['702.26', '702.26', ['Guardian of Faith']],
  'Monarca': ['725', '725', ['Grave Venerations']],
  'Bênção da cidade (ascend)': ['702.131', '702.131', ['Tendershoot Dryad']],
  'Goad e exigências de ataque': ['701.15, 508.1d', '701.15', ['Coercive Impetus', 'Ghoulish Impetus', 'Killian, Decisive Mentor', 'Martial Impetus', 'Parasitic Impetus', 'Redemption Arc', 'Gogo, Mysterious Mime', 'Angel of Indemnity', 'Furygale Flocking']],
  'Custos para atacar e restrições de ataque por jogador': ['508.1g-h', '508', ['Ghostly Prison', 'Eriette of the Charmed Apple', 'Promise of Loyalty', 'Kulrath Knight', 'Weathered Sentinels']],
  'Dano de combate pela resistência / atacar com defensor': ['510.1a', '510', ['Felothar the Steadfast', 'Assault Formation', 'Baldin, Century Herdmaster', 'Walking Bulwark', 'Wakestone Gargoyle', 'Weathered Sentinels']],
  'Fase de combate adicional': ['500.8', '500', ['Aurelia, the Warleader']],
  'Ward com custo que não é mana': ['702.21', '702.21', ['Auntie Ool, Cursewretch']],
  'Murchar (wither) e marcadores -1/-1 em massa': ['702.80, 704.5q', '702.80', ['Everlasting Torment', 'Kulrath Knight', 'Massacre Girl, Known Killer', 'Midnight Banshee', 'Necroskitter', 'Spinerock Tyrant', 'Village Pillagers']],
  'Trocar total de vida': ['701.12', '701.12', ['Tree of Perdition', 'Tree of Redemption']],
  'Mudança de controle': ['613.1b', '613', ['Oft-Nabbed Goat', 'Changing Loyalty', 'Animate Dead', 'Necroskitter', 'The Reaper, King No More', 'Reanimate', 'Grave Researcher // Reanimate', 'Rise of the Dark Realms', 'Aberrant Return', 'Rejoin the Fight', 'Victor, Valgavoth\'s Seneschal']],
  'Mudança de tipo/perda de habilidades (camadas 4, 6, 7b)': ['613.1d, 613.1f, 613.4b', '613', ['Darksteel Mutation', 'Vraska, Betrayal\'s Sting', 'The Warring Triad', 'Restless Spire', 'Angelic Destiny', 'Demonic Embrace', 'Excava, the Risen Past', 'Arcane Lighthouse']],
  'Conjurar sem pagar o custo de mana': ['118.9', '601', ['Abstract Performance', 'Chimil, the Inner Sun', 'Creative Technique', 'Dance with Calamity', 'Herald of Amity', 'Kefka, Dancing Mad', 'Quintorius, Loremaster', 'Renegade Bull', 'Rousing Refrain', 'Surge to Victory']],
  'Jogar ou conjurar do exílio/cemitério (permissões)': ['601.3', '601', ['Advanced Reconstruction', 'Ark of Hunger', 'Banon, the Returners\' Leader', 'Burning Curiosity', 'Conspiracy Theorist', 'Containment Construct', 'Dawnhand Dissident', 'Demonic Embrace', 'Expressive Iteration', 'Kefka, Dancing Mad', 'Laelia, the Blade Reforged', 'Locke, Treasure Hunter', 'Raffine\'s Guidance', 'Serra Paragon', 'Summon: Esper Valigarmanda']],
  'Mana com restrição, mana que não esvazia, gatilho de mana gasta': ['106.6, 106.4', '106', ['Abstract Paintmage', 'Ashling, Rekindled // Ashling, Rimebound', 'Path of Ancestry', 'Study Hall', 'Rousing Refrain', 'Summon: Esper Valigarmanda']],
  'Quantidade/cores de mana gasta': ['601.2h', '601', ['Manaform Hellkite', 'Molten-Core Maestro', 'Painful Truths']],
  'Mana híbrida, mono-híbrida e phyrexiana': ['107.4e-f, 702.150', '107', ['Abstract Paintmage', 'Balefire Liege', 'Creakwood Liege', 'Everlasting Torment', 'Kulrath Knight', 'The Reaper, King No More', 'Vraska, Betrayal\'s Sting', 'Cascade Bluffs', 'Fetid Heath', 'Graven Cairns', 'Rugged Prairie', 'Twilight Mire']],
  'Prevenção de dano': ['615', '615', ['Inkshield', 'Everlasting Torment']],
  'Aleatoriedade além de embaralhar': ['—', '-', ['Advanced Reconstruction', 'Kefka, Dancing Mad']],
  'Histórico de eventos do turno (vida ganha, cartas saídas, 2ª mágica etc.)': ['—', '-', ['Betor, Ancestor\'s Voice', 'Defiling Daemogoth', 'Indulging Patrician', 'Mortality Spear', 'Moseo, Vein\'s New Dean', 'Eccentric Pestfinder // Turn Stones', 'Witch of the Moors', 'Blossoming Bogbeast', 'Gau, Feral Youth', 'Relic Retriever', 'Primary Research', 'Faerie Mastermind', 'Mangara, the Diplomat', 'Monologue Tax', 'Skirsdag High Priest', 'Gorma, the Gullet', 'Lasting Tarfire', 'Ominous Harvest', 'Perforating Artist', 'Rootha, Mastering the Moment', 'Rionya, Fire Dancer', 'Hall of Oracles', 'Sanar, Unfinished Genius // Wild Idea', 'Banon, the Returners\' Leader', 'Weathered Sentinels', 'Victor, Valgavoth\'s Seneschal']],
  'Contagem de conjurações do comandante': ['903.8', '903', ['Thunderclap Drake', 'Vanguard of the Restless', 'Study Hall']],
  'Identidade de cor do comandante em habilidades': ['903.4', '903', ['Arcane Signet', 'Command Tower', 'Commander\'s Sphere', 'Path of Ancestry', 'War Room']],
  'Palavras-chave raras (uma carta ou duas)': ['702', '702', ['Bitterthorn, Nissa\'s Animus', 'Eidolon of Countless Battles', 'Rousing Refrain', 'Angel of Indemnity', 'Priest of Fell Rites', 'Sentinel\'s Eyes', 'Woe Strider', 'Dig Through Time', 'Treasure Cruise', 'Rite of Replication', 'Changing Loyalty', 'Creative Technique', 'Replication Technique', 'Ominous Harvest', 'Mycoloth', 'Ribtruss Roaster', 'Muddle, the Ever-Changing', 'Eldrazi Conscription', 'Sidar Kondo of Jamuraa', 'Nether Traitor', 'Behind the Scenes', 'Ignoble Hierarch', 'Karmic Guide', 'Guardian Scalelord', 'Jadar, Ghoulcaller of Nephalia', 'Twinflame', 'Tomik, Wielder of Law', 'Pearl-Ear, Imperial Advisor', 'Chimil, the Inner Sun', 'Excava, the Risen Past']],
};

// ---------------------------------------------------------------------------
// Casos especiais: cartas que precisam de código específico além da linguagem de
// efeitos e dos mecanismos acima (escolhas fora do padrão, rastreio próprio,
// combinações de vários mecanismos raros).
// ---------------------------------------------------------------------------
const ESPECIAIS = {
  'Abstract Performance': 'pilha virada para baixo no exílio; um oponente escolhe a pilha; conjurar grátis de entre as cartas',
  'Advanced Reconstruction': 'Classe; exílio aleatório do cemitério com permissão de jogar; redução para mágicas conjuradas fora da mão',
  'Animate Dead': 'Aura que troca a própria habilidade "encantar" e devolve a criatura anexada (303.4)',
  'Banon, the Returners\' Leader': 'Pray: conjurar do cemitério só cartas que chegaram lá neste turno sem vir do campo (histórico de zona)',
  'Breena, the Demagogue': 'gatilho para ataques de qualquer jogador comparando vidas dos seus oponentes',
  'Brudiclad, Telchor Engineer': 'todas as outras fichas viram cópia de uma ficha escolhida',
  'Cursed Mirror': 'ao entrar vira cópia de uma criatura até o fim do turno, com exceção (haste)',
  'Dance with Calamity': 'exilar quantas quiser até soma de valor de mana 13; conjurar várias grátis',
  'Dawnhand Dissident': 'conjurar do exílio pagando com remoção de três marcadores de criaturas',
  'Espers to Magicite': 'ficha cópia de carta no exílio, exceto que é artefato e perde outros tipos',
  'Everlasting Torment': 'todo dano como se a fonte tivesse wither; dano não pode ser prevenido; ninguém ganha vida',
  'Gogo, Mysterious Mime': 'vira cópia de outra criatura exceto o nome; as duas devem atacar',
  'Hofri Ghostforge': 'ficha cópia com exceções e habilidade vinculada que devolve a carta exilada',
  'Inkshield': 'prevenção que conta o dano prevenido para criar fichas',
  'Joshua, Phoenix\'s Dominant // Phoenix, Warden of Fire': 'exilar e voltar transformado numa Saga criatura; capítulo III volta com a frente para cima',
  'Kefka, Dancing Mad': 'exílio aleatório dos cemitérios dos oponentes; conjurar mágicas de outros donos grátis; donos perdem vida',
  'Locke, Treasure Hunter': 'cada jogador moe; permissão de conjurar de entre as cartas moídas de todos',
  'Muddle, the Ever-Changing': 'vira cópia até o fim do turno com myriad (fichas atacando outros oponentes)',
  'Oft-Nabbed Goat': 'só oponentes podem ativar; quem ativa ganha o controle',
  'Promise of Loyalty': 'cada jogador escolhe uma criatura; marcador de juramento cria restrição de ataque contínua',
  'Quintorius, Loremaster': 'exílio vinculado; conjurar grátis; substitui ida ao cemitério por fundo do grimório',
  'Rejoin the Fight': 'cada oponente escolhe, em ordem de turno, uma carta ainda não escolhida',
  'Renegade Bull': 'copiar carta no exílio e conjurar a cópia',
  'Rousing Refrain': 'suspender; mana que não esvazia entre etapas; exila a si mesma com marcadores de tempo',
  'Serra Paragon': 'permissão uma vez por turno de jogar terreno ou conjurar do cemitério; concede habilidade ao permanente',
  'Slaughter the Strong': 'cada jogador escolhe criaturas com poder total até 4',
  'Spinerock Tyrant': 'copiar mágica de alvo único; original e cópia ganham wither',
  'Spirit of Resilience': 'vira cópia de uma das cartas que saíram do cemitério',
  'Summon: Esper Valigarmanda': 'Saga criatura; conjurar do exílio vinculado gastando mana como se fosse de qualquer tipo',
  'Surge to Victory': 'a cada dano de combate no turno, copiar a carta exilada e conjurar a cópia',
  'Thunderclap Drake': 'gatilho atrasado na próxima mágica; número de cópias pelas conjurações do comandante',
  'Tragic Arrogance': 'você escolhe, para cada jogador, um permanente de cada tipo a manter',
  'Tree of Perdition': 'trocar total de vida do oponente com a resistência da criatura (701.12)',
  'Tree of Redemption': 'trocar seu total de vida com a resistência da criatura (701.12)',
  'Veyran, Voice of Duality': 'faz habilidades engatilhadas dispararem uma vez a mais',
  'Victor, Valgavoth\'s Seneschal': 'conta quantas vezes a habilidade resolveu no turno; põe criatura de qualquer cemitério sob seu controle',
  'Weathered Sentinels': 'pode atacar jogadores que o atacaram no último turno deles (histórico de ataques)',
};

// ---------------------------------------------------------------------------
const linhas = [];
const contagem = Object.fromEntries(PADROES.map(([id]) => [id, 0]));
const porCamada = { dados: [], generico: [], especial: [] };
const nomesValidos = new Set(Object.values(cards).map((c) => c.name));

for (const erro of [...Object.keys(ESPECIAIS), ...Object.values(MECANISMOS).flatMap((m) => m[2])]) {
  if (!nomesValidos.has(erro)) throw new Error(`Nome não encontrado em cards.json: ${erro}`);
}

for (const c of Object.values(cards)) {
  const decks = [...(decksDaCarta.get(c.id) ?? [])].sort();
  const faces = c.card_faces ?? [c];
  const tipo = faces.map((f) => f.type_line ?? '').join(' // ');
  const nomes = faces.map((f) => f.name);
  let texto = faces.map((f) => f.oracle_text ?? '').join('\n');
  for (const n of nomes) texto = texto.split(n).join('~');
  const curto = nomes[0].split(',')[0];
  texto = texto.split(curto).join('~');
  const t = texto.toLowerCase();

  const basico = /Basic Land/.test(tipo);
  const ficha = c.layout === 'token' || decks.length === 0;
  const grupos = [];
  if (!basico && !ficha) {
    for (const [id, , re] of PADROES) {
      let ok = false;
      if (id === 'ativada') ok = temAtivadaNaoMana(texto);
      else if (id === 'faces') ok = ['transform', 'prepare', 'saga', 'class'].includes(c.layout) || /Saga/.test(tipo);
      else ok = re.test(t);
      if (ok) { grupos.push(id); contagem[id]++; }
    }
  }
  const mecanismos = Object.entries(MECANISMOS).filter(([, m]) => m[2].includes(c.name)).map(([nome]) => nome);

  // Camada de implementação
  const semTexto = !t.replace(/\([^)]*\)/g, '').replace(/\b(flying|first strike|double strike|vigilance|trample|lifelink|deathtouch|reach|haste|menace|indestructible|defender|hexproof)\b/g, '').replace(/[,\s]/g, '');
  let camada;
  if (basico || ficha || semTexto) camada = 'dados';
  else if (ESPECIAIS[c.name]) camada = 'especial';
  else camada = 'generico';
  porCamada[camada].push(c.name);

  // Parte da fase de cartas: A = genéricas sem mecanismo raro nem grupo que dependa
  // de Auras, marcadores, cemitério, outras zonas, cópias, faces ou custos alternativos.
  const GRUPOS_PARTE_B = ['aura-equip', 'copia', 'faces', 'outras-zonas', 'cemiterio', 'marcadores', 'custos', 'reanimacao'];
  let parte = null;
  if (camada === 'generico') parte = mecanismos.length === 0 && !grupos.some((g) => GRUPOS_PARTE_B.includes(g)) ? 'A' : 'B';
  else if (camada === 'especial') parte = 'B';

  linhas.push({
    nome: c.name, layout: c.layout, tipo, custo: c.mana_cost ?? faces.map((f) => f.mana_cost).join(' // '),
    decks, comandante: comandantes.has(c.id), ficha_ou_auxiliar: ficha, basico,
    grupos, mecanismos, camada, parte, motivo_especial: ESPECIAIS[c.name] ?? null,
    rulings: (rulings[c.oracle_id] ?? []).length,
  });
}

linhas.sort((a, b) => a.nome.localeCompare(b.nome));
writeFileSync(join(saida, 'cartas.json'), JSON.stringify(linhas, null, 1) + '\n');

// ---------------------------------------------------------------------------
// Relatório
// ---------------------------------------------------------------------------
const doDeck = linhas.filter((l) => !l.ficha_ou_auxiliar);
const naoBasicas = doDeck.filter((l) => !l.basico);
const terrenos = naoBasicas.filter((l) => /Land/.test(l.tipo) && !/Creature/.test(l.tipo.split('//')[0]));
const totalRulings = doDeck.reduce((s, l) => s + l.rulings, 0);
const comRulings = doDeck.filter((l) => l.rulings > 0).length;
const cont = (arr, k) => arr.filter((l) => l.camada === k).length;

let md = `# Levantamento das cartas

Gerado por \`ferramentas/levantamento.mjs\` a partir de \`../cartas/data/cards.json\`, \`rulings.json\` e \`decks/*/deck.json\`. Não edite à mão; rode o script de novo.

## Totais

| | Cartas |
| --- | ---: |
| Entradas em \`cards.json\` | ${linhas.length} |
| Cartas dos decks (únicas) | ${doDeck.length} |
| — terrenos básicos | ${doDeck.length - naoBasicas.length} |
| — terrenos não básicos | ${terrenos.length} |
| — outras cartas | ${naoBasicas.length - terrenos.length} |
| Fichas e objetos auxiliares (Treasure, Monarch, Copy, Manifest, Poison Counter etc.) | ${linhas.length - doDeck.length} |
| Rulings das cartas dos decks | ${totalRulings} (em ${comRulings} cartas) |

## Camadas de implementação

| Camada | O que é | Cartas dos decks | Fichas/aux. |
| --- | --- | ---: | ---: |
| dados | só características e palavras-chave comuns (básicos, fichas, criaturas sem texto) | ${cont(doDeck, 'dados')} | ${cont(linhas.filter((l) => l.ficha_ou_auxiliar), 'dados')} |
| genérico | cabe na linguagem de efeitos, usando os mecanismos do motor | ${cont(doDeck, 'generico')} | ${cont(linhas.filter((l) => l.ficha_ou_auxiliar), 'generico')} |
| especial | precisa de código específico | ${cont(doDeck, 'especial')} | 0 |

Divisão proposta da fase de cartas: parte A (genéricas sem mecanismo raro nem Auras, marcadores, cemitério, outras zonas, cópias, faces ou custos alternativos) = ${doDeck.filter((l) => l.parte === 'A').length} cartas, ${doDeck.filter((l) => l.parte === 'A' && /Land/.test(l.tipo)).length} delas terrenos; parte B = ${doDeck.filter((l) => l.parte === 'B').length} cartas, incluindo as ${cont(doDeck, 'especial')} especiais.

## Padrões de habilidade (cartas não básicas dos decks; uma carta pode estar em vários)

| Padrão | Cartas |
| --- | ---: |
${PADROES.map(([id, nome]) => `| ${nome} | ${contagem[id]} |`).join('\n')}

## Casos especiais (${porCamada.especial.length})

| Carta | Decks | Por quê |
| --- | --- | --- |
${linhas.filter((l) => l.camada === 'especial').map((l) => `| ${l.nome} | ${l.decks.join(', ')} | ${l.motivo_especial} |`).join('\n')}

## Mecanismos de regra raros e cartas que dependem deles

| Mecanismo | CR | Cartas |
| --- | --- | --- |
${Object.entries(MECANISMOS).map(([nome, [cr, , cs]]) => `| ${nome} | ${cr} | ${cs.length}: ${cs.join('; ')} |`).join('\n')}

## Por deck

| Deck | Únicas | Genérico | Especial | Rulings |
| --- | ---: | ---: | ---: | ---: |
${Object.values(ABREV).map((a) => {
  const ls = doDeck.filter((l) => l.decks.includes(a));
  return `| ${Object.keys(ABREV).find((k) => ABREV[k] === a)} | ${ls.length} | ${cont(ls, 'generico')} | ${cont(ls, 'especial')} | ${ls.reduce((s, l) => s + l.rulings, 0)} |`;
}).join('\n')}
`;
writeFileSync(join(saida, 'LEVANTAMENTO.md'), md);
console.log(`cartas: ${linhas.length}; decks: ${doDeck.length}; dados ${porCamada.dados.length}, genérico ${porCamada.generico.length}, especial ${porCamada.especial.length}`);
console.log(contagem);
