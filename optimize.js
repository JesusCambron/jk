const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, 'src', 'assets');
const optimizedDir = path.join(assetsDir, 'optimized');

if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir);
}

async function optimizeImages() {
  try {
    const files = fs.readdirSync(assetsDir);
    const images = files.filter(file => file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpeg'));

    console.log(`Encontradas ${images.length} imágenes para optimizar.`);

    for (const file of images) {
      const filePath = path.join(assetsDir, file);
      const stat = fs.statSync(filePath);
      const isLarge = stat.size > 1024 * 1024;
      const isJpeg = file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg');
      
      const outPath = path.join(optimizedDir, file);

      if (isLarge || isJpeg) {
        console.log(`Optimizando: ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
        
        await sharp(filePath)
          .resize({ width: 1920, withoutEnlargement: true })
          .jpeg({ quality: 75, progressive: true })
          .toFile(outPath);
          
        const newStat = fs.statSync(outPath);
        console.log(`  -> ¡Listo! Nuevo tamaño: ${(newStat.size / 1024 / 1024).toFixed(2)} MB`);
      } else {
        console.log(`Omitiendo/Copiando ${file}`);
        fs.copyFileSync(filePath, outPath);
      }
    }
    
    console.log('¡Optimización completada! Imágenes guardadas en src/assets/optimized/');
  } catch (err) {
    console.error('Error al optimizar las imágenes:', err);
  }
}

optimizeImages();
