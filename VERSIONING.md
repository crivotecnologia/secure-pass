# Sistema de Versionamento - Secure Pass

## Visão Geral

O Secure Pass utiliza um sistema de versionamento centralizado que permite gerenciar a versão da aplicação de forma consistente em todos os arquivos.

## Arquivos Envolvidos

### `version.json`
Arquivo central que contém todas as informações de versão:
```json
{
  "version": "1.0.1",
  "name": "Secure Pass", 
  "build": "2024.09.28",
  "environment": "production"
}
```

### `scripts/variables.js`
Carrega dinamicamente as informações do `version.json` e as disponibiliza para a aplicação.

### `index.html`
Exibe a versão na interface do usuário através do Vue.js.

### `manifest.json`
Contém a versão para PWA (Progressive Web App).

## Como Atualizar a Versão

### Método 1: Script Automatizado (Recomendado)

```bash
# Incrementar patch (1.0.1 -> 1.0.2)
./update-version.sh patch

# Incrementar minor (1.0.1 -> 1.1.0) 
./update-version.sh minor

# Incrementar major (1.0.1 -> 2.0.0)
./update-version.sh major

# Definir versão específica
./update-version.sh 2.1.5
```

### Método 2: Manual

1. Edite o arquivo `version.json`
2. Atualize a versão no `manifest.json` (se necessário)
3. O build será atualizado automaticamente

## Onde a Versão Aparece

1. **Interface do Usuário**: No modal de configurações
2. **Console do Desenvolvedor**: Informações de debug
3. **PWA**: Manifest da aplicação web progressiva

## Vantagens do Sistema

✅ **Centralizado**: Uma única fonte da verdade para a versão
✅ **Automático**: Script para incrementar versões facilmente  
✅ **Flexível**: Suporta versionamento semântico
✅ **Informativo**: Inclui data de build e ambiente
✅ **Resiliente**: Fallback para versão padrão se o JSON falhar

## Versionamento Semântico

O projeto segue o padrão [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Mudanças incompatíveis na API
- **MINOR** (1.X.0): Nova funcionalidade compatível
- **PATCH** (1.0.X): Correções de bugs compatíveis

## Deploy e Produção

Antes de fazer deploy:

1. Execute `./update-version.sh [tipo]` para atualizar a versão
2. Commit as mudanças no git
3. Faça o deploy normalmente

A data de build será atualizada automaticamente a cada release.