"""
Script de configuration pour packager AppsMobs
"""
from setuptools import setup, find_packages
from pathlib import Path

# Lire le README
readme_file = Path(__file__).parent / "README.md"
long_description = readme_file.read_text(encoding="utf-8") if readme_file.exists() else ""

# Lire les requirements
requirements_file = Path(__file__).parent / "requirements.txt"
if requirements_file.exists():
    with open(requirements_file, encoding="utf-8") as f:
        requirements = [line.strip() for line in f if line.strip() and not line.startswith("#")]
else:
    requirements = []

setup(
    name="appsmobs",
    version="2.0.0",
    description="Professional Android automation tool for Windows - Control devices, create Python scripts, and automate tasks",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="AppsMobs",
    author_email="support@appsmobs.com",
    url="https://github.com/appsmobs/appsmobs",
    project_urls={
        "Homepage": "https://appsmobs.com",
        "Documentation": "https://appsmobs.com/docs",
        "Bug Reports": "https://github.com/appsmobs/appsmobs/issues",
        "Source": "https://github.com/appsmobs/appsmobs",
    },
    packages=find_packages(),
    include_package_data=True,
    python_requires=">=3.9",
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "appsmobs=run_app:main",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: End Users/Desktop",
        "License :: OSI Approved :: MIT License",
        "Operating System :: Microsoft :: Windows",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: System :: Hardware",
        "Topic :: Utilities",
    ],
    keywords="android automation scrcpy adb control python scripting opencv device-management",
)

