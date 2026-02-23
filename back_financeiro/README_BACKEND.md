# CapitalPro Backend - Laravel 11

Este é o backend gerado para suportar todas as funcionalidades do frontend CapitalPro.

## 🚀 Como instalar no Servidor VPS

1.  **Upload**: Envie a pasta `back_financeiro` para o seu servidor.
2.  **Dependências**: Dentro da pasta, execute:
    ```bash
    composer install
    ```
3.  **Chave da Aplicação**:
    ```bash
    php artisan key:generate
    ```
4.  **Banco de Dados**: Execute as migrações (o banco remoto já está configurado no `.env`):
    ```bash
    php artisan migrate
    ```
5.  **Usuário Inicial**: Crie o administrador padrão:
    ```bash
    php artisan db:seed
    ```

## 🔐 Credenciais Criadas
- **Email**: `administrador@financeiro.com.br`
- **Senha**: `@Secur1t1@`

## 🛠 Entidades Mapeadas
- **Financeiro**: Contas a Receber, Contas a Pagar, Dashboard Stats.
- **RH**: Gestão de Funcionários.
- **Segurança**: Gestão de EPIs e entregas.
