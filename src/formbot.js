/*!
 * FormBotJS v1.0.0
 * (c) 2025 Firoz Ansari — All rights reserved
 * License: https://formbot.tutizo.com/formbot/license
 */
console.log("%cFormBotJS by Firoz Ansari", "color:#0078ff;font-weight:bold;");
const FormBot = {
  config: {},
  current: 0,
  answers: [],
  initHTML: `
    <div id="chat-container" class="chat-box light-theme">
    <div class="chat-header">
        <h6 id="chat_formTitle">Chat Assistant</h6>
        <div class="chat-actions">
            <button id="restart-btn">Restart</button>
            <button id="theme-toggle-btn">🌙</button>
        </div>
    </div>

    <div id="chat-messages" class="chat-messages"></div>

    <form id="chatInputSubmitForm" novalidate>
        <div id="chat-input-area">
            <div id="chat-input-wrapper"></div>
            <button id="send-btn" type="submit">Send</button>
        </div>
    </form>
</div>
`,

  init(config) {
    this.config = config;
    if (!config.chat_containerId)
      return alert("⚠️ chat_containerId required in config");
    document.getElementById(config.chat_containerId).innerHTML = this.initHTML;
    document
      .getElementById("theme-toggle-btn")
      .addEventListener("click", function () {
        const container = document.getElementById("chat-container");
        container.classList.toggle("dark-theme");
        container.classList.toggle("light-theme");

        // Change icon
        this.textContent = container.classList.contains("dark-theme")
          ? "☀️"
          : "🌙";
      });

    document.getElementById("restart-btn").addEventListener("click", (e) => {
      this.answers = []; //empty
      document.getElementById("chat-messages").innerHTML = "";
      this.current = 0;
      this.showBotMessage();
    });
    this.aut = "Rmlyb3ogQW5zYXJpICgrOTEgODc4OTcwMTkxNik=";

    this.current = 0;
    this.answers = [];
    this.messagesEl = document.getElementById("chat-messages");
    this.chatInputWrapper = document.getElementById("chat-input-wrapper");
    this.formEl = document.getElementById("chatInputSubmitForm");
    this.sendBtn = document.getElementById("send-btn");
    this.chat_form_title = document.querySelector(
      "#chat-container #chat_formTitle"
    );

    this.formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSend();
    });

    this.showBotMessage();
    //if color
    if (config.color1) this.setChatColor(config.color1);

    this.chat_form_title.innerHTML = config.chat_form_title ?? "Chat assistant";
  },
  setChatColor(color1) {
    document.documentElement.style.setProperty("--chat_color1", color1);
  },

  escapeHTML(str) {
    return str.replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[m])
    );
  },
  showImagePreview(url, name) {
    // Create popup dynamically if not exists
    if (!document.getElementById("imagePopup")) {
      const popup = document.createElement("div");
      popup.id = "imagePopup";
      popup.className = "image-popup";
      popup.innerHTML = `
      <img id="popupImage" src="" alt="">
      <span class="close-btn">×</span>
    `;
      document.body.appendChild(popup);
      popup
        .querySelector(".close-btn")
        .addEventListener("click", () => this.closeImagePopup());
      popup.addEventListener("click", (e) => {
        if (e.target === popup) this.closeImagePopup();
      });
    }

    const popup = document.getElementById("imagePopup");
    const img = popup.querySelector("#popupImage");
    img.src = url;
    img.alt = name;
    popup.style.display = "flex";
  },

  closeImagePopup() {
    const popup = document.getElementById("imagePopup");
    if (popup) popup.style.display = "none";
  },

  showMessage(text, sender = "bot") {
    const msg = document.createElement("div");
    msg.className = `chat-bubble ${sender}`;
    msg.innerHTML = text;
    this.messagesEl.appendChild(msg);
    this.scrollToBottom();
  },

  showUserMessage(text) {
    this.showMessage(text, "user");
  },

  scrollToBottom() {
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  },

  showBotMessage() {
    var q = this.config.questions[this.current];
    while (q && q.type == "hidden") {
      //push into answer
      this.answers.push({
        label: q.label,
        name: q.name || `q${this.current}`,
        value: q.attrs.value ?? "",
      });
      this.current++;
      q = this.config.questions[this.current];
    }
    //If no question, finish
    if (!q) return this.finish();

    this.showMessage(q.label);

    let inputEl;
    const wrapper = this.chatInputWrapper;
    wrapper.innerHTML = ""; // clear previous input

    // create based on type
    if (["text", "email", "number", "date", "file"].includes(q.type)) {
      inputEl = document.createElement("input");
      inputEl.type = q.type;
    } else if (q.type === "textarea") {
      inputEl = document.createElement("textarea");
    } else if (q.type === "radio" && q.options) {
      inputEl = document.createElement("div");
      q.options.forEach((opt) => {
        const label = document.createElement("label");
        label.innerHTML = `<input type='radio' name='radio-${this.current}' value='${opt}'> ${opt}`;
        inputEl.appendChild(label);
      });
    } else if (q.type === "select" && q.options) {
      inputEl = document.createElement("select");
      q.options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        inputEl.appendChild(option);
      });
    } else if (q.type === "multiselect" && q.options) {
      inputEl = document.createElement("select");
      inputEl.multiple = true;
      q.options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        inputEl.appendChild(option);
      });
    } else {
      inputEl = document.createElement("input");
      inputEl.type = "text";
    }

    // apply HTML attributes (min, max, required, etc.)
    if (q.attrs) {
      for (const [attr, val] of Object.entries(q.attrs)) {
        inputEl.setAttribute(attr, val);
      }
    }

    inputEl.id = "chat-input";
    wrapper.appendChild(inputEl);
    inputEl.focus();
    this.inputEl = inputEl;
  },

  handleSend() {
    const q = this.config.questions[this.current];
    if (!q) return;

    let answer = "";
    let fileData = null;

    if (q.type === "radio") {
      const checked = document.querySelector(
        `input[name='radio-${this.current}']:checked`
      );
      if (!checked) return alert("Please select an option.");
      answer = checked.value;
    } else if (q.type === "file") {
      const file = this.inputEl.files[0];
      if (!file) return alert("Please select a file.");

      // Check max size
      if (q.attrs && q.attrs["data-maxsize"]) {
        const maxMB = parseFloat(q.attrs["data-maxsize"]);
        if (file.size > maxMB * 1024 * 1024)
          return alert(`File must be smaller than ${maxMB} MB.`);
      }

      const fileURL = URL.createObjectURL(file);
      let msg = document.createElement("div");
      msg.className = "chat-bubble user";

      // Handle image vs other file types
      if (file.type.startsWith("image/")) {
        const link = document.createElement("a");
        link.href = "#";
        link.textContent = `📷 ${file.name}`;
        link.className = "file-link";
        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.showImagePreview(fileURL, file.name);
        });
        msg.appendChild(link);
      } else {
        const link = document.createElement("a");
        link.href = fileURL;
        link.target = "_blank";
        link.textContent = `📎 ${file.name}`;
        link.className = "file-link";
        msg.appendChild(link);
      }

      answer = msg;
      //   this.scrollToBottom();

      //   this.fileData = file;
      //   this.answers.push({ label: q.label, answer: file.name });

      //   if (this.current < this.config.questions.length) {
      //     setTimeout(() => this.showBotMessage(), 400);
      //   } else {
      //     this.finish();
      //   }
    } else if (q.type === "multiselect") {
      const selected = Array.from(this.inputEl.selectedOptions).map(
        (o) => o.value
      );
      if (selected.length === 0)
        return alert("Please select at least one option.");
      answer = selected.join(", ");
    } else {
      answer = this.inputEl.value.trim();
      if (!this.inputEl.checkValidity()) {
        this.inputEl.reportValidity();
        return;
      }
    }
    if (q.type != "file") {
      answer = this.escapeHTML(answer);
      this.showUserMessage(answer);
    } else {
      this.messagesEl.appendChild(answer);
      this.scrollToBottom();
    }
    this.answers.push({
      label: q.label,
      name: q.name || `q${this.current}`,
      value: answer,
      file: fileData,
    });
    this.current++;
    setTimeout(() => this.showBotMessage(), 200);
  },

  async finish() {
    this.showMessage("Sending your responses...");
    //show loader in send-btn
    let old_send_btn = this.sendBtn.innerHTML;
    this.sendBtn.innerHTML = "⏳ Sending...";
    this.sendBtn.disabled = true;

    const formData = new FormData();
    this.answers.forEach((a) => {
      if (a.file) formData.append(a.name, a.file);
      else formData.append(a.name, a.value);
    });

    // Allow developer to inject extra keys before submission
    if (this.config.extraData && typeof this.config.extraData === "object") {
      for (const key in this.config.extraData) {
        formData.append(key, this.config.extraData[key]);
      }
    }

    if (this.config.mode === "submit") {
      try {
        const res = await fetch(this.config.post_url, {
          method: "POST",
          body: formData,
        });
        let message = '';
        try{
          const data = await res.json();
          if(data && data.message){
            message = data.message;
          }
        } catch(e){
          //ignore json parse error
        }
        if (res.ok) {
          this.showMessage(message ?? "🎉 Submitted successfully!");
        } else {
          this.showMessage(message ?? "⚠️ Submission failed.");
        }
      } catch (e) {
        this.showMessage("⚠️ Network error.");
      }
    } else if (this.config.mode === "return") {
      // Just show summary or success message
      this.showMessage("Responses collected successfully!");
    }

    // Always call onComplete with both answers & formData
    if (this.config.onComplete) {
      this.config.onComplete(this.answers, formData);
    }
    //restore send-btn
    this.sendBtn.innerHTML = old_send_btn;
    this.sendBtn.disabled = false;
  },
};
