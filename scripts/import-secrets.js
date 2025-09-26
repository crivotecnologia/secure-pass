/**
 * Módulo para importação de segredos
 * Contém funções organizadas para importar dados de arquivos de backup
 */

/**
 * Configuração e validação do arquivo de importação
 */
class ImportValidator {
  /**
   * Valida se o arquivo possui extensão válida
   * @param {File} file - Arquivo selecionado
   * @returns {boolean}
   */
  static isValidFileType(file) {
    if (!file) return false;
    
    const allowedTypes = [
      'application/json',
      'text/json',
      'text/plain'
    ];
    
    return allowedTypes.includes(file.type) || file.name.endsWith('.json');
  }

  /**
   * Valida a estrutura dos dados importados
   * @param {Array} data - Dados para validação
   * @returns {boolean}
   */
  static isValidDataStructure(data) {
    if (!Array.isArray(data)) return false;
    
    // Verifica se todos os itens têm a estrutura esperada
    return data.every(item => 
      item &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.secret === 'string' &&
      typeof item.created_at === 'number' &&
      typeof item.updated_at === 'number'
    );
  }
}

/**
 * Processador de importação de segredos
 */
class SecretImporter {
  constructor() {
    this.imported = 0;
    this.updated = 0;
    this.skipped = 0;
  }

  /**
   * Processa um segredo individual
   * @param {Object} importedSecret - Segredo importado
   * @param {string} importHash - Hash de criptografia do arquivo
   * @returns {Object} Resultado do processamento
   */
  processSecret(importedSecret, importHash) {
    try {
      const existingSecret = storageSecrets.find(s => s.id === importedSecret.id);
      
      // Descriptografa com hash do arquivo e re-criptografa com hash atual
      const decryptedSecret = decrypted(importedSecret.secret, importHash);
      const reEncryptedSecret = encrypted(decryptedSecret);
      
      const secretData = {
        ...importedSecret,
        secret: reEncryptedSecret
      };

      if (!existingSecret) {
        // Novo segredo
        stSecretSave(secretData, true);
        this.imported++;
        return { action: 'created', secret: secretData };
      }
      
      if (existingSecret.updated_at < importedSecret.updated_at) {
        // Atualizar segredo existente
        stSecretUpdate(existingSecret.id, secretData, true);
        this.updated++;
        return { action: 'updated', secret: secretData };
      }
      
      // Segredo ignorado (mais antigo)
      this.skipped++;
      return { action: 'skipped', secret: existingSecret };
      
    } catch (error) {
      console.error('Erro ao processar segredo:', importedSecret, error);
      throw new Error(`Erro ao processar segredo "${importedSecret.title}": ${error.message}`);
    }
  }

  /**
   * Processa lista de segredos importados
   * @param {Array} secrets - Lista de segredos
   * @param {string} importHash - Hash de criptografia
   * @returns {Object} Estatísticas da importação
   */
  processSecrets(secrets, importHash) {
    this.reset();
    const results = [];

    for (const secret of secrets) {
      const result = this.processSecret(secret, importHash);
      results.push(result);
    }

    return {
      total: secrets.length,
      imported: this.imported,
      updated: this.updated,
      skipped: this.skipped,
      results
    };
  }

  /**
   * Reseta contadores
   */
  reset() {
    this.imported = 0;
    this.updated = 0;
    this.skipped = 0;
  }

  /**
   * Gera mensagem de sucesso baseada nas estatísticas
   * @param {Object} stats - Estatísticas da importação
   * @returns {string}
   */
  static getSuccessMessage(stats) {
    const messages = [];
    
    if (stats.imported > 0) {
      messages.push(`${stats.imported} novo(s) segredo(s) importado(s)`);
    }
    
    if (stats.updated > 0) {
      messages.push(`${stats.updated} segredo(s) atualizado(s)`);
    }
    
    if (stats.skipped > 0) {
      messages.push(`${stats.skipped} segredo(s) ignorado(s)`);
    }
    
    const totalProcessed = stats.imported + stats.updated;
    if (totalProcessed === 0) {
      return '<b>Importação concluída!</b><br />Nenhum segredo novo para processar.';
    }

    return `<b>Importação realizada com sucesso!</b><br />${messages.join('<br />')}`;
  }
}

/**
 * Classe principal para gerenciar importação de segredos
 */
class ImportManager {
  constructor() {
    this.importer = new SecretImporter();
    this.isProcessing = false;
  }

  /**
   * Processa arquivo de importação
   * @param {File} file - Arquivo selecionado
   * @returns {Promise<Object>} Resultado da importação
   */
  async processFile(file) {
    if (this.isProcessing) {
      throw new Error('Importação já está em andamento');
    }

    this.isProcessing = true;

    try {
      // Validações iniciais
      this.validateFile(file);
      
      // Lê conteúdo do arquivo
      const fileContent = await this.readFile(file);
      
      // Valida e extrai dados
      const { data, hash } = this.parseFileContent(fileContent);
      
      // Descriptografa e valida estrutura
      const secrets = this.decryptAndValidateData(data, hash);
      
      // Processa importação
      const stats = this.importer.processSecrets(secrets, hash);
      
      return {
        success: true,
        stats,
        message: SecretImporter.getSuccessMessage(stats)
      };
      
    } catch (error) {
      console.error('Erro na importação:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado durante a importação'
      };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Valida o arquivo selecionado
   * @param {File} file - Arquivo para validação
   */
  validateFile(file) {
    if (!file) {
      throw new Error('Nenhum arquivo selecionado');
    }

    if (!ImportValidator.isValidFileType(file)) {
      throw new Error('Tipo de arquivo inválido. Selecione um arquivo JSON.');
    }

    if (file.size === 0) {
      throw new Error('Arquivo vazio selecionado');
    }

    // Limite de 10MB para segurança
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Arquivo muito grande. Limite máximo: 10MB');
    }
  }

  /**
   * Lê conteúdo do arquivo
   * @param {File} file - Arquivo para leitura
   * @returns {Promise<string>}
   */
  async readFile(file) {
    try {
      return await getFileReader(file);
    } catch (error) {
      throw new Error(`Erro ao ler arquivo: ${error.message}`);
    }
  }

  /**
   * Analisa conteúdo do arquivo JSON
   * @param {string} content - Conteúdo do arquivo
   * @returns {Object}
   */
  parseFileContent(content) {
    try {
      const parsed = JSON.parse(content);
      
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Formato de arquivo inválido');
      }

      if (!parsed.data || !parsed.hash) {
        throw new Error('Estrutura do arquivo de backup inválida. Propriedades "data" e "hash" são obrigatórias.');
      }

      return parsed;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Arquivo JSON inválido ou corrompido');
      }
      throw error;
    }
  }

  /**
   * Descriptografa e valida dados
   * @param {string} encryptedData - Dados criptografados
   * @param {string} hash - Hash de criptografia
   * @returns {Array}
   */
  decryptAndValidateData(encryptedData, hash) {
    try {
      const decryptedData = decrypted(encryptedData, hash);
      const secrets = JSON.parse(decryptedData);

      if (!ImportValidator.isValidDataStructure(secrets)) {
        throw new Error('Estrutura dos dados inválida. Verifique se o arquivo contém segredos válidos.');
      }

      return secrets;
    } catch (error) {
      if (error.message.includes('Malformed UTF-8 data') || 
          error.message.includes('decrypt')) {
        throw new Error('Não foi possível descriptografar os dados. Verifique se o arquivo está correto.');
      }
      
      if (error instanceof SyntaxError) {
        throw new Error('Dados descriptografados inválidos');
      }
      
      throw error;
    }
  }
}

/**
 * Inicializa o sistema de importação
 */
function initializeImportSystem() {
  const importManager = new ImportManager();
  const importInput = document.querySelector('#import-secret');
  
  if (!importInput) {
    console.warn('Elemento de importação não encontrado');
    return;
  }

  importInput.addEventListener('change', async function(event) {
    const file = event.target.files[0];
    
    if (!file) return;

    try {
      // Processa arquivo
      const result = await importManager.processFile(file);
      
      if (result.success) {
        // Sucesso - notificação permanece até usuário fechar manualmente
        notyf.success({
          message: result.message,
          duration: 0, // Não fecha automaticamente
          dismissible: true // Permite fechar clicando no X
        });
        
        // Fecha modal de configuração se estiver aberto
        if (typeof bsMdlConfig !== 'undefined' && bsMdlConfig.hide) {
          bsMdlConfig.hide();
        }
        
        // Atualiza lista de segredos se função existir
        if (typeof v !== 'undefined' && v.search_secret) {
          v.search_secret();
        }
      } else {
        // Erro
        notyf.error(result.error);
      }
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      notyf.error('Erro inesperado durante a importação');
    } finally {
      // Limpa input para permitir reimportação do mesmo arquivo
      event.target.value = '';
    }
  });
}

// Exporta classes e funções para uso global
if (typeof window !== 'undefined') {
  window.ImportValidator = ImportValidator;
  window.SecretImporter = SecretImporter;
  window.ImportManager = ImportManager;
  window.initializeImportSystem = initializeImportSystem;
}
