const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function loadModule(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const transformed = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;

  const mockExports = {};
  const mockModule = { exports: mockExports };
  const mockRequire = (id) => {
    if (id === 'remotion') {
      return { staticFile: (p) => p };
    }
    if (id.startsWith('.')) {
      const resolved = path.resolve(path.dirname(filePath), id);
      const candidates = [resolved, resolved + '.ts', resolved + '.tsx', resolved + '.js'];
      for (const cand of candidates) {
        if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
          return loadModule(cand);
        }
      }
    }
    return require(id);
  };

  const fn = new Function('exports', 'require', 'module', transformed);
  fn(mockExports, mockRequire, mockModule);
  return mockModule.exports;
}

try {
  const { defaultNewsData } = loadModule(path.join(__dirname, '../src/News/mockData.ts'));
  const { generateYouTubeChapters } = loadModule(path.join(__dirname, '../src/News/utils/chapterUtils.ts'));

  console.log('\n================================================================');
  console.log('       🎬 큰빛뉴스 유튜브 챕터 (타임스탬프) 자동 생성기       ');
  console.log('================================================================\n');

  // 1. 16:9 메인 종합 뉴스 챕터
  const broadcastResult = generateYouTubeChapters(defaultNewsData, 'broadcast', 30);
  console.log(broadcastResult.text);

  console.log('\n----------------------------------------------------------------\n');

  // 2. 9:16 숏폼 챕터
  const shortsResult = generateYouTubeChapters(defaultNewsData, 'shorts', 30);
  console.log(shortsResult.text);

  console.log('\n================================================================\n');

  // out 폴더 생성 및 파일 저장
  const outDir = path.join(__dirname, '../out');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFilePath = path.join(outDir, 'youtube-chapters.txt');
  const fullOutput = `${broadcastResult.text}\n\n================================================================\n\n${shortsResult.text}\n`;
  fs.writeFileSync(outFilePath, fullOutput, 'utf8');

  console.log(`✅ [저장 완료] 파일이 생성되었습니다:`);
  console.log(`📁 out/youtube-chapters.txt`);
  console.log(`👉 위 텍스트를 복사하여 유튜브 업로드 시 '설명(Description)' 란에 붙여넣으시면`);
  console.log(`   유튜브 영상 타임라인에 자동으로 챕터 구간이 표시됩니다!\n`);
} catch (err) {
  console.error('유튜브 챕터 생성 중 오류 발생:', err);
}
