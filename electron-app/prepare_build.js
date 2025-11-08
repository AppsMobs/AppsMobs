/**
 * Script de préparation du build
 * - Compile les fichiers Python en bytecode
 * - Convertit l'icône PNG en ICO
 * - Vérifie que tout est prêt pour le build
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

console.log('========================================');
console.log('   PREPARATION DU BUILD - AppsMobs');
console.log('========================================');
console.log();

// 1. Compiler les fichiers Python en bytecode
console.log('[1/3] Compilation du code Python en bytecode...');
try {
  const compileScript = path.join(__dirname, 'compile_bridge.py');
  if (fs.existsSync(compileScript)) {
    execSync(`python "${compileScript}"`, { stdio: 'inherit', cwd: projectRoot });
    console.log('✅ Code Python compilé');
  } else {
    console.log('⚠️  Script compile_bridge.py non trouvé, skip...');
  }
} catch (error) {
  console.error('❌ Erreur compilation Python:', error.message);
  process.exit(1);
}
console.log();

// 2. Vérifier/Créer l'icône ICO
console.log('[2/3] Vérification de l\'icône ICO...');
const logoPng = path.join(projectRoot, 'assets', 'icons', 'Logo.png');
const logoIco = path.join(projectRoot, 'assets', 'icons', 'Logo.ico');

if (!fs.existsSync(logoPng)) {
  console.error('❌ Logo.png introuvable:', logoPng);
  process.exit(1);
}

// Vérifier si l'icône existe et a la bonne taille
let needConversion = false;
if (!fs.existsSync(logoIco)) {
  needConversion = true;
  console.log('⚠️  Logo.ico non trouvé, tentative de conversion...');
} else {
  // Vérifier la taille de l'icône existante
  try {
    const convertScript = `
import sys
try:
    from PIL import Image
    img = Image.open('${logoIco.replace(/\\/g, '/')}')
    width, height = img.size
    if width < 256 or height < 256:
        print(f'❌ Icône trop petite: {width}x{height} (minimum 256x256 requis)')
        sys.exit(1)
    else:
        print(f'✅ Icône valide: {width}x{height}')
        sys.exit(0)
except ImportError:
    print('⚠️  Pillow non installé, impossible de vérifier la taille')
    sys.exit(0)
except Exception as e:
    print(f'⚠️  Erreur vérification: {e}')
    sys.exit(0)
`;
    try {
      execSync(`python -c "${convertScript.replace(/"/g, '\\"')}"`, { stdio: 'pipe', cwd: projectRoot });
    } catch (checkError) {
      // Si la vérification échoue, on reconvertit
      const output = checkError.stdout?.toString() || checkError.stderr?.toString() || '';
      if (output.includes('trop petite') || output.includes('too small')) {
        needConversion = true;
        console.log('⚠️  Logo.ico existe mais est trop petite, reconversion...');
      }
    }
  } catch {}
}

if (needConversion) {
  try {
    // Essayer de convertir avec Python/Pillow
    console.log('🔄 Conversion PNG → ICO (256x256 minimum)...');
    const convertScript = `
import sys
try:
    from PIL import Image
    # Ouvrir l'image PNG
    img = Image.open('${logoPng.replace(/\\/g, '/')}')
    
    # Vérifier/redimensionner pour avoir au moins 256x256
    width, height = img.size
    if width < 256 or height < 256:
        # Calculer le ratio pour redimensionner
        ratio = max(256 / width, 256 / height)
        new_width = int(width * ratio)
        new_height = int(height * ratio)
        print(f'📐 Redimensionnement: {width}x{height} → {new_width}x{new_height}')
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Créer l'icône avec toutes les tailles requises
    img.save('${logoIco.replace(/\\/g, '/')}', format='ICO', sizes=[(256,256), (128,128), (64,64), (48,48), (32,32), (16,16)])
    print(f'✅ Logo.ico créé avec succès (taille: {img.size[0]}x{img.size[1]})')
except ImportError:
    print('❌ Pillow non installé. Installez avec: pip install Pillow')
    sys.exit(1)
except Exception as e:
    print(f'❌ Erreur conversion: {e}')
    import traceback
    traceback.print_exc()
    sys.exit(1)
`;
    execSync(`python -c "${convertScript.replace(/"/g, '\\"')}"`, { stdio: 'inherit', cwd: projectRoot });
    console.log('✅ Logo.ico créé avec succès');
  } catch (error) {
    console.error('❌ Erreur conversion ICO:', error.message);
    console.log('💡 Solution: Utilisez build_icon.bat ou un outil en ligne pour convertir PNG en ICO');
    console.log('   L\'icône doit être au moins 256x256 pixels');
    process.exit(1);
  }
} else {
  console.log('✅ Logo.ico trouvé et valide');
}
console.log();

// 3. Vérifier que les fichiers .pyc sont présents
console.log('[3/3] Vérification des fichiers bytecode...');
const bridgeCache = path.join(__dirname, 'bridge', '__pycache__');
if (fs.existsSync(bridgeCache)) {
  const pycFiles = fs.readdirSync(bridgeCache).filter(f => f.endsWith('.pyc'));
  if (pycFiles.length > 0) {
    console.log(`✅ ${pycFiles.length} fichier(s) .pyc trouvé(s)`);
  } else {
    console.log('⚠️  Aucun fichier .pyc trouvé dans bridge/__pycache__');
    console.log('   Le code Python sera visible en clair dans le build');
  }
} else {
  console.log('⚠️  Dossier __pycache__ non trouvé');
  console.log('   Le code Python sera visible en clair dans le build');
}
console.log();

console.log('========================================');
console.log('✅ Préparation terminée!');
console.log('   Vous pouvez maintenant lancer le build');
console.log('========================================');

