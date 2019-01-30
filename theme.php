<?php
    session_start();

    // Set session for theme
    if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["theme"])) {
        if ($_POST["theme"] === "light") {
            $_SESSION["theme"] = "light";
        }
        else if ($_POST["theme"] === "dark") {
            $_SESSION["theme"] = "dark";
        }
        else {
            echo "Invalid Value.";
        }
    }
?>