### AppsMobs Getting Started Guide  
#### For new users

> **Purpose**  
> This guide explains **everything you need to get started**: installing AppsMobs, connecting your Android devices, creating your first automations, and managing your account / subscription.

---

### 🧩 Understand AppsMobs in 5 minutes

**What is AppsMobs?**

AppsMobs is a **Windows** application that lets you **control and automate Android devices** from your PC:

- **Live control** via scrcpy (phone screen mirrored on your PC)
- **Python scripts** ready for automation
- **No-code visual editor** (blocks)
- **Vision AI (YOLO)** to detect and click on screen elements
- **AI assistant** to generate scripts / workflows from a natural language description

**High-level ecosystem overview**

- **Desktop app** `AppsMobs` (Electron, Windows only)
- **Website** (React + Vite): marketing site, user account, subscription, online dashboard
- **Auth backend** (Node + Supabase): account, tokens, security
- **Database**: Supabase (user data, licenses, etc.)

---

### 💻 Technical requirements

**On your PC (where AppsMobs runs)**

- Windows **10 or 11**, 64-bit
- Internet connection (recommended for:
  - license activation,
  - updates,
  - AI features)
- Enough disk space (Vision AI models, scripts, logs…)

**On your Android devices**

- 1 or more Android devices
- **Developer mode** enabled
- **USB debugging** enabled
- Good quality **data USB cable(s)**  
  *(avoid charge-only cables)*

---

### 📥 Installing AppsMobs on Windows

**Installation steps**

1. Go to the AppsMobs **Releases** page (GitHub or official website).
2. Download:
   - either the installer `AppsMobs-Setup-x64.exe` (**recommended**),
   - or the portable version `AppsMobs-Portable-x64.exe`.
3. Run the downloaded file:
   - Follow the installer wizard (NSIS) if you chose the Setup version.
   - Or simply open the folder if you use the Portable version.
4. Start **AppsMobs** from the shortcut or executable.

**Automatic updates**

- AppsMobs uses **electron-updater**:
  - On each startup, the app checks if a new version is available.
  - If yes, it downloads and installs the update (depending on configuration).
- You don’t need to do anything special: **letting the app auto-update** is the best option.

---

### 🔌 Connecting your first Android device

**On the phone**

1. Enable **Developer options**.
2. Enable **USB debugging**.
3. Plug the phone into the PC with a USB cable.
4. On the phone, accept the prompt:  
   *“Allow USB debugging for this computer?”*

**In AppsMobs**

1. Open **AppsMobs**.
2. Go to the **Devices / Connection** section.
3. AppsMobs automatically detects devices via **ADB / scrcpy**.
4. Click on your device: a **streaming window** opens (phone screen on the PC).
5. You can already:
   - **click**,
   - **swipe**,
   - **type text**  
   directly from the interface.

**Number of devices by plan**

| Plan     | Max devices |
|----------|------------:|
| Starter  |           1 |
| Basic    |           2 |
| Pro      |           5 |
| Ultimate |          10 |

---

### 🐍 Python scripts – Advanced automation

**What you can do with scripts**

- Run **repetitive sequences**:
  - collect rewards,
  - navigate inside an app,
  - perform regular checks, etc.
- Automate **several devices in parallel** with a single script.
- Use more than **100 built-in functions** (touch, vision, timing…).

---

#### 📚 AppsMobs API: overview

When you write a script, you actually use the **AppsMobs API**: a set of ready-to-use Python functions that give you access to:

- **Basic actions**: `tap`, `swipe`, `wait`, `input_text`, `press_back`, etc.
- **Image-based vision**: search for images on the screen and click automatically.
- **Advanced Vision AI (YOLO)**: object detection by class (buttons, icons, rewards…).
- **Utilities**: logs, loops, error handling, multi-device support, etc.

You don’t need to “import an external library”: in the AppsMobs editor, these functions are already available in the script environment.  
You can focus on **your business logic** (what to do, in which order) instead of low-level ADB / vision plumbing.

---

#### 🎯 The key function `image_action(...)`

The `image_action(...)` function is a **high-level API** to perform actions based on image detection.  
It allows you to:

- search for **one or more images** on the screen,
- control the **confidence threshold**,
- **loop** until the image is found (or a limit is reached),
- **click automatically** (single or double click),
- **avoid a specific area**,
- play a **sound** if the action fails multiple times.

Signature (for reference):

```python
image_action(
    images=["btn.png", "btn_alt.png"],   # list with 1 or more possible images
    conf=0.85,                           # confidence (0.0 - 1.0)
    loop=True,                           # True = loop until success or max_attempts
    click_mode="single",                 # "none" | "single" | "double"
    avoid_rect=None,                     # area to avoid: ((x1, y1), (x2, y2)) or None
    max_attempts=None,                   # global limit (None = infinite)
    sound=False,                         # True = enable sound
    sound_file="alarm.mp3",              # optional sound file
    sound_every_n_attempts=None,         # e.g. 10 = play sound every 10 failed attempts
)
```

**Parameters, one by one:**

- **`images`**:  
  - List of reference images to look for on the screen.  
  - Example: `["btn.png"]` or `["btn.png", "btn_alt.png"]` if your button has several variants (colors, states…).
  - As soon as **one** image is found with sufficient confidence, the action is considered a **success**.

- **`conf`** (confidence):  
  - Confidence level **between 0.0 and 1.0**.  
  - The closer to **1.0**, the more **precise** the match must be.  
  - Example:
    - `0.7` = more tolerant (accepts approximate matches),
    - `0.9` = stricter (might miss if the image is slightly different).

- **`loop`**:  
  - If `True`: the function **loops** (takes new screenshots / runs detection) until:
    - the image is found, or
    - `max_attempts` is reached (if defined).  
  - If `False`: only **one attempt** is made (useful for quick tests).

- **`click_mode`**:  
  - Controls what happens when the image is found:
    - `"none"`  → no click, just detection (useful if you want to handle a conditional afterward).
    - `"single"` → single click at the detected position (most common case).
    - `"double"` → double-click at the detected position.

- **`avoid_rect`**:  
  - Lets you **define an area to avoid** on screen.  
  - Format: `((x1, y1), (x2, y2))` → two corners of the rectangle to exclude.  
  - Useful when:
    - the same image appears **in multiple places**,
    - but you want to avoid, for example, an ad corner, overlay, etc.

- **`max_attempts`**:  
  - Limits the **total number of attempts** if `loop=True`.  
  - `None` = no limit (be careful not to block a script too long if the image never appears).  
  - Example:
    - `max_attempts=20` → at most 20 attempts before giving up.

- **`sound`**:  
  - If `True`: enables sound notifications when combined with `sound_every_n_attempts`.  
  - If `False`: no sound is played.

- **`sound_file`**:  
  - Name of the **audio file** to play (e.g. `"alarm.mp3"`).  
  - Used only if `sound=True` and `sound_every_n_attempts` is configured.

- **`sound_every_n_attempts`**:  
  - Example: `10` → plays the sound **every 10 failed attempts**.  
  - Very useful to **alert you** when:
    - the script runs in the background,
    - but the image is no longer found (UI changed, bug, network issue…).

In short, `image_action(...)` is your **main building block** for:

- “wait for a button to appear and then click it”,
- “retry several times until a particular icon is visible”,
- “raise an alert if an element hasn’t appeared after X attempts”.

You can use it alone or as an **internal block** inside higher-level functions (`go_to_main_menu()`, `collect_bonus()`, etc.).

---

#### 🧪 Mini script example: installing “AppsMobs Touch” from the Play Store

> **Script goal**  
> - Open the Play Store  
> - Click on the search bar  
> - Type “AppsMobs Touch”  
> - Click on the result / “Install” button  
> - Use `sleep`, `print` and small `random` jitter on taps to feel more “human”

```python
import time
import random

def human_sleep(min_s=0.5, max_s=1.5):
    """Random pause to simulate human behavior."""
    delay = random.uniform(min_s, max_s)
    print(f"[INFO] Sleeping for {delay:.2f}s")
    time.sleep(delay)

def human_tap(x, y, jitter=5):
    """Tap with a small random offset around point (x, y)."""
    dx = random.randint(-jitter, jitter)
    dy = random.randint(-jitter, jitter)
    final_x, final_y = x + dx, y + dy
    print(f"[ACTION] Tap at ({final_x}, {final_y}) (jitter={jitter})")
    tap(final_x, final_y)
    human_sleep(0.3, 0.8)

def open_play_store():
    print("[STEP] Opening Play Store…")
    # Example 1: via an icon on the home screen (image_action)
    image_action(
        images=["icons/playstore.png"],
        conf=0.85,
        loop=True,
        click_mode="single",
        max_attempts=20
    )
    human_sleep(2.0, 3.0)  # let the app fully load

def click_search_bar():
    print("[STEP] Clicking on the search bar…")
    image_action(
        images=["playstore_search_bar.png"],
        conf=0.85,
        loop=True,
        click_mode="single",
        max_attempts=15
    )
    human_sleep(0.8, 1.5)

def type_search():
    print('[STEP] Typing "AppsMobs Touch"…')
    input_text("AppsMobs Touch")
    human_sleep(0.8, 1.2)
    # Press Enter or tap the search icon, depending on your setup
    print("[ACTION] Validating search…")
    press_enter()  # or use image_action on the search icon if needed
    human_sleep(2.0, 3.0)

def click_install():
    print("[STEP] Looking for the Install button…")
    image_action(
        images=["btn_install.png", "btn_install_en.png"],
        conf=0.88,
        loop=True,
        click_mode="single",
        max_attempts=30,
        sound=True,
        sound_file="alarm.mp3",
        sound_every_n_attempts=10
    )
    print("[OK] Install button clicked, installation in progress…")
    human_sleep(3.0, 5.0)

def main():
    print("=== AppsMobs script: installing 'AppsMobs Touch' ===")
    open_play_store()
    click_search_bar()
    type_search()
    click_install()
    print("=== Script finished ✅ ===")

# Script entry point
main()
```

> **Notes**  
> - Image names (`icons/playstore.png`, `playstore_search_bar.png`, `btn_install.png`, etc.) must match **your own screenshots**.  
> - The functions `tap`, `input_text`, `press_enter`, `image_action` are provided by the **AppsMobs API**.  
> - You can tune `sleep` durations and `conf` / `max_attempts` according to your device speed and UI stability.

---

#### 🧱 Typical structure of an AppsMobs script

A “clean” script usually looks like this:

- **Imports & helpers** (reusable helper functions)
- **Configuration** (wait times, number of loops, etc.)
- **Action functions** (for example `collect_rewards()`, `launch_app()`)
- **Main loop** that calls these functions

General idea:

1. **Use clear names** for your functions (`go_to_menu`, `click_reward`, etc.).
2. **Don’t put everything in `main`**: split logic into small functions.
3. Add **safety checks** (for example, ensure an image exists before clicking).

---

#### 🧪 Key function examples

- **Touch / gestures**  
  `tap(x, y)` · `swipe(x1, y1, x2, y2)` · `long_press(x, y)`
- **Time / wait**  
  `wait(5)` · `wait_until_image("button.png")`
- **Screen / image**  
  `screenshot()` · `image_exists("icon.png")` · `click_image("button.png")`
- **Keyboard / navigation**  
  `input_text("Hello")` · `press_back()` · `press_home()`
- **Vision AI** (depending on plan)  
  `smart_click_yolo("class")` · `vision_ai_detect()`

---

#### 📋 Example of script logic (pseudo-code)

Without showing the exact code, here is the typical logic of a simple farming script:

1. **Launch the target app** (via a shortcut or tap on the icon).
2. **Wait a few seconds** for the UI to be ready.
3. **Look for a “Collect” button** (by image or Vision AI) and click it.
4. **Wait for the animation to finish**, close popups if needed.
5. **Repeat** these steps in a loop (for example every X minutes).

You can then:

- Add a **counter** (number of cycles),
- Log in the console what happens at each step,
- Handle **error cases** (image not found, timeout reached, etc.).

---

#### 📡 Multi-device scripts

With AppsMobs, a script can:

- run on **a single device**, or
- be started on **multiple devices** at the same time.

Best practices:

- Always try to make the script **idempotent**: it should be safe to restart without breaking the app state.
- Avoid hard-coded coordinates that ignore resolution → prefer:
  - **image-based** search,
  - **Vision AI**,
  - or relative positions (for simple cases).

---

#### 🐞 Debug & logs

To see what your script is doing:

- Use **logs** (messages in the AppsMobs editor console):
  - at the beginning of each important step,
  - when entering or exiting a loop,
  - when an image / AI detection fails.
- Always start by testing:
  - on **a single device**,
  - with **longer delays** (`wait(3)` instead of `wait(0.5)`) while validating.
- Once everything is stable:
  - shorten wait times,
  - then move to **multi-device** if your plan allows it.

---

#### ✅ Your first script (checklist)

1. Open the **script editor** in AppsMobs.
2. Create a **new Python script**.
3. Add:
   - a small action function (for example tap at a fixed location),
   - a few `wait()` calls to see the flow.
4. Add 2–3 **logs** to follow the steps.
5. Attach this script to **one device only** at first.
6. Click **Run** and verify the behavior.
7. Once satisfied, **refactor** the script (reusable functions) and, if needed, move to **multi-device**.

---

### 🧩 No-Code editor (Blocks)

**Who is it for?**

- Users who **don’t want to write Python code**.
- Quick creation of simple automations:
  - clicks,
  - swipes,
  - delays,
  - conditions,
  - loops, etc.

**How it works**

- You **drag & drop** blocks:
  - actions,
  - conditions,
  - loops, etc.
- Each block corresponds to a **script function** (tap, swipe, wait…).
- You see your workflow logic as a **visual diagram**.
- You can then, if needed, **export to Python** for more advanced tuning or scaling.

---

### 👁️ Vision AI (YOLO) – Automate “by sight”

> **Available on some plans (Pro, Ultimate).**

**Why it’s powerful**

You teach AppsMobs to **recognize visual elements** on the screen (buttons, icons, rewards, etc.).  
Instead of clicking fixed coordinates, you say:

> *“Click as soon as you see THIS button.”*

It is ideal when:

- The UI changes frequently.
- There is **no reliable API**.
- You automate a **game** or a highly visual app.

**How it works**

1. You provide **screenshots**.
2. You **annotate** elements to recognize (regions + class names).
3. AppsMobs **trains a YOLO model**.
4. In your scripts, you call for example:  
   `smart_click_yolo("button_class_name")`
5. The AI detects the position and **AppsMobs clicks automatically** at the right place.

---

### 🤖 AI Assistant (Gemini, Groq, OpenAI, Claude, DeepSeek…)

**What the AI assistant does**

You simply describe what you want, for example:

> *“Open app X, wait 5 seconds, click the green button, then swipe up every 30 seconds.”*

The AI assistant generates:

- either a **Python script**,
- or a **block workflow**.

**Configuration (BYOK)**

- The assistant works with **BYOK – Bring Your Own Key**:
  - Gemini, Groq, OpenAI, Claude, DeepSeek, etc.
- You enter **your own API keys** in the AppsMobs settings.
- **Important**:
  - never share your keys,
  - never paste them in public code or screenshots.

---

### ⏰ Scheduled tasks & device pool

**Task scheduler**

You can tell AppsMobs:

- “Run this script **every 5 minutes**”
- or “Run this script **every day at 03:00**”

Use cases:

- **Automatic farming**
- **Recurring stability tests**
- **Monitoring** apps (state, notifications, etc.)

**Device pool**

- You define an available **device pool**.
- You **assign tasks** to this pool.
- The scheduler handles:
  - launching the right scripts,
  - on the right devices,
  - in the right order.

---

### 🌐 AppsMobs website (account, subscription, dashboard)

**What you can do on the website**

- **Create an account / log in**
- **Manage your subscription**:
  - purchase, renew, upgrade / downgrade
- **Pay online** via:
  - Stripe, PayPal, Binance (depending on active integrations)
- Access your **web dashboard**:
  - see your licenses,
  - check subscription status,
  - read documentation
- Access **support & AI chat** (if enabled):
  - FAQ,
  - technical support,
  - quick answers via AI.

**Technical stack (for info)**

- Frontend: React 18 + Vite + Tailwind CSS
- Auth backend: Node.js + Express
- Auth / DB: Supabase
- Deployment: Vercel

---

### 💳 Plans & limits

| Plan     | Approx. monthly price | Devices | Scripts | Vision AI   | Support             |
|----------|----------------------:|:--------|:--------|:------------|:--------------------|
| Starter  | ~ €9                 | 1       | Unlimited| No          | Community           |
| Basic    | ~ €19                | 2       | Unlimited| No          | Email (~48 h)       |
| Pro      | ~ €49                | 5       | Unlimited| Yes         | Priority (~48 h)    |
| Ultimate | ~ €79                | 10      | Unlimited| Yes (+ RL)  | Priority (~24 h)    |

> **Note**: Exact prices, promos and bundles may change.  
> Always refer to the official site `https://appsmobs.com`.

---

### 🔐 Security & best practices

**Account & authentication**

- Use:
  - a **valid email address**,
  - a **strong password**:
    - enough length,
    - upper & lower case, digits, special characters.
- **Never** share your password.
- Log out from **shared PCs**.

**Tokens & sessions**

- Tokens are:
  - **validated** (format, expiration),
  - **cleaned up** automatically if invalid.
- If you see:
  - frequent logouts,
  - 401 / 403 errors,  
  log in again properly.

**Payments**

- Payments go through **secure platforms**:
  - Stripe,
  - PayPal,
  - Binance.
- Always check:
  - that the URL is correct,
  - that the site uses **HTTPS**.

**AI API keys**

- Never share your keys (Gemini, Groq, OpenAI, Claude, etc.).
- Don’t put them in public code or screenshots.
- If you suspect a leak:
  - **regenerate the key** from the provider’s dashboard.

**Updates**

- Let AppsMobs update itself:
  - you get **new features**,
  - **bug fixes**,
  - **security improvements**.

---

### 🆘 Where to get help

**Documentation**

- Official docs: `https://docs.appsmobs.com`
- Guides, FAQ, automation examples: **Documentation** & **Support** sections on the site

**Support**

- Email: `support@appsmobs.com`
- Support level depends on your plan:
  - Community
  - Standard email
  - Priority

**Quick links**

- Official site: `https://appsmobs.com`
- Downloads / Releases: `https://github.com/AppsMobs/AppsMobs/releases`

---

### ✅ Ultra-quick start summary

1. **Install** AppsMobs on Windows 10/11 (Setup or Portable).
2. **Enable USB debugging** on your Android and connect it to the PC.
3. **Open AppsMobs** and check that the device appears with a streaming screen.
4. Create a **first script** or a **block workflow** (tap, wait, swipe).
5. Test it, then enable **Vision AI** if your plan allows it.
6. Manage your **account** and **subscription** from the AppsMobs website.
7. Let the app **auto-update** and follow basic **security best practices**.

