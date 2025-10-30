const ChatForm = {
  config: {},
  current: 0,
  answers: [],
  initHTML: `
    <div id="chat-container" class="chat-box light-theme">
    <div class="chat-header">
        <h3>Chat Assistant</h3>
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

    document
      .getElementById("restart-btn")
      .addEventListener("click", (e)=> {
          this.answers = [];//empty
          document.getElementById("chat-messages").innerHTML = "";
          this.current = 0;
          this.showBotMessage();
      });

    this.current = 0;
    this.answers = [];
    this.messagesEl = document.getElementById("chat-messages");
    this.chatInputWrapper = document.getElementById("chat-input-wrapper");
    this.formEl = document.getElementById("chatInputSubmitForm");
    this.sendBtn = document.getElementById("send-btn");

    this.formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSend();
    });

    this.showBotMessage();
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
    const q = this.config.questions[this.current];
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
      if (q.attrs && q.attrs["data-maxsize"]) {
        const maxMB = parseFloat(q.attrs["data-maxsize"]);
        if (file.size > maxMB * 1024 * 1024)
          return alert(`File must be smaller than ${maxMB} MB.`);
      }
      answer = file.name;
      fileData = file;
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

    this.showUserMessage(answer);
    this.answers.push({
      label: q.label,
      name: q.name || `q${this.current}`,
      value: answer,
      file: fileData,
    });
    this.current++;
    setTimeout(() => this.showBotMessage(), 500);
  },

  async finish() {
    this.showMessage("✅ Submitting your responses...");

    const formData = new FormData();
    this.answers.forEach((a) => {
      if (a.file) formData.append(a.name, a.file);
      else formData.append(a.name, a.value);
    });

    try {
      const res = await fetch(this.config.post_url, {
        method: "POST",
        body: formData,
      });
      if (res.ok) this.showMessage("🎉 Submitted successfully!");
      else this.showMessage("⚠️ Submission failed.");
    } catch (e) {
      this.showMessage("⚠️ Network error.");
    }

    if (this.config.onComplete) this.config.onComplete(this.answers);
  },
};
