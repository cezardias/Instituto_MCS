const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/ProjectsPage.tsx', 'utf8');

const rimaStart = content.indexOf('        {/* Project 4: Conexão Rima */}');
const rimaEnd = content.indexOf('        {/* Outros Projetos Cadastrados no Dashboard */}');
const rimaBlock = content.substring(rimaStart, rimaEnd);
content = content.substring(0, rimaStart) + content.substring(rimaEnd);
const movStart = content.indexOf('        {/* Project 1: MCS em Movimento */}');
content = content.substring(0, movStart) + rimaBlock + '\n' + content.substring(movStart);

const helperFn = `  const getImg = (p: any, fallback: string) => {
    if (!p.image_url || p.image_url === '/hero.png' || p.image_url === '/hero_instituto_mcs.png') return fallback;
    return p.image_url;
  };\n\n`;
const returnStart = content.indexOf('  return (');
content = content.substring(0, returnStart) + helperFn + content.substring(returnStart);

content = content.replace(/src=\{pMovimento\.image_url \|\| \"\/projeto_movimento\.png\"\}/g, 'src={getImg(pMovimento, \"/projeto_movimento.png\")}');
content = content.replace(/src=\{pDigital\.image_url \|\| \"\/projeto_digital\.png\"\}/g, 'src={getImg(pDigital, \"/projeto_digital.png\")}');
content = content.replace(/src=\{pFamilia\.image_url \|\| \"\/projeto_familia\.png\"\}/g, 'src={getImg(pFamilia, \"/projeto_familia.png\")}');
content = content.replace(/src=\{pRima\.image_url \|\| \"\/projeto_rima\.png\"\}/g, 'src={getImg(pRima, \"/projeto_rima.png\")}');

fs.writeFileSync('frontend/src/pages/ProjectsPage.tsx', content);
console.log('Done!');
