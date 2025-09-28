// Carrega as informações de versão
let appVersion = { version: "1.0.1", name: "Secure Pass", build: "2024.09.28" };

// Tenta carregar as informações de versão do arquivo JSON
fetch('./version.json')
  .then(response => response.json())
  .then(data => {
    appVersion = data;
  })
  .catch(error => {
    console.warn('Não foi possível carregar version.json, usando versão padrão');
  });

const variables = {
  product: {
    name: "Secure Pass",
    get version() { return appVersion.version; },
    get build() { return appVersion.build; },
    get environment() { return appVersion.environment || 'development'; }
  },

  hash_lenght: 128,
  auto_secret_lenght: 32,
  limit_view_secret_sec: 5,
};
