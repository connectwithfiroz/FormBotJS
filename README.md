# FormBotJS

> A lightweight, no-dependency conversational form builder in pure JavaScript.

FormBotJS turns your ordinary form into a chat-style conversation that feels friendly and engaging.  
Ideal for surveys, lead collection, onboarding, and feedback.

## 🚀 Features
- Conversational interface for form inputs
- Supports text, email, number, date, file, radio, and select
- HTML5 validation built-in
- Easy config: just pass container ID, post URL, and questions
- AJAX-based submission
- No external libraries required

## 🧠 Example

```html
<div id="chat-form"></div>
<script>
ChatForm.init({
  chat_containerId: "chat-form",
  post_url: "/api/form",
  questions: [
    { label: "What's your name?", type: "text" },
    { label: "What's your email?", type: "email" },
  ],
});
</script>
