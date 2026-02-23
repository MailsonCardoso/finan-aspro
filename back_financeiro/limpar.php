<?php
// Script de limpeza direta (rodar no servidor)
// Uso: php limpar.php

$host = 'localhost'; // No servidor geralmente é localhost
$db = 'platformxcom_financaline';
$user = 'platformxcom_financaline';
$pass = '@Secur1t1@';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');

    $tables = ['financial_entries', 'epi_assignments', 'epis', 'employees', 'clients', 'expenses'];
    foreach ($tables as $t) {
        $pdo->exec("TRUNCATE TABLE $t");
        echo "Tabela $t limpa.\n";
    }

    $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
    echo "Limpeza concluída com sucesso!\n";
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "\n";
}
