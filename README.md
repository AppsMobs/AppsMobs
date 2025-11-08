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
def my_script(android_client, serial):
    """
    Your custom script entrypoint.
    
    Args:
        android_client: Android client instance (provided by runtime)
        serial: Device serial number
    
    Returns:
        dict: {'success': bool, 'message': str, 'data': {}}
    """
    result = {
        'success': False,
        'message': '',
        'data': {}
    }
    
    try:
        # Use helper functions provided by the runtime
        log(serial, "Script started")

        # Swipe down
        swipe_down()
        
        
        # Click at coordinates
        click(540, 960)
        
        
        # Doble clic
        doubleclick(540, 960)
        

        # Wait time -1sec
        wait(1.0)

        # Find image
        find("image.png", 0.8)

        

        # Type text
        write("Hello AppsMobs!")
        

        log(serial, "Script finished successfully!")
        result['success'] = True
        result['message'] = f'Script executed on {serial}'
        result['data']['device'] = serial
    except Exception as e:
        log(serial, f"Error: {e}", "ERROR")
        result['success'] = False
        result['message'] = str(e)
        import traceback
        result['data']['traceback'] = traceback.format_exc()
    
    return result
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

## 🛠️ Script Functions

AppsMobs provides helper functions in your scripts:

### Helper Functions (Provided by Runtime)
- `log(serial, message, level="INFO")` - Log messages
- `wait(seconds)` - Wait/delay
- `upswipe(android_client)` - Swipe up
- `downswipe(android_client)` - Swipe down

### Android Client Methods
- `android_client.tap(x, y)` - Tap at coordinates
- `android_client.text(text)` - Type text
- `android_client.swipe(x1, y1, x2, y2)` - Custom swipe
- `android_client.back()` - Back button
- `android_client.home()` - Home button
- `android_client.recents()` - Recents button

### Alternative: Import from core (if needed)
```python
from core.android_functions import tap, text, swipe
```

[View full API documentation →](https://appsmobs.com/docs/playground)

## 📁 Repository Structure

This repository contains:

```
appsmobs/
├── README.md          # This file - Documentation and marketing
├── LICENSE.md         # Proprietary license terms
├── CONTRIBUTING.md    # Guidelines for issues/feedback
│
├── scripts/          # 📝 Example automation scripts
├── installer/        # 📦 Build scripts for Windows installer
├── assets/           # 🎨 Icons and resources
│
└── [Other files]     # Documentation and examples
```

> ⚠️ **Note**: The core application source code (`core/`, `ui/`) and website platform (`website/`) are **proprietary and excluded** from this public repository. Only the compiled Windows executable (.exe) is distributed to customers.

### 🌐 About the Website Platform

AppsMobs includes a proprietary web platform available at [appsmobs.com](https://appsmobs.com) that provides:
- 🔐 **User Authentication** - Secure account management
- 💳 **License Management** - Purchase and manage your AppsMobs licenses
- 📊 **Dashboard** - Track your usage and tokens
- 🎁 **Referral System** - Earn rewards by referring friends
- 💬 **Support Chat** - AI-powered customer support
- 📝 **Documentation** - Complete guides and API reference

**Note**: The website source code is proprietary and not available in this repository. This repository focuses on the desktop application documentation and examples.

## 💡 About This Repository

This GitHub repository serves as:
- 📚 **Documentation Hub** - Complete user guides, API references, and tutorials
- 🔧 **Examples** - Sample scripts and configuration files
- 🎯 **Marketing** - Professional showcase of AppsMobs capabilities

### ⚠️ Important Notice

**This repository is for DOCUMENTATION and PROMOTION purposes only.**

- ✅ **Compiled Windows application (.exe)** - Download from [appsmobs.com/download](https://appsmobs.com/download)
- ✅ **Example scripts** - Public examples for users
- ✅ **Documentation** - Public guides and API reference


**What's Public**: Documentation, examples, and marketing materials.
**What's Private**: All source code (application + website).
**Distribution**: Only the compiled `.exe` executable is distributed to customers.

**For Users**: No Python knowledge or development setup required - just download the .exe and install!

**Why use the .exe?**
- ✅ Pre-compiled and optimized
- ✅ No setup or dependencies needed
- ✅ Professional installation experience
- ✅ Automatic updates available
- ✅ Full support included

## 🤝 Support & Feedback

- 🐛 **Report Issues**: Use [GitHub Issues](https://github.com/AppsMobs/AppsMobs/issues)
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
