# AppsMobs — Getting Started Guide

> Updated on 14 November 2026. The full version, with app screenshots and videos, is on the website: **https://appsmobs.com/en/docs**

This guide takes you from installing the app to your first automated script. Allow about 30 minutes the first time.

**Contents**

1. [AppsMobs in short](#1-appsmobs-in-short)
2. [Install AppsMobs](#2-install-appsmobs)
3. [Sign in and activate your license](#3-sign-in-and-activate-your-license)
4. [Connect a phone or an emulator](#4-connect-a-phone-or-an-emulator)
5. [A tour of the interface](#5-a-tour-of-the-interface)
6. [Your first script](#6-your-first-script)
7. [Build without code: blocks](#7-build-without-code-blocks)
8. [Let an AI write your scripts](#8-let-an-ai-write-your-scripts)
9. [Vision AI](#9-vision-ai)
10. [Schedule scripts](#10-schedule-scripts)
11. [Plans and license](#11-plans-and-license)
12. [Something wrong?](#12-something-wrong)

---

## 1. AppsMobs in short

AppsMobs is a **Windows** app that drives Android phones and emulators from your PC: you see their screen, you control them, and you make them run scripts.

- **Devices**: phones over USB or Wi-Fi, and emulators (LDPlayer is detected on its own; BlueStacks, MEmu, Nox… work too).
- **Scripts**: small programs that tap, swipe, look for an image or a text on screen. Write them in Python, with blocks, or have your own AI (Claude, Grok, ChatGPT…) write them.
- **Everything runs on your PC.** ADB and scrcpy are bundled: there is nothing else to install.

> AppsMobs sends real taps and real screenshots, nothing more. It does not make an account or a device "invisible". What you automate remains your responsibility.

---

## 2. Install AppsMobs

**You need**: Windows 10 or 11, 64-bit (no macOS or Linux version), an Internet connection, and the email + license key you received when you bought your license.

1. Download the installer from **https://appsmobs.com/en/download** (or from the [GitHub Releases](https://github.com/AppsMobs/AppsMobs/releases)). The file is named `AppsMobs-Setup-<version>-x64.exe`. A portable version also exists; if you are new, take the installer.
2. Double-click the file.
3. Windows will most likely show a blue screen, **"Windows protected your PC"**: the installer has no code signature yet. Click **More info**, then **Run anyway**.
4. Follow the wizard (keep the suggested folder). A shortcut is added to the Desktop and the Start menu.
5. Start AppsMobs: after about 3 seconds, the sign-in window appears.

**Where your files are**: in `Documents\AppsMobs`.

| Folder | Contents |
|---|---|
| `Scripts` | your scripts (`.py`) and their images |
| `Screenshots` | screenshots |
| `VisionProjects` | your Vision AI projects |
| `debug` | full logs |

**Updates**: at startup, the app checks for a new version and offers it to you. Nothing is downloaded without your confirmation. You can also check by hand in **Settings**.

---

## 3. Sign in and activate your license

1. In the sign-in window, enter your **Email** and your **License key** (copy-paste the key, with no space before or after).
2. Tick **Remember me**: next time, the app opens straight away.
3. Click **Sign in**. The main window opens on the **Dashboard**; the badge at the top right shows your plan and the days left.

Already in the app? **Settings** → **License** tab → **Activate** (or **Verify License** right after a renewal).

> Your key is personal: do not show it in a screenshot or a public message.

**Without a valid license**, the app is **read-only**: you can look around, but running, stopping or deleting a script is blocked. Nothing is deleted: renew and everything works again. Offline, a license already saved on the PC keeps working.

---

## 4. Connect a phone or an emulator

This is where beginners get stuck the most: take your time. You need **a USB cable that carries data** (not a charge-only cable).

### Over USB (phone)

1. **Unlock Developer options**: tap **7 times** on "Build number".
   - Samsung: Settings → About phone → Software information → Build number
   - Xiaomi / Redmi / POCO: Settings → About phone → MIUI version (or HyperOS version)
   - Google Pixel: Settings → About phone → Build number
   - Other brands: search "build number" with the Settings search bar

   The message "You are now a developer!" appears.
2. **Turn on USB debugging** in Developer options.
   - **Xiaomi / Redmi / POCO**: also turn on **USB debugging (Security settings)**, otherwise the phone refuses taps sent from the PC.
3. **Plug** the phone straight into the PC (avoid USB hubs), screen unlocked. If asked "Use USB for", choose **File transfer**.
4. On the phone, accept **Allow USB debugging?** and tick **Always allow from this computer**.
5. In AppsMobs, open the **Dashboard** (use the refresh button of the **Devices** card if needed). Your phone should show up with a green **Free** light.

### Over Wi-Fi

**The PC and the phone must be on the same Wi-Fi network.** On the Dashboard, click the **Wi-Fi icon** next to the refresh button of the **Devices** card.

- **Android 11 and later**: on the phone, Developer options → **Wireless debugging** → **Pair device with pairing code**. In AppsMobs, the phone appears under **Phones waiting for a code**: type the 6-digit code and click **Pair**. You only do this once; after that AppsMobs reconnects it on its own.
- **Android 10 and earlier**: plug it in over USB once, click **Switch to Wi-Fi**, then unplug. This mode does not survive a phone restart.

> The cable stays the most stable option for long sessions or for the live screen on several phones.

### LDPlayer emulator

Start your instance, make sure local ADB connection is enabled in its settings, then open the Dashboard: the emulator shows up with a name like `emulator-5554`, labelled **Emulator**. Nothing to type.

---

## 5. A tour of the interface

The left sidebar is split into two groups.

**Workspace**

- **Dashboard**: connected and free devices, running scripts, crashes in the last 24 hours. You can start a script by dragging it onto a device.
- **Control**: pick one or more devices, see their screen live, tap, swipe, type text, change Wi-Fi or volume, run a script on several devices at once.
- **Automation**: script scheduling. Turn this section on in **Settings** (**Enable automation**).

**Create**

- **Playground**: the script editor, in **Code** or **Blocks** mode.
- **Vision AI**: train a model that recognises objects or screens (Pro plan and above).
- **Console**: logs from the app, the scheduler and each script, with filters and export.

At the bottom: **Settings** (language, live screen quality, folders, license, updates) and **Profile** (your account, your license, your referral code, Discord linking).

---

## 6. Your first script

1. Open **Playground**, then **Or start from a blank page**. Make sure **Code** mode is on.
2. Type:

   ```python
   log("Script started")
   press_home()
   wait(2)
   log("Back on the home screen")
   ```

   No `import`: the functions are already available. `wait()` counts in **seconds**.
3. Click **Run on** and tick your device.
4. Click **Run** (<kbd>F5</kbd>). The **Output** panel shows your messages; **Stop** = <kbd>Shift</kbd>+<kbd>F5</kbd>.
5. Save with <kbd>Ctrl</kbd>+<kbd>S</kbd> into `Documents\AppsMobs\Scripts`.

### Tap a button from an image

1. Show the button on the phone, then in the Playground: **⋯** → **Device screenshot** (<kbd>F9</kbd>). Accept opening the screenshot in Paint.
2. In Paint: **Select** around the button only, **Crop**, then **Save as** → PNG, in the script's folder, named `button.png`.
3. Replace the script with:

   ```python
   log("Looking for the button")
   if tap_image("button.png", timeout=15):
       log("Button tapped")
   else:
       log("Button not found after 15 seconds")
   ```

If the button has text that Android can read, no image is needed: `wait_text("Settings", timeout=15)` then `tap_text("Settings")`.

### Good habits

- Wait for a condition (`wait_image`, `wait_text`) rather than a fixed delay.
- Always test the result: `if tap_image(...)`. A failure does not stop the script on its own.
- Vary your pauses with `random_wait(1, 2)`.
- Images are looked up in the script's folder, then in `Scripts\img`.
- A safety guard blocks dangerous code (for example `import os`): the window "For your security, this script cannot be executed." tells you so.

Every function: **https://appsmobs.com/en/docs/functions** (and in the app: **⋯** → **Function reference**).

---

## 7. Build without code: blocks

In the Playground, switch to **Blocks** mode: you put blocks together (loop, **Find & Click**, wait, message…) and AppsMobs writes the Python for you, shown live. Pick the device and run it like a code script.

| Block | Generated Python |
|---|---|
| Tap | `tap(540, 960)` |
| Swipe up | `swipe_up()` |
| Back button | `press_back()` |
| Type text | `type_text('Your text here')` |
| Find & Click | `tap_image("button.png", 0.85)` |
| Wait for text | `wait_text('Text', timeout=30)` |

Details: **https://appsmobs.com/en/docs/block-editor**

---

## 8. Let an AI write your scripts

AppsMobs has **no built-in assistant** and **never asks for an API key**. Instead, the free **AppsMobs pack** teaches the app and every function, with its exact signature, to the AI you already use.

1. **Get the pack**: in the Playground, on an empty script, the **Write it with Claude or Grok** card copies it to your clipboard. It is also on the [AI pack page](https://appsmobs.com/en/docs/ai-pack), together with a ready-to-import **Claude Skill**.
2. **Give it to your AI**: paste it as the first message (Grok, ChatGPT, Gemini) or import the Skill into Claude.
3. **Describe your script** in plain words: "Tap the green button, wait 5 seconds, then swipe up".
4. **Paste the script** into the Playground, read it, and test it on a device.

---

## 9. Vision AI

*Pro plan and above.* Teach the bot to find objects or recognise screens, without relying on coordinates or screen resolution.

| Project type | The question | In a script |
|---|---|---|
| **Find objects** | "Where is the *Play* button?" | `smart_detect`, `smart_click` |
| **Recognize the screen** | "Am I on the menu, in a fight, on an ad?" | `detect_screen`, `wait_screen` |

It takes 4 steps in the **Vision AI** page: **capture** varied screens, **annotate** (AI assistants help you go faster), **train** in one click, **test** live and then fix.

```python
chests = smart_detect(["chest"], model="My game", conf=0.5)
smart_click(["play_button"], model="My game")

if wait_screen("fight", model="My screens", timeout=10):
    log("In a fight")
```

Without a graphics card, training runs on the processor (a few minutes for a small project). With an **NVIDIA** card, the app offers to enable it (one-time download of about 2.5 GB): 5 to 20 times faster.

Details: **https://appsmobs.com/en/docs/vision-ai**

---

## 10. Schedule scripts

*Basic plan and above.* Turn on **Automation** in Settings, then **New task**: choose **which script**, **when** (every 30 minutes, every day at 8 am…) and **on which devices** (any free device, with optional rotation, or specific devices).

Good to know:

- Tasks only run **while AppsMobs is open** (minimised works). Runs missed while the PC sleeps are not caught up.
- On several devices, the script runs on them **one after the other**.
- A script started by a task is cut off after **5 minutes**. For longer ones, start them by hand.

Details: **https://appsmobs.com/en/docs/scheduling-and-pools**

---

## 11. Plans and license

| | Starter | Basic | Pro | Ultimate | Enterprise |
|---|---|---|---|---|---|
| Devices at the same time | 1 | 2 | 5 | 10 | unlimited |
| Scheduler | — | ✓ | ✓ | ✓ | ✓ |
| Device pools and priority support | — | — | ✓ | ✓ | ✓ |
| Vision AI | — | — | ✓ | ✓ | ✓ |
| Reinforcement learning | — | — | — | ✓ | ✓ |

- Every plan: unlimited scripts and runs, block editor, **no watermark**.
- **7-day free trial** on every plan: nothing is charged before day 8, cancel any time.
- Pay with PayPal, card or crypto, with an invoice for every payment. Current prices: **https://appsmobs.com/en/pricing**
- One license = **one PC**. Your plan's number (1, 2, 5 or 10) is how many phones that PC drives at the same time. To change PC, write to support.
- Changing plan: your remaining days are converted at equal value.

---

## 12. Something wrong?

| Symptom | Fix |
|---|---|
| No device shows up | Change cable (it must transfer files), check USB debugging, choose **File transfer**, then refresh |
| "Device Unauthorized" | Plug it in again and accept the window on the phone with **Always allow** |
| No authorisation window | Unlock the phone; otherwise **Revoke USB debugging authorizations** and plug it in again |
| Windows does not recognise the phone | Install the brand's USB driver (Device Manager, yellow triangle) |
| Xiaomi: taps don't go through | Turn on **USB debugging (Security settings)** |
| `image introuvable : button.png` (image not found) | Put the image in the script's folder or in `Scripts\img`, check the name and the `.png` |
| The image is not found on screen | Crop tighter around the button, or lower the confidence: `tap_image("button.png", conf=0.7)` |
| `NameError: name 'click' is not defined` | Use the real function names: `tap`, `tap_image`, `wait` |
| "Authentication error" | Retype email and key without stray spaces |
| Script buttons are blocked | Expired license (read-only): renew, then **Verify License** |
| **Automation** missing from the sidebar | **Settings** → **Enable automation** |

Every known error message: **https://appsmobs.com/en/docs/troubleshooting**

---

## Go further

- [The Dashboard](https://appsmobs.com/en/docs/dashboard) · [Control a device](https://appsmobs.com/en/docs/control)
- [Writing a Python script](https://appsmobs.com/en/docs/python-scripts) · [Function reference](https://appsmobs.com/en/docs/functions)
- [Console and logs](https://appsmobs.com/en/docs/console) · [Settings](https://appsmobs.com/en/docs/settings)
- [License, plans and account](https://appsmobs.com/en/docs/licence-and-billing)

Stuck? The **AppsMobs Discord** is the fastest way to get an answer.
