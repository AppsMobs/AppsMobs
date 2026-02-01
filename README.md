<p align="center">
  <img src="https://github.com/AppsMobs/AppsMobs/blob/main/assets/logo_2.png?raw=true" alt="AppsMobs" width="120" />
</p>

<p align="center">
  <strong>🚀 Build once. Automate anything.</strong>
</p>

<p align="center">
  <em>When APIs fail, vision works. Visual automation for real Android devices.</em>
</p>

<p align="center">
  <img src="https://github.com/AppsMobs/AppsMobs/blob/main/assets/tool.png?raw=true" alt="AppsMobs overview" width="800" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%2010%2F11-0078D6?style=flat&logo=windows" alt="Windows" />
  <img src="https://img.shields.io/badge/Android-ADB%20%2B%20scrcpy-3DDC84?style=flat&logo=android" alt="Android" />
  <img src="https://img.shields.io/badge/Python-Scripts%20%2B%20Vision%20AI-3776AB?style=flat&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/Deep%20Learning-YOLO%20v8-FF6F00?style=flat&logo=tensorflow" alt="Deep Learning" />
  <img src="https://img.shields.io/badge/YOLO-Object%20Detection-00A8FF?style=flat&logo=pytorch" alt="YOLO" />
</p>

---

## 📖 What is AppsMobs?

**AppsMobs** is a Windows desktop application that lets you **control and automate Android devices** from your PC. It brings everything into one tool: multi-device screen streaming (scrcpy), **Python scripts**, a **No-Code block editor**, an **AI assistant** for code generation, and **Vision AI (YOLO)** to detect on-screen elements and click them automatically.

> **In short:** Android automation (scripts + vision AI) — all running locally on your machine, with no mandatory cloud subscription to run your automations.

---

## ✨ Key Features

### 📱 Multi-Device Control

- Connect **1 to 10 Android devices** at once (depending on your plan).
- **Real-time screen streaming** (scrcpy) for each device.
- Manual actions: tap, swipe, type, navigate.
- Centralized dashboard to manage all devices from one window.

<p align="center">
  <img src="https://github.com/AppsMobs/AppsMobs/blob/main/assets/dashboard.png?raw=true" alt="AppsMobs dashboard" width="700" />
</p>

### 🐍 Python Scripts & 100+ Functions

- Full **Python script editor** with syntax highlighting and autocomplete.
- **100+ built-in functions** for automation: `tap`, `swipe`, `wait`, `screenshot`, `read_text`, `input_text`, image find & click, loops, conditions, and more.
- Run the same script on one or multiple devices.
- Save and reuse scripts across projects.

**Example functions:**

| Category       | Examples |
|----------------|----------|
| 👆 Touch       | `tap(x, y)`, `swipe(x1, y1, x2, y2)`, `long_press(x, y)` |
| ⏱️ Wait        | `wait(seconds)`, `wait_until_image("button.png")` |
| 📸 Screen      | `screenshot()`, `read_text(region)`, `image_exists("icon.png")` |
| 🎯 Find & click | `click_image("button.png")`, `find_image_and_click("reward.png")` — searches the screen for an image and clicks it |
| ⌨️ Input       | `input_text("hello")`, `press_back()`, `press_home()` |
| 🤖 Vision AI   | `smart_click_yolo(class_name)`, `ai_learn_and_click()`, `vision_ai_detect()` |

<p align="center">
  <img src="https://github.com/AppsMobs/AppsMobs/blob/main/assets/editor.png?raw=true" alt="Script editor" width="700" />
</p>

### 🧩 No-Code Block Editor

- **Visual automation** without writing code: drag-and-drop blocks to build workflows.
- Blocks map to the same actions as the script API (tap, swipe, wait, conditions, loops).
- Ideal for beginners or quick one-off automations.
- Export block workflows to Python when you need to tweak or scale.

### 👁️ Vision AI (YOLO)

- **Train your own YOLO models** inside AppsMobs: annotate images, train, and run inference.
- **Real-time detection** on the device screen: detect buttons, rewards, UI elements, and click them automatically.
- When UI selectors or coordinates change, vision keeps working — no fragile XPath or pixel positions.
- Perfect for earning apps, games, and dynamic interfaces.

<p align="center">
  <img src="https://github.com/AppsMobs/AppsMobs/blob/main/assets/visionAI.png?raw=true" alt="Vision AI" width="700" />
</p>

### 🎮 Device Control

- Control **one or multiple devices at once** from the app: power off, volume up/down, brightness, **Home**, **Back**, Recent apps.
- Direct actions per device: tap, swipe, type.
- Real-time screen view per device for monitoring and manual intervention.

<p align="center">
  <img src="https://github.com/AppsMobs/AppsMobs/blob/main/assets/control.png?raw=true" alt="Device control" width="700" />
</p>

### 🤖 AI Assistant

- Generate Python or block workflows from a **natural language description** (e.g. *"Tap the green button, wait 5 seconds, then swipe up"*).
- Supports **Gemini, Groq, OpenAI, Claude, DeepSeek** (bring your own API key).
- Inline help and code suggestions in the script editor.

### ⏰ Scheduled Tasks & Device Pool

- **Schedule scripts** to run at intervals (e.g. every 5 minutes) or at a fixed time.
- **Device pool**: assign devices to tasks; the scheduler runs the right script on the right device in order.
- Optional **state saving** to resume after a crash or restart.

---

## 💡 Why AppsMobs?

| Strength | Description |
|----------|-------------|
| **🔗 All-in-one** | ADB, scrcpy, Python, block editor, and Vision AI in a single Windows app — no need to wire multiple tools together. |
| **🏠 Local first** | Scripts and Vision AI run on your PC; execution does not depend on a cloud service. |
| **🔧 Flexible** | Use Python for power users, blocks for no-code, and the AI assistant to bridge both. |
| **👁️ Vision when it matters** | When APIs or UI trees fail, vision-based detection still finds and clicks the right elements. |
| **✨ No watermark** | Paid plans (including Starter) ship without watermarks on your automations. |

---

## 🎯 Use Cases

| Use case | Description |
|----------|-------------|
| **💰 Earning / farming** | Automate reward collection in apps (with or without Vision AI depending on plan). |
| **🎮 Mobile games** | Resource farming, repetitive loops, multi-account management. |
| **🧪 QA & testing** | Run the same scenario across several devices; schedule overnight runs. |
| **👥 Multi-account** | Control multiple devices or accounts from one PC with one dashboard. |

---

## 💳 Pricing

| Plan | Price/month | Devices | Scripts | Vision AI | RL Training | Support |
|------|-------------|---------|---------|-----------|-------------|---------|
| **Starter** | €9 | 1 | Unlimited | No | No | Community |
| **Basic** | €19 | 2 | Unlimited | No | No | Email 48h |
| **Pro** | €49 | 5 | Unlimited | Yes | No | Priority 48h |
| **Ultimate** | €79 | 10 | Unlimited | Yes | Yes | Priority 24h |

- Discounts for **3, 6, or 12 months** (see [appsmobs.com](https://appsmobs.com/shop).
- **Enterprise** — Custom (unlimited devices, on-premise, dedicated support).

*Prices are indicative; confirm on [appsmobs.com](https://appsmobs.com).*

---

## 📥 Installation & Setup

1. **Download** the latest release from [Releases](https://github.com/AppsMobs/AppsMobs/releases).
2. **Run** `AppsMobs-Setup-x64.exe` (installer) or `AppsMobs-Portable-x64.exe`.
3. **Connect** your Android device(s) via USB and enable **USB debugging**.
4. **Open** AppsMobs and follow the setup to connect your devices.

**Requirements:** Windows 10/11 (64-bit), Android device(s) with USB debugging enabled.

<p align="center">
  <img src="https://github.com/AppsMobs/AppsMobs/blob/main/assets/setup.png?raw=true" alt="Setup" width="600" />
</p>

---

## 🔗 Links

| Link | URL |
|------|-----|
| **🌐 Website** | [appsmobs.com](https://appsmobs.com) |
| **📚 Documentation** | [docs.appsmobs.com](https://docs.appsmobs.com) |
| **📦 Releases** | [GitHub Releases](https://github.com/AppsMobs/AppsMobs/releases) |

---

<p align="center">
  <img src="https://github.com/AppsMobs/AppsMobs/blob/main/assets/Logo.png?raw=true" alt="AppsMobs" width="48" />
  <img src="https://github.com/AppsMobs/AppsMobs/blob/main/assets/logo_3.png?raw=true" alt="AppsMobs" width="48" />
</p>

<p align="center">
  <strong>📄 License</strong> — See <a href="LICENSE">LICENSE</a>.
</p>
