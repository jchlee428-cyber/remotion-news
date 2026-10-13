const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3001;
const PUBLIC_DIR = path.join(__dirname, '../public');
const MOCK_DATA_PATH = path.join(__dirname, '../src/News/mockData.ts');
const OUT_DIR = path.join(__dirname, '../out');

// Public 폴더의 미디어 파일 목록 조회
function getPublicMediaFiles() {
  if (!fs.existsSync(PUBLIC_DIR)) return [];
  return fs.readdirSync(PUBLIC_DIR).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov', '.webm', '.gif'].includes(ext);
  });
}

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

// mockData.ts 파싱
function readMockData() {
  try {
    const mod = loadModule(MOCK_DATA_PATH);
    return mod.defaultNewsData;
  } catch (err) {
    console.error('Error reading mockData.ts:', err);
    return null;
  }
}


function saveMockData(data) {
  const sceneBlocks = (data.scenes || []).map((s, idx) => {
    const lines = [
      `      id: ${JSON.stringify(s.id || `scene-${idx + 1}`)},`,
      `      category: ${JSON.stringify(s.category || "교회소식")},`,
      `      badgeType: ${JSON.stringify(s.badgeType || "breaking")},`,
      `      shortTitle: ${JSON.stringify(s.shortTitle || s.headline || "")},`,
      `      headline: ${JSON.stringify(s.headline || "")},`,
      `      subHeadline: ${JSON.stringify(s.subHeadline || "")},`,
      `      reporter: {`,
      `        name: ${JSON.stringify(s.reporter?.name || "방송팀")},`,
      `        role: ${JSON.stringify(s.reporter?.role || "담당자")},`,
      `        location: ${JSON.stringify(s.reporter?.location || "본당")},`,
      `      },`,
    ];

    if (s.videoSrc) {
      lines.push(`      videoSrc: staticFile(${JSON.stringify(path.basename(s.videoSrc))}),`);
      if (typeof s.videoMuted === 'boolean') {
        lines.push(`      videoMuted: ${s.videoMuted},`);
      }
      if (typeof s.videoVolume === 'number') {
        lines.push(`      videoVolume: ${s.videoVolume},`);
      }
    } else {
      lines.push(`      imageSrc: staticFile(${JSON.stringify(path.basename(s.imageSrc || "1001as.jpg"))}),`);
    }

    if (s.transitionType) {
      lines.push(`      transitionType: ${JSON.stringify(s.transitionType)},`);
    }
    lines.push(`      durationInSeconds: ${s.durationInSeconds || 4},`);
    return `    {\n${lines.join('\n')}\n    }`;
  });

  const code = `import { staticFile } from "remotion";
import { NewsBroadcastProps } from "./types";

export const defaultNewsData: NewsBroadcastProps = {
  channelName: ${JSON.stringify(data.channelName || "큰빛뉴스")},
  channelSubtext: ${JSON.stringify(data.channelSubtext || "사랑으로 소문난 교회")},
  broadcastDate: ${JSON.stringify(data.broadcastDate || "2026. 10. 12 (주일)")},
  stockTicker: ${JSON.stringify(data.stockTicker || "사랑으로 소문난 큰빛교회")},
  scenes: [
${sceneBlocks.join(',\n')}
  ],
  defaultTransitionType: ${JSON.stringify(data.defaultTransitionType || "zoom-in")},
  themeColor: ${JSON.stringify(data.themeColor || "#0052cc")},
  accentColor: ${JSON.stringify(data.accentColor || "#e60000")},
  // 🎵 배경 음악(BGM) 및 스마트 오디오 덕킹 설정
  enableBgm: ${data.enableBgm !== false},
  bgmVolume: ${typeof data.bgmVolume === 'number' ? data.bgmVolume : 0.45},
  duckingVolume: ${typeof data.duckingVolume === 'number' ? data.duckingVolume : 0.08},
  // ⚡ 씬 전환 효과음(Stinger SFX) 설정
  enableTransitionSfx: ${data.enableTransitionSfx !== false},
  sfxVolume: ${typeof data.sfxVolume === 'number' ? data.sfxVolume : 0.6}
};
`;

  fs.writeFileSync(MOCK_DATA_PATH, code, 'utf8');
}

// HTML 관리자 대시보드 마크업
const HTML_PAGE = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>큰빛뉴스 방송 제작 관제 센터 (Admin Console)</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090d16;
      color: #f1f5f9;
      font-family: 'Pretendard', sans-serif;
      padding: 30px 20px;
      line-height: 1.5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 30px;
    }
    .logo-area { display: flex; align-items: center; gap: 14px; }
    .logo-badge {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 1px;
    }
    .live-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.4);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 800;
    }
    .live-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #ef4444;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.2); }
    }
    .header-actions { display: flex; gap: 12px; }
    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-success { background: #10b981; color: white; }
    .btn-success:hover { background: #059669; }
    .btn-dark { background: rgba(255, 255, 255, 0.08); color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.15); }
    .btn-dark:hover { background: rgba(255, 255, 255, 0.15); color: white; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .card {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      padding: 24px;
      backdrop-filter: blur(12px);
      margin-bottom: 24px;
    }
    .card-title {
      font-size: 18px;
      font-weight: 800;
      color: #60a5fa;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .form-group { margin-bottom: 16px; }
    label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    input[type="text"], select, textarea {
      width: 100%;
      background: #020617;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      color: #f8fafc;
      padding: 10px 14px;
      font-size: 15px;
      font-family: inherit;
    }
    input[type="text"]:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }
    textarea { resize: vertical; min-height: 70px; }
    .range-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    input[type="range"] { flex: 1; accent-color: #3b82f6; }
    .range-val { font-size: 14px; font-weight: 800; color: #38bdf8; min-width: 48px; }

    /* Scene Card */
    .scene-card {
      background: #0b1329;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-left: 6px solid #3b82f6;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      position: relative;
    }
    .scene-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .scene-badge {
      background: #1e3a8a;
      color: #93c5fd;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 800;
    }

    .toast {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #10b981;
      color: white;
      padding: 14px 24px;
      border-radius: 10px;
      font-weight: 800;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      display: none;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo-area">
        <div class="logo-badge" id="hdrChannel">큰빛뉴스</div>
        <div class="live-indicator"><span class="live-dot"></span> BROADCAST CONTROL</div>
      </div>
      <div class="header-actions">
        <a href="http://localhost:3000" target="_blank" class="btn btn-dark">🎬 Remotion Studio 열기</a>
        <button class="btn btn-dark" onclick="copyChapters()">📋 유튜브 챕터 복사</button>
        <button class="btn btn-success" onclick="saveData()">💾 mockData.ts 즉시 저장</button>
      </div>
    </header>

    <!-- 1. 기본 방송 채널 설정 -->
    <div class="grid-2">
      <div class="card">
        <div class="card-title">📡 방송국 및 채널 정보</div>
        <div class="form-group">
          <label>방송국 / 채널 명칭</label>
          <input type="text" id="channelName">
        </div>
        <div class="form-group">
          <label>채널 슬로건 / 부제</label>
          <input type="text" id="channelSubtext">
        </div>
        <div class="form-group">
          <label>방송 일자</label>
          <input type="text" id="broadcastDate">
        </div>
        <div class="form-group">
          <label>교회 표어 / 상단 안내 문구</label>
          <input type="text" id="stockTicker">
        </div>
      </div>

      <div class="card">
        <div class="card-title">🎵 오디오 및 스마트 덕킹 설정</div>
        <div class="form-group">
          <label>배경 음악 (BGM)</label>
          <select id="enableBgm">
            <option value="true">켜기 (재생)</option>
            <option value="false">끄기 (음소거)</option>
          </select>
        </div>
        <div class="form-group">
          <label>BGM 기본 볼륨</label>
          <div class="range-wrap">
            <input type="range" id="bgmVolume" min="0" max="1" step="0.05">
            <span class="range-val" id="bgmVolumeVal">45%</span>
          </div>
        </div>
        <div class="form-group">
          <label>동영상 소리 재생 시 BGM 감소 (덕킹) 볼륨</label>
          <div class="range-wrap">
            <input type="range" id="duckingVolume" min="0" max="1" step="0.01">
            <span class="range-val" id="duckingVolumeVal">8%</span>
          </div>
        </div>
        <div class="form-group">
          <label>씬 전환 스우시 효과음 (Stinger SFX)</label>
          <select id="enableTransitionSfx">
            <option value="true">켜기</option>
            <option value="false">끄기</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 2. 뉴스 씬 에디터 -->
    <div class="card">
      <div class="card-title" style="justify-content: space-between;">
        <span>📰 뉴스 씬(Story) 순서 및 내용 편집</span>
        <button class="btn btn-primary" onclick="addScene()">+ 새 뉴스 씬 추가</button>
      </div>
      <div id="scenesContainer"></div>
    </div>

    <!-- 하단 빠른 액션 바 -->
    <div style="text-align: right; margin-top: 20px;">
      <button class="btn btn-success" style="font-size: 16px; padding: 14px 28px;" onclick="saveData()">💾 변경사항 저장 (mockData.ts 업데이트)</button>
    </div>
  </div>

  <div class="toast" id="toast">✅ 저장되었습니다! Remotion Studio에 즉시 반영됩니다.</div>

  <script>
    let appData = null;
    let mediaFiles = [];

    // 초기 데이터 로드
    async function init() {
      const [dataRes, filesRes] = await Promise.all([
        fetch('/api/data').then(r => r.json()),
        fetch('/api/files').then(r => r.json())
      ]);
      appData = dataRes;
      mediaFiles = filesRes;
      render();
    }

    function render() {
      document.getElementById('channelName').value = appData.channelName || '';
      document.getElementById('hdrChannel').innerText = appData.channelName || '큰빛뉴스';
      document.getElementById('channelSubtext').value = appData.channelSubtext || '';
      document.getElementById('broadcastDate').value = appData.broadcastDate || '';
      document.getElementById('stockTicker').value = appData.stockTicker || '';

      document.getElementById('enableBgm').value = appData.enableBgm !== false ? 'true' : 'false';
      document.getElementById('bgmVolume').value = appData.bgmVolume || 0.45;
      document.getElementById('bgmVolumeVal').innerText = Math.round((appData.bgmVolume || 0.45) * 100) + '%';
      document.getElementById('duckingVolume').value = appData.duckingVolume || 0.08;
      document.getElementById('duckingVolumeVal').innerText = Math.round((appData.duckingVolume || 0.08) * 100) + '%';
      document.getElementById('enableTransitionSfx').value = appData.enableTransitionSfx !== false ? 'true' : 'false';

      renderScenes();
    }

    // 볼륨 슬라이더 이벤트
    document.getElementById('bgmVolume').oninput = (e) => {
      document.getElementById('bgmVolumeVal').innerText = Math.round(e.target.value * 100) + '%';
    };
    document.getElementById('duckingVolume').oninput = (e) => {
      document.getElementById('duckingVolumeVal').innerText = Math.round(e.target.value * 100) + '%';
    };

    function renderScenes() {
      const container = document.getElementById('scenesContainer');
      container.innerHTML = '';

      (appData.scenes || []).forEach((scene, idx) => {
        const isVideo = scene.videoSrc || (scene.imageSrc && scene.imageSrc.endsWith('.mp4'));
        const currentFile = scene.videoSrc || scene.imageSrc || '1001as.jpg';

        const fileOptions = mediaFiles.map(f => 
          \`<option value="\${f}" \${f === currentFile ? 'selected' : ''}>\${f} \${f.endsWith('.mp4') ? '(동영상)' : '(사진)'}</option>\`
        ).join('');

        const html = \`
          <div class="scene-card" style="border-left-color: \${idx === 0 ? '#ef4444' : idx === 1 ? '#3b82f6' : '#10b981'};">
            <div class="scene-header">
              <span class="scene-badge">\${idx + 1}번 뉴스 스토리</span>
              \${appData.scenes.length > 1 ? \`<button class="btn btn-dark" style="padding: 4px 10px; color: #ef4444;" onclick="deleteScene(\${idx})">✕ 씬 삭제</button>\` : ''}
            </div>
            <div class="grid-4">
              <div class="form-group">
                <label>분류 카테고리</label>
                <input type="text" value="\${scene.category || ''}" onchange="updateScene(\${idx}, 'category', this.value)">
              </div>
              <div class="form-group">
                <label>미디어 파일 선택</label>
                <select onchange="updateMediaFile(\${idx}, this.value)">
                  \${fileOptions}
                </select>
              </div>
              <div class="form-group">
                <label>재생시간 길이</label>
                <div class="range-wrap">
                  <input type="range" min="2" max="30" step="1" value="\${scene.durationInSeconds || 4}" oninput="this.nextElementSibling.innerText = this.value + '초'; updateScene(\${idx}, 'durationInSeconds', Number(this.value));">
                  <span class="range-val">\${scene.durationInSeconds || 4}초</span>
                </div>
              </div>
              <div class="form-group">
                <label>뉴스 전환 효과 (16종)</label>
                <select onchange="updateScene(\${idx}, 'transitionType', this.value)">
                  <option value="zoom-in" \${scene.transitionType === 'zoom-in' || !scene.transitionType ? 'selected' : ''}>🔍 줌인 (기본)</option>
                  <option value="zoom-out" \${scene.transitionType === 'zoom-out' ? 'selected' : ''}>🔎 줌아웃</option>
                  <option value="fade" \${scene.transitionType === 'fade' ? 'selected' : ''}>🌫️ 페이드</option>
                  <option value="slide-left" \${scene.transitionType === 'slide-left' ? 'selected' : ''}>⬅️ 슬라이드 좌</option>
                  <option value="slide-right" \${scene.transitionType === 'slide-right' ? 'selected' : ''}>➡️ 슬라이드 우</option>
                  <option value="slide-up" \${scene.transitionType === 'slide-up' ? 'selected' : ''}>⬆️ 슬라이드 상</option>
                  <option value="slide-down" \${scene.transitionType === 'slide-down' ? 'selected' : ''}>⬇️ 슬라이드 하</option>
                  <option value="wipe-left" \${scene.transitionType === 'wipe-left' ? 'selected' : ''}>◀️ 와이프 좌</option>
                  <option value="wipe-right" \${scene.transitionType === 'wipe-right' ? 'selected' : ''}>▶️ 와이프 우</option>
                  <option value="wipe-circle" \${scene.transitionType === 'wipe-circle' ? 'selected' : ''}>🔘 원형 아이리스</option>
                  <option value="flip-x" \${scene.transitionType === 'flip-x' ? 'selected' : ''}>🔄 3D 수평 플립</option>
                  <option value="flip-y" \${scene.transitionType === 'flip-y' ? 'selected' : ''}>🔃 3D 수직 플립</option>
                  <option value="blur" \${scene.transitionType === 'blur' ? 'selected' : ''}>✨ 시네마틱 블러</option>
                  <option value="flash" \${scene.transitionType === 'flash' ? 'selected' : ''}>⚡ 뉴스 플래시</option>
                  <option value="bounce" \${scene.transitionType === 'bounce' ? 'selected' : ''}>🏀 탄성 바운스</option>
                  <option value="spin" \${scene.transitionType === 'spin' ? 'selected' : ''}>🌀 스핀 줌</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>메인 헤드라인 제목 (자동 폰트 피팅 적용)</label>
              <textarea onchange="updateScene(\${idx}, 'headline', this.value)">\${scene.headline || ''}</textarea>
            </div>
            <div class="form-group">
              <label>부제목 / 세부 공지 내용</label>
              <input type="text" value="\${scene.subHeadline || ''}" onchange="updateScene(\${idx}, 'subHeadline', this.value)">
            </div>
            <div class="grid-3">
              <div class="form-group">
                <label>취재 기자 / 담당자</label>
                <input type="text" value="\${scene.reporter?.name || '방송팀'}" onchange="updateReporter(\${idx}, 'name', this.value)">
              </div>
              <div class="form-group">
                <label>직책</label>
                <input type="text" value="\${scene.reporter?.role || '담당자'}" onchange="updateReporter(\${idx}, 'role', this.value)">
              </div>
              <div class="form-group">
                <label>장소 / 위치</label>
                <input type="text" value="\${scene.reporter?.location || '본당'}" onchange="updateReporter(\${idx}, 'location', this.value)">
              </div>
            </div>
            \${isVideo ? \`
              <div style="background: rgba(0,0,0,0.3); padding: 12px 16px; border-radius: 8px; margin-top: 10px; display: flex; gap: 20px; align-items: center;">
                <span style="font-size: 13px; font-weight: 800; color: #38bdf8;">🎬 동영상 오디오 설정:</span>
                <label style="margin: 0; display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" \${scene.videoMuted === false ? 'checked' : ''} onchange="updateScene(\${idx}, 'videoMuted', !this.checked)">
                  소리 켜기 (음소거 해제)
                </label>
              </div>
            \` : ''}
          </div>
        \`;
        container.insertAdjacentHTML('beforeend', html);
      });
    }

    function updateScene(idx, field, val) {
      appData.scenes[idx][field] = val;
    }
    function updateReporter(idx, field, val) {
      if (!appData.scenes[idx].reporter) appData.scenes[idx].reporter = {};
      appData.scenes[idx].reporter[field] = val;
    }
    function updateMediaFile(idx, filename) {
      if (filename.endsWith('.mp4') || filename.endsWith('.webm') || filename.endsWith('.mov')) {
        appData.scenes[idx].videoSrc = filename;
        delete appData.scenes[idx].imageSrc;
        if (typeof appData.scenes[idx].videoMuted !== 'boolean') {
          appData.scenes[idx].videoMuted = false;
        }
      } else {
        appData.scenes[idx].imageSrc = filename;
        delete appData.scenes[idx].videoSrc;
      }
      renderScenes();
    }
    function addScene() {
      appData.scenes.push({
        id: 'scene-' + (appData.scenes.length + 1),
        category: '새 소식',
        headline: '새로운 뉴스 헤드라인을 입력하세요.',
        subHeadline: '상세 내용을 입력하세요.',
        imageSrc: mediaFiles[0] || '1001as.jpg',
        durationInSeconds: 4,
        transitionType: 'zoom-in',
        reporter: { name: '방송팀', role: '담당자', location: '본당' }
      });
      renderScenes();
    }
    function deleteScene(idx) {
      if (confirm((idx + 1) + '번 뉴스를 삭제하시겠습니까?')) {
        appData.scenes.splice(idx, 1);
        renderScenes();
      }
    }

    async function saveData() {
      appData.channelName = document.getElementById('channelName').value;
      appData.channelSubtext = document.getElementById('channelSubtext').value;
      appData.broadcastDate = document.getElementById('broadcastDate').value;
      appData.stockTicker = document.getElementById('stockTicker').value;
      appData.enableBgm = document.getElementById('enableBgm').value === 'true';
      appData.bgmVolume = Number(document.getElementById('bgmVolume').value);
      appData.duckingVolume = Number(document.getElementById('duckingVolume').value);
      appData.enableTransitionSfx = document.getElementById('enableTransitionSfx').value === 'true';

      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData)
      });
      if (res.ok) {
        showToast('✅ mockData.ts 저장 완료! Remotion Studio에서 즉시 반영됩니다.');
      }
    }

    async function copyChapters() {
      const res = await fetch('/api/chapters').then(r => r.json());
      navigator.clipboard.writeText(res.text);
      showToast('📋 유튜브 챕터 텍스트가 클립보드에 복사되었습니다!');
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3000);
    }

    init();
  </script>
</body>
</html>
`;

// HTTP Server
const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url.split('?')[0];

  // API 1: 데이터 조회
  if (url === '/api/data' && req.method === 'GET') {
    const data = readMockData();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
    return;
  }

  // API 2: 미디어 파일 목록 조회
  if (url === '/api/files' && req.method === 'GET') {
    const files = getPublicMediaFiles();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(files));
    return;
  }

  // API 3: 데이터 저장 (mockData.ts 업데이트)
  if (url === '/api/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        saveMockData(parsed);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API 4: 유튜브 챕터 생성
  if (url === '/api/chapters' && req.method === 'GET') {
    const data = readMockData();
    const { generateYouTubeChapters } = loadModule(path.join(__dirname, '../src/News/utils/chapterUtils.ts'));
    const broadcastResult = generateYouTubeChapters(data, 'broadcast', 30);
    const shortsResult = generateYouTubeChapters(data, 'shorts', 30);
    const combined = `${broadcastResult.text}\n\n========================================\n\n${shortsResult.text}`;
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ text: combined }));
    return;
  }

  // 기본 페이지 제공
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(HTML_PAGE);
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  🚀 큰빛뉴스 방송 관제 콘솔 (Admin Web UI) 가동 완료`);
  console.log(`  🌐 웹 주소: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
