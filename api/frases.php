<?php

// Configurações do banco de dados
$hostname = "localhost";
$username = "root";
$password = "";
$database = "frases";

// Conexão com o banco de dados
$mysqli = new mysqli($hostname, $username, $password, $database);

// Verifica se a conexão foi bem sucedida
if ($mysqli->connect_errno) {
    die("Falha na conexão: " . $mysqli->connect_error);
}

// Consulta SQL para recuperar os dados da tabela categorias
$query = "SELECT * FROM frases ";

if(isset($_GET["cat"]) && $_GET["cat"])
    $query .= " WHERE categoria_id=".$_GET["cat"];

if(isset($_GET["id"]) && $_GET["id"])
    $query .= " WHERE id=".$_GET["id"];

$query.= " ORDER BY RAND() LIMIT 1";
$result = $mysqli->query($query);

// Verifica se a consulta foi bem sucedida
if (!$result) {
    die("Falha na consulta: " . $mysqli->error);
}

// Prepara o array para armazenar os resultados
$categorias = array();

// Loop para extrair os dados da tabela
while ($row = $result->fetch_assoc()) {
    $categorias[] = $row;
}

// Libera o resultado e fecha a conexão
$result->close();
$mysqli->close();

// Configura o cabeçalho da resposta HTTP para indicar JSON
header('Content-Type: application/json');

// Retorna os dados em formato JSON
echo json_encode($categorias);
