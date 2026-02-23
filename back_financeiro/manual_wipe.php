<?php

$host = '162.240.31.101';
$db   = 'platformxcom_financaline';
$user = 'platformxcom_financaline';
$pass = '@Secur1t1@';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
     echo "Conectado ao banco de dados com sucesso!\n";

     $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');

     $tables = [
         'financial_entries',
         'epi_assignments',
         'epis',
         'employees',
         'clients',
         'expenses'
     ];

     foreach ($tables as $table) {
         try {
             $pdo->exec("TRUNCATE TABLE $table");
             echo "Tabela $table limpa com sucesso!\n";
         } catch (Exception $e) {
             echo "Erro ao limpar tabela $table: " . $e->getMessage() . "\n";
         }
     }

     $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

     echo "Sistema limpo com sucesso!\n";

} catch (\PDOException $e) {
     echo "Erro de conexão: " . $e->getMessage() . "\n";
}
