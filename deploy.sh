#!/bin/bash

# Script de Deploy para VPS - Finanças Aspro
# Execute este comando na pasta raiz do projeto na VPS

echo "🚀 Iniciando Deploy..."

# 1. Atualizar código fonte
git pull origin main

# 2. Configurar Backend (Laravel)
cd back_financeiro
composer install --no-interaction --prefer-dist --optimize-autoloader

# Criar pastas se não existirem
mkdir -p storage/app/public
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/testing
mkdir -p storage/framework/views
mkdir -p storage/logs
mkdir -p bootstrap/cache

# Ajustar permissões
chmod -R 775 storage bootstrap/cache

# Rodar migrações
php artisan migrate --force

# Limpar caches
php artisan config:clear
php artisan route:clear
php artisan view:clear

cd ..

echo "✅ Deploy finalizado com sucesso!"
