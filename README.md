# FormBotJS
[![Demo](https://img.shields.io/badge/Live%20Demo-FormBotJS-blue)](https://formbotjs.tutizo.com/)
[![CodePen](https://img.shields.io/badge/CodePen-Example-lightgrey)](https://codepen.io/LearnWithFiroz/pen/JoGmaEL)
[![License](https://img.shields.io/badge/license-MIT-green)](#)

> A lightweight, no-dependency conversational form builder in pure JavaScript.

FormBotJS turns your ordinary form into a chat-style conversation that feels friendly and engaging.  
Ideal for surveys, lead collection, onboarding, and feedback.

## 🚀 Features
- Conversational interface for form inputs
- Supports text, email, number, date, file, radio, and select
- HTML5 validation built-in
- Easy config: just pass container ID, post URL, and questions
- Auto submission using fetch
- No external libraries required

## 🧠 Example with Bootstrap
- Codepen uses example - https://codepen.io/LearnWithFiroz/pen/JoGmaEL
```html
<!-- // Step 1: Add CDN -->
<link rel="stylesheet" href="https://formbotjs.tutizo.com/src/formbot.min.css">
<script src="https://formbotjs.tutizo.com/src/formbot.min.js"></script>

<!-- // Step 2: Add Container -->
<div id="chat-form-container" class="border rounded p-3 bg-white shadow-sm"></div>

<!-- // Step 3: Initialize -->
<script>
  const questions = [{
      label: "What’s your full name?",
      name: "name",
      type: "text",
      attrs: {
        required: true,
        minlength: 3,
        placeholder: "e.g., Raju",
        pattern: "[A-Za-z\\s]+",
      },
    },
    {
      label: "What’s your email?",
      name: "email",
      type: "email",
      attrs: {
        required: true,
        placeholder: "e.g., raju@xyz.com"
      },
    },
    {
      label: "What’s your birthdate?",
      name: "dob",
      type: "date",
      attrs: {
        required: true
      },
    },
    {
      label: "Select your gender:",
      name: "gender",
      type: "radio",
      options: ["Male", "Female", "Other"],
      attrs: {
        required: true
      },
    },
    {
      label: "Favorite subjects:",
      name: "fav_sub",
      type: "multiselect",
      options: ["Math", "English", "Science"],
      attrs: {
        required: true
      },
    },
    {
      label: "📷 Upload your profile photo (max 2MB):",
      name: "photo",
      type: "file",
      attrs: {
        required: true,
        accept: "image/*",
        "data-maxsize": "2"
      },
    },
  ];
  FormBot.init({
    color1: "#28a745",
    chat_form_title: "Book a Quick Demo Class",
    chat_containerId: "chat-form-container",
    questions,
    extraData: {
      _token: "YOUR_TOKEN",
      // you can pass more data if needed
    },
    post_url: "https://your_endpoint.com/api/submit",
    onComplete: (answers, formData) => {
      console.log("All answers:", answers);
      // you can also handle formData manually if needed
    },
  });
</script>

## License

This project is licensed under the [MIT License](LICENSE).

