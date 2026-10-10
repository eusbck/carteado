# A proxima abertura usa uma copia fixa do commit validado. A mesa atual precisa estar fechada.
# A primeira abertura copia as partidas da pasta principal; as seguintes copiam o ultimo banco desta versao.
# -Verificar confere a referencia e a validacao sem copiar arquivos, subir servidor ou abrir tunel.
param([string]$JogoAnterior = '', [switch]$Verificar)
$ErrorActionPreference = 'Stop'
$jogoFrente = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositorioFrente = Split-Path -Parent $jogoFrente
$manifestoArquivo = Join-Path $jogoFrente 'entregas\keen-engineering.json'
if (-not (Test-Path -LiteralPath $manifestoArquivo)) { throw 'A entrega ainda nao tem o manifesto de validacao.' }
$manifesto = Get-Content -LiteralPath $manifestoArquivo -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $manifesto.suite.success) { throw 'A suite completa da entrega precisa estar aprovada.' }
if ($manifesto.referencia -notmatch '^versao/[a-z0-9-]+$') { throw 'Referencia de versao invalida.' }
$commitVersao = ([string](& git -C $repositorioFrente rev-parse --verify ($manifesto.referencia + '^{commit}'))).Trim()
if ($LASTEXITCODE -ne 0 -or $commitVersao -notmatch '^[0-9a-f]{40}$') { throw 'Referencia validada nao encontrada.' }
if ($Verificar) { Write-Host "Versao validada: $($manifesto.referencia) ($commitVersao). Base anterior: $($manifesto.base)."; exit 0 }
if (Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue) { throw 'A mesa 8080 ainda esta aberta. Feche a janela da mesa antes de abrir a nova versao.' }
$origemExplicita = [bool]$JogoAnterior
if (-not $JogoAnterior) { $JogoAnterior = Join-Path (Split-Path -Parent $repositorioFrente) 'Magic-Commander\jogo' }
$pastaVersoes = [IO.Path]::GetFullPath((Join-Path $jogoFrente '.cache\versoes'))
$repositorioVersao = [IO.Path]::GetFullPath((Join-Path $pastaVersoes $commitVersao))
if (-not $repositorioVersao.StartsWith($pastaVersoes + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Destino de versao fora da pasta prevista.' }
New-Item -ItemType Directory -Force -Path $pastaVersoes | Out-Null
if (-not (Test-Path -LiteralPath (Join-Path $repositorioVersao '.git'))) {
  & git -C $repositorioFrente worktree add --detach $repositorioVersao $commitVersao | Out-Host
  if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel preparar a copia fixa da versao.' }
}
$jogoVersao = Join-Path $repositorioVersao 'jogo'
# Dependencias e compilacao serao preparadas pelo abrir-mesa.ps1 nesta copia; cache npm tambem proprio.
$env:npm_config_cache = Join-Path $jogoVersao '.cache\npm'
$ponteiroArquivo = Join-Path $jogoFrente '.cache\mesa-validada.json'
$dadosOrigem = Join-Path $JogoAnterior 'dados-locais'
if (-not $origemExplicita -and (Test-Path -LiteralPath $ponteiroArquivo)) {
  $ponteiro = Get-Content -LiteralPath $ponteiroArquivo -Raw -Encoding UTF8 | ConvertFrom-Json
  if (Test-Path -LiteralPath (Join-Path $ponteiro.dados 'jogo.sqlite')) { $dadosOrigem = $ponteiro.dados }
}
$nomeAbertura = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + ([Guid]::NewGuid().ToString('N').Substring(0,8))
$dadosNovos = Join-Path $jogoVersao (Join-Path 'dados-mesa' $nomeAbertura)
New-Item -ItemType Directory -Force -Path $dadosNovos | Out-Null
$bancoOrigem = Join-Path $dadosOrigem 'jogo.sqlite'
if (Test-Path -LiteralPath $bancoOrigem) {
  & node (Join-Path $jogoVersao 'ferramentas\backup-partidas.ts') $bancoOrigem (Join-Path $dadosNovos 'jogo.sqlite')
  if ($LASTEXITCODE -ne 0) { throw 'O backup das partidas falhou; a mesa nova nao sera iniciada.' }
}
$senhaOrigem = Join-Path $dadosOrigem 'senha-acesso.txt'
if (Test-Path -LiteralPath $senhaOrigem) { Copy-Item -LiteralPath $senhaOrigem -Destination (Join-Path $dadosNovos 'senha-acesso.txt') }
$ponteiroJson = @{ referencia = $manifesto.referencia; commit = $commitVersao; dados = $dadosNovos; anterior = $dadosOrigem } | ConvertTo-Json
[IO.File]::WriteAllText($ponteiroArquivo, $ponteiroJson, [Text.UTF8Encoding]::new($false))
$env:DADOS = $dadosNovos
$env:IMAGENS = Join-Path $jogoVersao 'dados-locais\imagens'
$env:ESTATICOS = Join-Path $jogoVersao 'cliente\dist'
Remove-Item Env:SENHA_ACESSO -ErrorAction SilentlyContinue
Write-Host "Abrindo $($manifesto.referencia). A versao anterior e seu banco foram preservados."
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $jogoVersao 'abrir-mesa.ps1') -Porta 8080
exit $LASTEXITCODE
