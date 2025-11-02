# AppsMobs - Android Automation Made Easy 🚀

[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-blue.svg)](https://www.microsoft.com/windows)
[![Download](https://img.shields.io/badge/Download-Latest-brightgreen)](https://appsmobs.com/download)
[![Website](https://img.shields.io/badge/Website-appsmobs.com-cyan)](https://appsmobs.com)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE.md)

> **Professional Android automation tool for Windows** - Control multiple devices, create Python scripts, and automate tasks with ease.

**🎯 Get Started**: Download the Windows installer (.exe) from [appsmobs.com/download](https://appsmobs.com/download)

> ⚠️ **Commercial Software**: AppsMobs is proprietary software distributed as a compiled Windows executable. This repository contains documentation, website source, and build tools - not the full application source code.

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

### Download & Install

1. **Download**: Get the Windows installer from [appsmobs.com/download](https://appsmobs.com/download)
2. **Install**: Run the installer and follow the setup wizard
3. **Launch**: Start AppsMobs and connect your Android device
4. **License**: Get a free trial license from [appsmobs.com/shop](https://appsmobs.com/shop)

> 💡 **Note**: AppsMobs is distributed as a compiled Windows executable (.exe). No Python installation or coding knowledge required!

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

## 📁 Repository Structure

This repository contains:

```
appsmobs/
├── README.md          # This file - Documentation and marketing
├── LICENSE.md         # Proprietary license terms
├── CONTRIBUTING.md    # Guidelines for issues/feedback
│
├── website/           # 🌐 Freemium website (public)
│   ├── src/          # React frontend
│   └── auth-backend/ # License management API
│
├── scripts/          # 📝 Example automation scripts
├── installer/        # 📦 Build scripts for Windows installer
├── docs/             # 📚 Documentation (if added)
│
└── [Other files]     # Build tools and examples
```

> **Note**: Core application source code (`core/`, `ui/`) may be limited or excluded from this public repository as it's proprietary software.

## 💡 About This Repository

This GitHub repository serves as:
- 📚 **Documentation Hub** - Complete user guides, API references, and tutorials
- 🌐 **Website Source** - Marketing platform and license management system
- 📦 **Build Tools** - Scripts and tools for creating the Windows installer
- 🔧 **Examples** - Sample scripts and configuration files
- 🎯 **Marketing** - Professional showcase of AppsMobs capabilities

### ⚠️ Important Notice

**This repository is for DOCUMENTATION and PROMOTION purposes.**

- The **compiled Windows application (.exe)** is distributed separately
- The **core application source code** is proprietary and not fully available here
- Download the ready-to-use installer from [appsmobs.com/download](https://appsmobs.com/download)
- No Python knowledge or development setup required - just download and install!

**Why use the .exe?**
- ✅ Pre-compiled and optimized
- ✅ No setup or dependencies needed
- ✅ Professional installation experience
- ✅ Automatic updates available
- ✅ Full support included

## 🤝 Support & Feedback

- 🐛 **Report Issues**: Use [GitHub Issues](https://github.com/VOTRE_USERNAME/appsmobs/issues)
- 💬 **Get Help**: Visit [appsmobs.com/faq](https://appsmobs.com/faq)
- 💡 **Suggest Features**: Open a feature request on GitHub
- 📧 **Contact**: support@appsmobs.com

## 📝 License

AppsMobs is proprietary software. See [LICENSE.md](LICENSE.md) for details.

> ⚠️ **Important**: This repository is for documentation and website purposes. The core application source code is proprietary.

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
