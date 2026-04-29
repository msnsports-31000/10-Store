<?php
// Put this at the VERY top, inside the PHP tag!
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// 🔒 Fetch the keys from the server's environment variables
$geminiApiKey = getenv('GEMINI_API_KEY');
$openAiApiKey = getenv('OPENAI_API_KEY');

// If the keys are missing, stop immediately
if (!$geminiApiKey || !$openAiApiKey) {
    echo json_encode(["reply" => "Server error: API keys are not configured in the environment."]);
    exit;
}

// Get JSON payload from WinJS app
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['contents'])) {
    echo json_encode(["reply" => "Error: Invalid request sent to server."]);
    exit;
}

$contents = $data['contents'];
$lang = isset($data['lang']) ? $data['lang'] : "EN_GB";

// ==========================================
// 1. Try Gemini First
// ==========================================
$geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" . $geminiApiKey;
$geminiPayload = [
    "contents" => $contents,
    "system_instruction" => [
        "parts" => [["text" => "Respond in the language: " . $lang]]
    ]
];

$ch = curl_init($geminiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($geminiPayload));
$geminiResponseText = curl_exec($ch);
curl_close($ch);

$geminiResponse = json_decode($geminiResponseText, true);

if (isset($geminiResponse['candidates'][0]['content']['parts'][0]['text'])) {
    echo json_encode([
        "reply" => $geminiResponse['candidates'][0]['content']['parts'][0]['text']
    ]);
    exit;
}

// ==========================================
// 2. Fallback to OpenAI ChatGPT
// ==========================================
$openaiMessages = [];
$openaiMessages[] = [
    "role" => "system",
    "content" => "Respond only in this language: " . $lang
];

foreach ($contents as $msg) {
    $gptContent = [];
    $role = ($msg['role'] === "model") ? "assistant" : "user";
    
    foreach ($msg['parts'] as $part) {
        if (isset($part['text'])) {
            $gptContent[] = ["type" => "text", "text" => $part['text']];
        } else if (isset($part['inline_data'])) {
            $gptContent[] = [
                "type" => "image_url",
                "image_url" => ["url" => "data:" . $part['inline_data']['mime_type'] . ";base64," . $part['inline_data']['data']]
            ];
        }
    }
    $openaiMessages[] = ["role" => $role, "content" => $gptContent];
}

$openaiUrl = "https://api.openai.com/v1/chat/completions";
$openaiPayload = [
    "model" => "gpt-4o-mini",
    "messages" => $openaiMessages
];

$ch2 = curl_init($openaiUrl);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $openAiApiKey
]);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($openaiPayload));
$openaiResponseText = curl_exec($ch2);
curl_close($ch2);

$openaiResponse = json_decode($openaiResponseText, true);

if (isset($openaiResponse['choices'][0]['message']['content'])) {
    echo json_encode([
        "reply" => $openaiResponse['choices'][0]['message']['content']
    ]);
    exit;
}

// ==========================================
// 3. Both Failed
// ==========================================
echo json_encode(["reply" => "DraydenYT ran out of free credits 🤣"]);
?>
