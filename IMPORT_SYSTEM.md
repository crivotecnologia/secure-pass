# Sistema de Importação de Segredos - Documentação

## Visão Geral

O sistema de importação foi completamente refatorado para fornecer um fluxo limpo, organizado e robusto para importar dados de arquivos de backup. O código inline foi extraído para classes modulares que garantem melhor manutenibilidade e tratamento de erros.

## Arquitetura

### 1. ImportValidator
Classe responsável por validações de entrada:
- **isValidFileType(file)**: Valida se o arquivo possui extensão e tipo MIME válidos
- **isValidDataStructure(data)**: Verifica se os dados possuem a estrutura esperada

### 2. SecretImporter  
Classe que processa a importação dos segredos:
- **processSecret(importedSecret, importHash)**: Processa um segredo individual
- **processSecrets(secrets, importHash)**: Processa lista de segredos
- **getSuccessMessage(stats)**: Gera mensagens de sucesso baseadas nas estatísticas

### 3. ImportManager
Classe principal que orquestra todo o processo:
- **processFile(file)**: Método principal que processa o arquivo completo
- **validateFile(file)**: Validações iniciais do arquivo
- **readFile(file)**: Lê o conteúdo do arquivo
- **parseFileContent(content)**: Analisa e valida o JSON
- **decryptAndValidateData(encryptedData, hash)**: Descriptografa e valida os dados

## Funcionalidades

### Validações Implementadas
- ✅ Tipo de arquivo (JSON)
- ✅ Tamanho máximo (10MB)
- ✅ Estrutura dos dados
- ✅ Integridade da criptografia
- ✅ Campos obrigatórios

### Tratamento de Erros
- ✅ Mensagens específicas para cada tipo de erro
- ✅ Logs detalhados no console
- ✅ Recuperação segura em caso de falha
- ✅ Prevenção de processamento concorrente

### Estatísticas de Importação
- **imported**: Novos segredos criados
- **updated**: Segredos existentes atualizados
- **skipped**: Segredos ignorados (versão mais antiga)
- **total**: Total de segredos no arquivo

### Lógica de Atualização
1. **Novo segredo**: Importado automaticamente
2. **Segredo existente mais recente**: Atualiza o existente
3. **Segredo existente mais antigo**: Mantém o atual, ignora importação

## Uso

### Inicialização
```javascript
// Chamado automaticamente no carregamento da página
initializeImportSystem();
```

### Fluxo do Usuário
1. Usuario seleciona arquivo através do input `#import-secret`
2. Sistema valida arquivo automaticamente
3. Processa importação com feedback visual
4. Exibe resultado com estatísticas detalhadas
5. Atualiza interface automaticamente

## Vantagens da Nova Implementação

### 🔧 Manutenibilidade
- Código modular e bem estruturado
- Separação clara de responsabilidades
- Fácil extensão e modificação

### 🛡️ Robustez
- Validações abrangentes
- Tratamento de erros específico
- Prevenção de estados inconsistentes

### 📊 Experiência do Usuário
- Feedback detalhado sobre a importação
- Mensagens de erro claras e actionáveis
- Prevenção de operações concorrentes

### 🚀 Performance
- Processamento otimizado
- Validações eficientes
- Limpeza automática de recursos

## Exemplos de Uso

### Estrutura do Arquivo de Importação
```json
{
  "data": "dados_criptografados_base64",
  "hash": "hash_de_criptografia"
}
```

### Estrutura dos Segredos Descriptografados
```json
[
  {
    "id": "uuid",
    "title": "Título do segredo",
    "tags": "tag1,tag2",
    "link": "https://example.com",
    "secret": "segredo_criptografado",
    "created_at": 1640995200000,
    "updated_at": 1640995200000
  }
]
```

### Mensagens de Retorno
- ✅ "Importação realizada com sucesso! 5 segredo(s) processado(s). (3 novo(s) segredo(s) importado(s), 2 segredo(s) atualizado(s))"
- ❌ "Tipo de arquivo inválido. Selecione um arquivo JSON."
- ❌ "Não foi possível descriptografar os dados. Verifique se o arquivo está correto."

## Compatibilidade

- ✅ Mantém compatibilidade com arquivos existentes
- ✅ Utiliza mesmas funções de criptografia
- ✅ Integração transparente com sistema atual
- ✅ Não quebra funcionalidades existentes

## Considerações de Segurança

- 🔒 Re-criptografia automática com hash atual
- 🔒 Validação de integridade dos dados
- 🔒 Limpeza de arquivos temporários
- 🔒 Prevenção de ataques de arquivo malicioso