<?php

header('Content-Type: application/json');

$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_SPECIAL_CHARS);
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_SPECIAL_CHARS);

if (!$name || !$email || !$message) {
echo json_encode(['status' => 'error', 'message' => 'All fields are required and must be valid.']);
    exit;
}

$submission = [
    'name' => $name,
    'email' => $email,
    'message' => $message,
    'submitted_at' => date('c'),
];

$filename = 'submissions.json';

if (file_exists($filename)) {
    $data = json_decode(file_get_contents($filename), true);
    if (!is_array($data)) {
        $data = [];
    }
} else {
    $data = [];
}

$data[] = $submission;
file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));

echo json_encode(['status' => 'success', 'message' => 'Thank you for submitting the form!']);
?>
