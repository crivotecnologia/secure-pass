#!/bin/bash

# Script para atualizar a versão do Secure Pass
# Uso: ./update-version.sh [major|minor|patch] ou ./update-version.sh [versão específica]

VERSION_FILE="version.json"

# Função para extrair a versão atual
get_current_version() {
    if [ -f "$VERSION_FILE" ]; then
        grep -o '"version": "[^"]*"' "$VERSION_FILE" | cut -d '"' -f 4
    else
        echo "1.0.0"
    fi
}

# Função para incrementar versão
increment_version() {
    local version=$1
    local type=$2
    
    IFS='.' read -r -a version_parts <<< "$version"
    local major=${version_parts[0]}
    local minor=${version_parts[1]}
    local patch=${version_parts[2]}
    
    case $type in
        "major")
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        "minor")
            minor=$((minor + 1))
            patch=0
            ;;
        "patch")
            patch=$((patch + 1))
            ;;
    esac
    
    echo "$major.$minor.$patch"
}

# Função para atualizar o arquivo version.json
update_version_file() {
    local new_version=$1
    local build_date=$(date +"%Y.%m.%d")
    
    cat > "$VERSION_FILE" << EOF
{
  "version": "$new_version",
  "name": "Secure Pass",
  "build": "$build_date",
  "environment": "production"
}
EOF
}

# Função principal
main() {
    local current_version=$(get_current_version)
    local new_version
    
    if [ $# -eq 0 ]; then
        echo "Versão atual: $current_version"
        echo "Uso: $0 [major|minor|patch|versão específica]"
        echo ""
        echo "Exemplos:"
        echo "  $0 patch     # 1.0.1 -> 1.0.2"
        echo "  $0 minor     # 1.0.1 -> 1.1.0"
        echo "  $0 major     # 1.0.1 -> 2.0.0"
        echo "  $0 2.1.5     # Define versão específica"
        exit 1
    fi
    
    local input=$1
    
    if [[ $input =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        # Versão específica fornecida
        new_version=$input
    elif [[ $input =~ ^(major|minor|patch)$ ]]; then
        # Incremento de versão
        new_version=$(increment_version "$current_version" "$input")
    else
        echo "Erro: Parâmetro inválido. Use 'major', 'minor', 'patch' ou uma versão específica (ex: 2.1.5)"
        exit 1
    fi
    
    echo "Atualizando versão de $current_version para $new_version"
    update_version_file "$new_version"
    
    echo "✅ Versão atualizada com sucesso!"
    echo "📝 Arquivo $VERSION_FILE atualizado"
    echo "🔄 Lembre-se de fazer commit das alterações"
}

# Executar função principal
main "$@"