<?php
$servername = "localhost"; // Your server name
$username = "root"; // Your MySQL username
$password = ""; // Your MySQL password
$dbname = "aarmbh"; // Replace with your actual database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "Connected successfully!";
}
?>

<?php
header("Content-Type: application/json"); // Set response as JSON

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "contact"; // Replace with your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

// Collect form data
$name = isset($_POST["name"]) ? strip_tags(trim($_POST["name"])) : "";
$email = isset($_POST["email"]) ? filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL) : "";
$country_code = isset($_POST["country-code"]) ? strip_tags(trim($_POST["country-code"])) : "";
$phone = isset($_POST["phone"]) ? strip_tags(trim($_POST["phone"])) : "";
$subject = isset($_POST["subject"]) ? strip_tags(trim($_POST["subject"])) : "No Subject";
$services = isset($_POST["services"]) ? strip_tags(trim($_POST["services"])) : "Not specified";
$message = isset($_POST["message"]) ? strip_tags(trim($_POST["message"])) : "";
$gdpr = isset($_POST["gdpr"]) ? $_POST["gdpr"] : "d";

// Validate GDPR checkbox
if (!$gdpr) {
    echo json_encode(["status" => "error", "message" => "You must accept the Terms and Conditions."]);
    exit;
}

// Validate message word limit (30 words max)
if (str_word_count($message) > 30) {
    echo json_encode(["status" => "error", "message" => "Message cannot exceed 30 words."]);
    exit;
}



// Insert query using MySQLi prepared statements
$sql = "INSERT INTO contact_form (full_name, email, country_code, phone_number, subject, service, message) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";

// Prepare the statement
$stmt = $conn->prepare($sql);
if ($stmt === false) {
    echo json_encode(["status" => "error", "message" => "Failed to prepare the SQL statement."]);
    exit;
}

// Bind parameters
$stmt->bind_param("sssssss", $name, $email, $country_code, $phone, $subject, $services, $message);

// Execute the statement
if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Message sent successfully!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error: " . $stmt->error]);
}

// Close the statement and connection
$stmt->close();
$conn->close();
?>

