; NSIS installer script for AppsMobs (Windows)
!include "MUI2.nsh"

!define APP_NAME "AppsMobs"
!define COMPANY_NAME "AppsMobs"
!define APP_DIR "dist\\BootyBot"
!define APP_EXE "AppsMobs.exe"
!define UNINST_KEY "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APP_NAME}"

Name "${APP_NAME}"
OutFile "dist\\${APP_NAME}_Setup.exe"
InstallDir "$PROGRAMFILES64\\${APP_NAME}"
RequestExecutionLevel admin
SetCompress auto
SetCompressor /SOLID lzma

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "French"

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "${APP_DIR}\\*.*"

  ; Shortcuts
  CreateDirectory "$SMPROGRAMS\\${APP_NAME}"
  CreateShortCut "$SMPROGRAMS\\${APP_NAME}\\${APP_NAME}.lnk" "$INSTDIR\\${APP_EXE}"
  CreateShortCut "$DESKTOP\\${APP_NAME}.lnk" "$INSTDIR\\${APP_EXE}"

  ; Uninstaller
  WriteUninstaller "$INSTDIR\\Uninstall.exe"

  ; Add/Remove Programs entry
  WriteRegStr HKLM "${UNINST_KEY}" "DisplayName" "${APP_NAME}"
  WriteRegStr HKLM "${UNINST_KEY}" "Publisher" "${COMPANY_NAME}"
  WriteRegStr HKLM "${UNINST_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "${UNINST_KEY}" "DisplayIcon" "$INSTDIR\\${APP_EXE}"
  WriteRegStr HKLM "${UNINST_KEY}" "UninstallString" "$INSTDIR\\Uninstall.exe"
  WriteRegDWORD HKLM "${UNINST_KEY}" "NoModify" 1
  WriteRegDWORD HKLM "${UNINST_KEY}" "NoRepair" 1

SectionEnd

Section "Uninstall"
  Delete "$SMPROGRAMS\\${APP_NAME}\\${APP_NAME}.lnk"
  RMDir  "$SMPROGRAMS\\${APP_NAME}"

  Delete "$DESKTOP\\${APP_NAME}.lnk"

  RMDir /r "$INSTDIR"

  DeleteRegKey HKLM "${UNINST_KEY}"
SectionEnd


