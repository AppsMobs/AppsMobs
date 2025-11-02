# AppsMobs - Android Automation Made Easy 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-blue.svg)](https://www.microsoft.com/windows)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9+-green.svg)](https://www.python.org/)

> **Professional Android automation tool for Windows** - Control multiple devices, create Python scripts, and automate tasks with ease.

## ✨ Features

- 📱 **Multi-Device Control** - Manage multiple Android devices simultaneously
- 🐍 **Python Scripting** - 35+ built-in automation functions
- 🎯 **Image Recognition** - OpenCV-based visual detection
- 🔄 **Optimized Screen Mirroring** - High-performance scrcpy integration (2M bitrate)
- 💻 **Windows Desktop App** - Clean, modern GUI
- 🔐 **Flexible Licensing** - Free trials and paid plans
- ⚡ **Local Execution** - Everything runs on your PC, no cloud needed
- 🎨 **Script Editor** - Built-in Playground with code blocks

## 🎯 Perfect For

- **Developers** - Automate testing and deployment
- **Power Users** - Custom automation workflows
- **QA Teams** - Multi-device testing
- **Content Creators** - Repetitive task automation

## 🚀 Quick Start

### Installation

1. Download the Windows installer from [our website](https://appsmobs.com/download)
2. Run the installer and follow the setup wizard
3. Launch AppsMobs and connect your Android device

### Connect Your Device

1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect via USB cable
4. Accept the debugging prompt on your phone
5. Your device will appear in the Dashboard

### Your First Script

```python
from core import android_functions as af

# Connect to device
client = af.connect_device()

# Click at coordinates
af.click(client, 540, 960)

# Swipe
af.swipe_down(client)

# Type text
af.write(client, "Hello AppsMobs!")

# Find and click image
af.find_pos_click(client, "button.png", confidence=0.8)
```

## 📋 Requirements

- **OS**: Windows 10 or later (64-bit)
- **Python**: 3.9+ (included in installer)
- **Android**: USB Debugging enabled
- **Hardware**: USB cable (data-capable)

## 💰 Pricing

AppsMobs offers flexible pricing plans:

| Plan | Price | Devices | Features |
|------|-------|---------|----------|
| **Normal** | €9/month | 1 device | Full automation suite |
| **Pro** | €15/month | 3 devices | Priority support + API access |
| **Team** | €45/month | Unlimited | SSO + Audit logs |

**Special Launch Offer**: Get **70% OFF** with code `APPSBLACKFRIDAY25` (first 100 customers)

- Annual subscriptions save up to 20%
- Free weekly trials available with referral tokens
- Visit [appsmobs.com/shop](https://appsmobs.com/shop) to purchase

## 🎓 Documentation

- **[Getting Started Guide](https://appsmobs.com/docs/getting-started)** - Complete setup walkthrough
- **[API Reference](https://appsmobs.com/docs/playground)** - All 35+ functions documented
- **[Script Examples](https://appsmobs.com/docs/scripts)** - Real-world use cases
- **[FAQ](https://appsmobs.com/faq)** - Common questions answered

## 🛠️ Core Functions

AppsMobs provides 35+ automation functions:

### Device Control
- `click(x, y)` - Tap at coordinates
- `swipe(from_x, from_y, to_x, to_y)` - Custom swipe
- `back()`, `home()`, `recents()` - Navigation buttons

### Image Detection
- `find(image_path, confidence=0.8)` - Detect image on screen
- `find_pos_click(image_path)` - Find and click
- Screenshot capture

### Text & Input
- `write(text)` - Type text
- `press_key(key)` - Hardware keys
- Clipboard operations

### Utilities
- `sleep(seconds)` - Wait/delay
- `get_screen_size()` - Device dimensions
- `is_app_running(package)` - App status

[View full API documentation →](https://appsmobs.com/docs/playground)

## 📁 Project Structure

```
BootyBot/
├── core/              # Core automation functions
├── ui/                # GUI interface
├── scripts/           # Example scripts
├── installer/         # Installation scripts
└── website/           # Web platform (licensing)
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/appsmobs.git
cd appsmobs

# Install dependencies
pip install -r requirements.txt

# Run development version
python run_app.py
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🌐 Links

- 🌐 **Website**: [appsmobs.com](https://appsmobs.com)
- 📚 **Documentation**: [appsmobs.com/docs](https://appsmobs.com/docs)
- 🛒 **Shop**: [appsmobs.com/shop](https://appsmobs.com/shop)
- 💬 **Support**: [appsmobs.com/faq](https://appsmobs.com/faq)

## 🆘 Support

- **Documentation**: [docs.appsmobs.com](https://appsmobs.com/docs)
- **FAQ**: [appsmobs.com/faq](https://appsmobs.com/faq)
- **Chat AI**: Available on our website
- **Email**: support@appsmobs.com

## 🎉 Acknowledgments

- Built with [scrcpy](https://github.com/Genymobile/scrcpy) for screen mirroring
- Uses [OpenCV](https://opencv.org/) for image recognition
- Powered by Python 3.9+

---

**Made with ❤️ for Android automation enthusiasts**

*AppsMobs - Automate better. Code less. Achieve more.*
