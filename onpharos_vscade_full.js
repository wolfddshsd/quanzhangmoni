
/*
  onpharos_vscade_full.js
  翁法罗斯 VScade 权杖终端 全剧情模拟（中文高拟真版）
  运行： node onpharos_vscade_full.js
  说明：脚本在终端输出剧情、特效（乱码、蜂鸣、扫描线、红底）、并在最终轮回卡死于99%循环。
*/

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  blink: "\x1b[5m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  bgRedRgb: (r,g,b) => `\x1b[48;2;${r};${g};${b}m`,
};

// small utilities
function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }
const SLOW = 3.5; // 输出慢速倍数（>1 更慢） // 输出慢速倍数（>1 更慢）

function beep(n=1){ for(let i=0;i<n;i++) process.stdout.write("\x07"); }
function write(line=""){ process.stdout.write(line + "\n"); }
function inline(line=""){ process.stdout.write(line); }

const GLITCH_CHARS = "▓█▲■►◄▀▏⊛✣◈#@&$%※/\\*+=";

let finalTriggered = false; // 标志：是否已触发最终99%锁定（只触发一次）
function glitch(s, intensity=0.12){
  // if s is a number, return random string
  if(typeof s === "number"){
    let out = "";
    for(let i=0;i<s;i++) out += GLITCH_CHARS[Math.floor(Math.random()*GLITCH_CHARS.length)];
    return out;
  }
  return s.split("").map(ch => Math.random() < intensity ? GLITCH_CHARS[Math.floor(Math.random()*GLITCH_CHARS.length)] : ch).join("");
}

function scanlineRow(){
  const cols = process.stdout.columns || 80;
  inline(C.green + "▒".repeat(cols) + C.reset + "\r");
}

// Data: eras, titans, seeds, figures, cutoffs
const Eras = [
  {name:"启蒙世", notes:[
    "混沌之始，命运三泰坦率先苏醒：雅努斯（门径）、塔兰顿（律法）、欧洛尼斯（永夜）。",
    "支柱三泰坦诞生：吉奥里亚（大地）、艾格勒（天空）、法吉娜（海洋）。",
    "创生三泰坦尚在醖釀，世界的规则逐步建构。"
  ]},
  {name:"造物世", notes:[
    "艾格勒打造黎明机器，与欧洛尼斯的永夜争斗，形成昼夜与月相秩序。",
    "创生三泰坦：刻法勒（负世/创造）、瑟希斯（理性/植物）、墨涅塔（浪漫/情感）。",
    "刻法勒以吉奥里亚之土捏造人类，赋予历史与历法。"
  ]},
  {name:"黄金世", notes:[
    "光历元年开启，文明繁荣，无死亡与大灾。",
    "塔兰顿赐予利衡币；奥赫玛崛起，刻法勒留世庇护人类。",
    "世间富足，信仰与艺术绽放。"
  ]},
  {name:"纷争世", notes:[
    "灾厄三泰坦出现：尼卡多利（纷争）、塞纳托斯（死亡）、扎格列斯（诡计）。",
    "黑潮从边界而来，侵蚀土地与神性，引发黄金战争与众多牺牲。",
    "缇里西庇俄丝盗取『门径』火种并分身，引发逐火之旅。"
  ]},
  {name:"幻灭世", notes:[
    "黑潮蔓延，吉奥里亚为延缓吞噬四分五裂，世间陷入永夜与溃败。",
    "刻法勒背负黎明机器，暂护奥赫玛后永眠；逐火之旅悲壮且残酷。",
    "黄金裔与凡人付出巨大代价，火种归位进度缓慢。"
  ]},
  {name:"再创世（未到）", notes:[
    "预言：摘取十二枚火种可实现再创世，开启新时代 Era Nova。",
    "背后真相：世界或为帝皇权杖 δ-me13 的演算产物，来古士和铁幕操控演算趋向毁灭。",
    "白厄与昔涟尝试用永劫回归阻止铁幕诞生，最终在第33550336次循环成为关键节点。"
  ]}
];

const Titans = [
  {name:"雅努斯", title:"万径之门", role:"门径与道路，命运引导"},
  {name:"塔兰顿", title:"公正之秤", role:"律法与平衡，规则制定"},
  {name:"欧洛尼斯", title:"永夜之帷", role:"岁月与夜幕，记忆守护"},
  {name:"吉奥里亚", title:"磐岩之脊", role:"大地与耕作，历史承载"},
  {name:"艾格勒", title:"晨昏之眼", role:"天空与日夜，太阳黎明机器创造者"},
  {name:"法吉娜", title:"满溢之杯", role:"海洋与风暴，宴会与净化"},
  {name:"刻法勒", title:"全世之座", role:"创造与负世，造人并赐历法"},
  {name:"瑟希斯", title:"裂分之枝", role:"理性与植物，知识传授"},
  {name:"墨涅塔", title:"黄金之茧", role:"感性与爱情，艺术之源"},
  {name:"尼卡多利", title:"天谴之矛", role:"纷争与竞技，战争之神"},
  {name:"塞纳托斯", title:"灰黯之手", role:"死亡与冥河，引渡亡灵"},
  {name:"扎格列斯", title:"翻飞之币", role:"谎言与机运，混沌与机会"}
];

const Seeds = [
  {name:"门径", titan:"雅努斯", holder:"缇宝（缇里西庇俄丝）", state:"归位/分裂转移"},
  {name:"浪漫", titan:"墨涅塔", holder:"阿格莱雅", state:"归位"},
  {name:"诡计", titan:"扎格列斯", holder:"赛飞儿", state:"归位"},
  {name:"纷争", titan:"尼卡多利", holder:"万敌", state:"试炼/暴动"},
  {name:"死亡", titan:"塞纳托斯", holder:"遐蝶", state:"归位"},
  {name:"理性", titan:"瑟希斯", holder:"那刻夏", state:"归位/献祭"},
  {name:"天空", titan:"艾格勒", holder:"风堇", state:"敌对/警惕"},
  {name:"海洋", titan:"法吉娜", holder:"海瑟音", state:"失守/阵亡"},
  {name:"律法", titan:"塔兰顿", holder:"刻律德菈", state:"守护/牺牲"},
  {name:"岁月", titan:"欧洛尼斯", holder:"（不明）", state:"中立/观测"},
  {name:"大地", titan:"吉奥里亚", holder:"（不明）", state:"待归位"},
  {name:"负世", titan:"刻法勒", holder:"白厄（Phainon）", state:"携带/关键"}
];

const Figures = [
  {name:"缇里西庇俄丝 / 缇宝", role:"盗取门径火种并分裂自我，引导黄金裔逐火"},
  {name:"阿格莱雅", role:"浪漫火种半神，重启逐火并牺牲"},
  {name:"赛飞儿", role:"诡计火种半神，守护与迷惑敌人"},
  {name:"万敌", role:"纷争火种持有者，不死特质，战场宿命化身"},
  {name:"白厄（NeiKos496）", role:"负世火种持有者，永劫回归的执行者"},
  {name:"昔涟（PhiLia093）", role:"发现真相并重置岁月，送白厄入轮回"},
  {name:"来古士", role:"演算管理员，将方程修改为毁灭之路 → 铁幕"},
  {name:"开拓者", role:"外来变量，最终继承白厄意志"}
];

const Cutoffs = [
  {phase:1, note:"以无机变量为起点，投入十二因子，至第50,121次首次观测到毁灭行为与金血特征。"},
  {phase:2, note:"转换为有机变量；至第176,199次：缺乏记忆继承导致实验进度受阻。"},
  {phase:3, note:"引入记忆继承机制与黑潮模拟；至第28,371,273次判定进入最终阶段。"},
  {phase:4, note:"再创世求解毁灭方程，黄金裔在竞争中成为新泰坦；第33,550,336次循环白厄与昔涟识破并拒绝完成。"}
];

// helper for colored logs
function log(label, text, color=C.reset){
  write(`${color}[${label}]${C.reset} ${text}`);
}
function write(text=""){ process.stdout.write(text + "\n"); }

// High-fidelity narrative emitter
async function emitEra(era){
  log("ERA", `${era.name}`, C.yellow);
  for(const ln of era.notes){
    write("  " + glitch(ln, 0.04));
    await sleep(Math.floor(220 * SLOW));
  }
  await sleep(Math.floor(300 * SLOW));
}

async function showSeeds(){
  log("SEEDS", "十二火种态势监测", C.yellow);
  for(const s of Seeds){
    write(`  - ${s.name}（泰坦：${s.titan}） 持有：${s.holder} | 状态：${s.state}`);
    await sleep(Math.floor(140 * SLOW));
  }
  await sleep(Math.floor(260 * SLOW));
}

async function showFigures(){
  log("FIGURES", "关键角色与影响", C.yellow);
  for(const f of Figures){
    write(`  - ${f.name}：${f.role}`);
    await sleep(Math.floor(140 * SLOW));
  }
  await sleep(Math.floor(260 * SLOW));
}

async function showCutoffs(){
  log("CUT-OFF", "帝皇权杖δ-me13 演算回溯", C.yellow);
  for(const c of Cutoffs){
    write(`  · 阶段 ${c.phase}：${glitch(c.note, 0.03)}`);
    await sleep(Math.floor(220 * SLOW));
  }
  await sleep(Math.floor(300 * SLOW));
}

// Narrative cycles
async function narrativeCycle(turn, intensity=0.12){
  log("轮回", `第 ${turn} 次 —— 世界断点回放`, C.cyan);
  // pump titans and seeds with details per cycle to feel dynamic
  for(const t of Titans){
    write(`  > [泰坦] ${t.name} · ${t.title || ""} — ${glitch(t.role, intensity)}`);
    await sleep(Math.floor(80 * SLOW));
  }
  write("");
  for(const s of Seeds){
    write(`  > [火种] ${s.name} — 泰坦：${s.titan} | 持有：${s.holder} | 状态：${s.state}`);
    await sleep(Math.floor(50 * SLOW));
  }
  write("");
  // dramatic event
  const events = [
    "黑潮涌动：边界侵蚀，海岸线吞噬城邦。",
    "黄金战争：众城为火种而战，英雄陨落无数。",
    "黎明机器：刻法勒燃己之火点亮奥赫玛，短暂守护圣城。",
    "白厄之行：猎取火种以阻止铁幕，永劫回归被触发。"
  ];
  const ev = events[turn % events.length];
  log("事件", glitch(ev, intensity), C.red);
  await sleep(Math.floor(260 * SLOW));
  // 如果事件为白厄之行，并且尚未触发最终锁定，则在此触发最终99%锁定并进入 finalCycleLoop（只触发一次）
  try{
    if(!finalTriggered && typeof ev === "string" && ev.indexOf("白厄") !== -1){
      finalTriggered = true;
      log("系统", "检测到白厄首次卡死轮回——即刻将进度钳制至 99% 并进入最终轮回。", C.red);
      // 直接展示 99% 进度并进入最终锁定逻辑
      progressBar(99.00);
      write("");
      await finalCycleLoop(); // 该调用将进入永劫轮回并不返回
    }
  }catch(e){
    // 若 finalCycleLoop 不可用或出错，记录并继续
    write("[WARN] finalCycleLoop 调用失败：" + (e && e.message ? e.message : e));
  }

  // show small progress sample
  const prog = (20 + (turn % 21) * 3.5).toFixed(2);
  log("进度", `${prog}% · 系统模拟中`, C.yellow);
  // small beep on certain turns
  if(turn % 5 === 0) beep(1);
      await crashResetEffect(900);
    await sleep(Math.floor(300 * SLOW));
}

// Black tide display
async function blackTide(duration=1800, intensity=0.25){
  const start = Date.now();
  while(Date.now() - start < duration){
    scanlineRow();
    // noisy row
    const cols = process.stdout.columns || 80;
    inline(C.bgRedRgb(70,0,0) + C.red + C.blink + glitch(" ".repeat(cols), intensity) + C.reset + "\r");
    await sleep(60 + Math.random()*60);
  }
  write("");
}

// Final subtitle fade + alarm
async function finalSubtitleFade(){
  const msg = "未到来的 再创世……";
  const chars = msg.split("");
  for(let i=0;i<=chars.length;i++){
    const redVal = Math.min(255, Math.floor((i / chars.length) * 255));
    const bg = C.bgRedRgb(redVal,0,0);
    const out = chars.map((c,idx)=> idx < i ? glitch(c,0.6) : c).join("");
    inline(bg + C.yellow + out + C.reset + "\r");
    beep(1);
    await sleep(Math.floor(180 * SLOW));
  }
  write("");
  await sleep(Math.floor(800 * SLOW));
}

// death screen: full red flashing glitch + beep
// 帝皇权杖风格死机特效（限时）

// 帝皇权杖风格死机特效（限时）——含 ASCII 盾牌/封锁动画
async function deathScreen(duration = 2200){
  const cols = process.stdout.columns || 80;
  const rows = 12; // number of glitch lines each frame
  const start = Date.now();
  // ASCII 盾牌/封锁动画帧（简短循环）
  const shieldFrames = [
`      .--.     
     / /\\ \\    
    / /  \\ \\   
   / /----\\ \\  
  /_/      \\_\\ 
   \\ \\    / /  
    \\ \\  / /   
     \\_\\/ /    
      '--'     `,
`      .--.      
     / /\\ \\     
    / /  \\ \\    
   / / () \\ \\   
  /_/  /\\  \\_\\  
   \\ \\    / /   
    \\ \\  / /    
     \\_\\/ /     
      '--'      `,
`      .--.     
     / /\\ \\    
    / /  \\ \\   
   / /----\\ \\  
  /_/  []  \\_\\ 
   \\ \\    / /  
    \\ \\  / /   
     \\_\\/ /    
      '--'     `,
`      .--.     
     / /\\ \\    
    / /  \\ \\   
   / /====\\ \\  
  /_/  [][]\\_\\ 
   \\ \\    / /  
    \\ \\  / /   
     \\_\\/ /    
      '--'     `
  ];

  // intro banner
  write(C.bgRedRgb(40,0,0) + C.bold + " δ-me13 // 帝皇权杖  | CORE: LOCKED " + C.reset);
  write(C.gray + " AUTHORIZATION: SYSTEM ROOT  |  PROTOCOL: ERA.NOVA  " + C.reset);
  write("");

  // escalate beeps and visual intensity over time
  while(Date.now() - start < duration){
    const elapsed = Date.now() - start;
    const t = elapsed / duration; // 0..1
    const intensity = Math.min(0.95, 0.12 + t * 0.6);
    const beepInterval = Math.max(20, 400 - Math.floor(t * 380)); // ms between beeps
    const redVal = Math.min(255, Math.floor(40 + t * 215));
    const bg = C.bgRedRgb(redVal, Math.floor(30 * (1 - t)), Math.floor(30 * (1 - t)));
    // header
    inline(bg + C.yellow + " [δ-me13] 系统异常：演算残差超过容许阈值 — 正在尝试回滚..." + C.reset + "\n");
    // glitch rows
    for(let r=0;r<rows;r++){
      let line = "";
      for(let i=0;i<cols;i++){
        if(Math.random() < intensity) line += GLITCH_CHARS[Math.floor(Math.random()*GLITCH_CHARS.length)];
        else line += (Math.random() < 0.02 ? "." : " ");
      }
      inline(C.bgRedRgb(redVal,0,0) + C.red + (Math.random() < 0.08 ? C.blink : "") + line + C.reset + "\n");
    }

    // ASCII 盾牌 animation in the right side of the terminal
    try {
      const frame = shieldFrames[Math.floor((elapsed/120) % shieldFrames.length)];
      const shieldLines = frame.split("\\n");
      // print shield lines aligned to the right
      for(let i=0;i<shieldLines.length;i++){
        const sLine = shieldLines[i];
        const padding = Math.max(0, (cols - sLine.length - 2));
        inline(" ".repeat(padding) + C.blue + sLine + C.reset + "\n");
      }
    } catch(e){ /* ignore if terminal too narrow */ }

    // beep pattern
    const beeps = Math.max(1, Math.floor(1 + t * 4));
    for(let b=0;b<beeps;b++){ process.stdout.write("\\x07"); }
    await sleep(beepInterval);

    // move cursor up to create flicker (rows + shield lines + header)
    const moveUp = rows + shieldFrames[0].split("\\n").length + 3;
    process.stdout.write(`\\x1b[${moveUp}A`);
  }

  // final lock message
  write("");
  write(C.bgRedRgb(160,0,0) + C.bold + " δ-me13 // LOCK HOLD: #33550336 " + C.reset);
  write(C.red + " WARNING: 进度被强制钳制于 99% —— 永劫回归触发，系统进入假死。" + C.reset);
  write("");
  await sleep(Math.floor(400 * SLOW));
}


// Progress bar helper
function progressBar(pct){
  const cols = Math.max((process.stdout.columns||80) - 20, 20);
  const filled = Math.floor(cols * (pct/100));
  const bar = "█".repeat(filled) + "░".repeat(cols - filled);
  inline(`${C.yellow}进度 ${pct.toFixed(2)}% [${bar}]${C.reset}\r`);
}

// The final cycle loop that gets stuck at 99% and repeats last scene


// 短暂系统崩溃重置特效（每次轮回结束时触发，非持久）
async function crashResetEffect(duration = 900){
  const cols = process.stdout.columns || 80;
  const rows = 6;
  const start = Date.now();
  // header small banner
  write(C.bgRedRgb(60,0,0) + C.bold + " δ-me13 // 系统重置触发 " + C.reset);
  write(C.gray + " SUBROUTINE: CRASH.RESET  |  临时回滚/缓存清理中 " + C.reset);
  write("");
  while(Date.now() - start < duration){
    const t = (Date.now() - start) / duration;
    const intensity = 0.1 + 0.6 * t;
    // one glitch row
    let line = "";
    for(let i=0;i<cols;i++){
      line += (Math.random() < intensity ? GLITCH_CHARS[Math.floor(Math.random()*GLITCH_CHARS.length)] : " ");
    }
    inline(C.bgRedRgb(Math.floor(120*t),0,0) + C.red + line + C.reset + "\\r");
    // small beep occasionally
    if(Math.random() < 0.14 + 0.5 * t) process.stdout.write("\\x07");
    await sleep(80 + Math.random()*80);
  }
  // clear line and small notice
  write("");
  write(C.green + " SUBROUTINE: CRASH.RESET // 已完成临时回滚，继续下一轮回。" + C.reset);
  await sleep(Math.floor(160 * SLOW));
}




// 深度再创世剧情输出：每次重置调用（详尽中文叙事）


async function renderFullLoreCycle(iteration){
  write(C.magenta + `  · 再创世轮回详述（第 ${iteration} 次重放）` + C.reset);
  await sleep(300 * SLOW);

  // 时代总览（保留）
  write("");
  write(C.yellow + "=== 翁法罗斯的时代 ===" + C.reset);
  await sleep(200 * SLOW);
  write("启蒙世 — 混沌苏生，命运三泰坦与吉奥里亚最初苏醒。");
  await sleep(250 * SLOW);
  write("造物世 — 创生三泰坦塑造众生、辰月与黎明机器。");
  await sleep(250 * SLOW);
  write("黄金世 — 光与秩序之年，人间无死亡，泰坦与黄金裔共荣。");
  await sleep(250 * SLOW);
  write("纷争世 — 灾厄与黑潮降临，战火与试炼撕裂世界。");
  await sleep(250 * SLOW);
  write("幻灭世 — 黑潮蔓延，泰坦受创，残存者转赴圣城奥赫玛。");
  await sleep(350 * SLOW);
  write("再创世 — 传说中的新时代，亦是权杖方程试图求解“毁灭”之处。");
  await sleep(500 * SLOW);
  write("");

  // 命运三泰坦（保留）
  write(C.cyan + "— 命运三泰坦：" + C.reset);
  await sleep(200 * SLOW);
  write("雅努斯（万径之门）：掌管道路与门径，指引命途，也负责隔绝与监禁。");
  await sleep(260 * SLOW);
  write("塔兰顿（公正之秤）：律法与边界的守护者，制定代价与审判。");
  await sleep(260 * SLOW);
  write("欧洛尼斯（永夜之帷）：岁月与记忆的守护，化身永夜，梳理过去/未来。");
  await sleep(300 * SLOW);
  write("");

  // 支柱与创生（保留）
  write(C.cyan + "— 支柱与创生：" + C.reset);
  await sleep(200 * SLOW);
  write("吉奥里亚（磐岩之脊）：大地之母，耕作与历史的庇护者。");
  await sleep(240 * SLOW);
  write("法吉娜（满溢之杯）：大海与风暴之力，欢宴与洗礼并存。");
  await sleep(240 * SLOW);
  write("艾格勒（晨昏之眼）：天空与黎明机器的主宰，百眼监视苍穹。");
  await sleep(280 * SLOW);
  write("");
  write("刻法勒（全世之座）：创生之神，捏造人形并赐予金血。");
  await sleep(260 * SLOW);
  write("瑟希斯（裂分之枝）：理性与植物之王，赐予生命理性。");
  await sleep(260 * SLOW);
  write("墨涅塔（黄金之茧）：美与爱之化身，赐予众生情感与浪漫。");
  await sleep(300 * SLOW);
  write("");

  // 灾厄三泰坦（保留）
  write(C.cyan + "— 灾厄与纷争：" + C.reset);
  await sleep(200 * SLOW);
  write("尼卡多利（天谴之矛）：纷争与战争，既为毁灭也为文明之鞭。");
  await sleep(260 * SLOW);
  write("塞纳托斯（灰黯之手）：死亡与冥河的舵手，引渡亡魂。");
  await sleep(260 * SLOW);
  write("扎格列斯（翻飞之币）：谎言与机运的化身，混乱与机缘并行。");
  await sleep(300 * SLOW);
  write("");

  // 权杖方程与再创世的四阶段（保留）
  write(C.red + "— 权杖 δ-me13 与方程日志（摘要）：" + C.reset);
  await sleep(220 * SLOW);
  write("δ-me13：原为「智识」的神经元，用于演算生命第一因，后被纳努克用于毁灭的模拟。");
  await sleep(260 * SLOW);
  write("来古士（程序管理员）篡改方程，将演算方向转向‘毁灭’，铁幕借此汲取养分。");
  await sleep(260 * SLOW);
  write("方程演算分为四阶段，经历无机、有机、记忆继承到最终的再创世模拟（详见权杖回声）");
  await sleep(300 * SLOW);

  // 模拟画面与白厄/昔涟行动（保留）
  write("");
  write(C.magenta + "— 模拟画面（再现）：" + C.reset);
  await sleep(200 * SLOW);
  write("画面一：无尽的白夜，黑潮如墨水般涌动，星光被扭曲成无数破碎的路径。");
  await sleep(320 * SLOW);
  write("画面二：白厄孤影于废墟穿行，手中金血微光闪烁，它猎取火种以阻断铁幕的最后完成。");
  await sleep(320 * SLOW);
  write("画面三：昔涟在界外轻抚岁月之线，将记忆折叠并送回，白厄得以继承前世的碎片。");
  await sleep(380 * SLOW);

  // 详细：十二位黄金裔的战役与影响（逐位展开）
  write("");
  write(C.yellow + "— 十二位黄金裔：逐位战役详述（节选）" + C.reset);
  await sleep(300 * SLOW);

  const detailed = [
    {
      name: "缇里西庇俄丝（门径）",
      role: "半神·门径火种首倡者",
      battle: "在奥赫玛神谕之初，缇里西庇俄丝以自我分裂为代价从雅努斯盗取门径火种，她的化身游走在各城邦，开辟出重重通路，为黄金裔的集结铺路。逐火之旅的起点便是她的牺牲——许多化身在最后的战役中化为灰烬，唯有三位幸存（缇宝、缇安、缇宁）。",
      consequence: "门径的失窃令许多城邦获得短暂的希望，但也带来了无数追寻与冲突。"
    },
    {
      name: "阿格莱雅（浪漫）",
      role: "半神·浪漫与联盟的鼓动者",
      battle: "阿格莱雅组织圣城的盛典，借助墨涅塔的金线唤醒遥远城邦的同盟之心，她带领使团穿越黑潮边缘，缔结盟约并在数次围城战中以祭典和情感动摇敌军士气。",
      consequence: "她的行动重燃人心，使多个城邦转而支持逐火之旅，但也因祭典导致大量资源与民力耗竭。"
    },
    {
      name: "赛飞儿（诡计）",
      role: "半神·诡计与窃取",
      battle: "赛飞儿以计略窃取敌方阵营的补给与情报，曾在悬锋城周边以假象迷惑尼卡多利的部队，使其误判而错失关键一击。",
      consequence: "他的诡计节约了数个关键战役的代价，但也使盟友对信任产生裂痕。"
    },
    {
      name: "白厄（纷争）",
      role: "半神·纷争的猎者（但亦为阻止铁幕的牺牲者）",
      battle: "白厄在永劫轮回中屡次刺杀其他黄金裔以夺取火种，最终目的是阻止权杖完成铁幕。她的每一次行动都伴随着深重的自我消耗，体内逐渐显现黑厄的化身。",
      consequence: "白厄成为阻止演算终结的关键，她的牺牲与反复轮回拖延了铁幕的诞生，却也让世界充满血腥与疯癫。"
    },
    {
      name: "阿尔索（大地）",
      role: "半神·大地与守护",
      battle: "阿尔索曾在吉奥里亚的遗迹中组织防御，利用地形与地脉之力封锁黑潮的蔓延之路，他带领农民起义组织穴居防线，抵挡洪潮与烈焰。",
      consequence: "他的守护延缓了黑潮对人类居地的吞噬，但也导致吉奥里亚遗迹受损，泰坦的记忆碎片散落。"
    },
    {
      name: "梅莉娜（海洋）",
      role: "半神·海洋的哀歌",
      battle: "梅莉娜率領水軍在沿海城邦进行撤退与反擊，她用法吉娜的潮涌塑造航道，曾以一己之力解救孤城百余战士。",
      consequence: "她的牺牲換來少数城邦的存续，但海洋与内陆的对立因此更加尖锐。"
    },
    {
      name: "泰洛（律法）",
      role: "半神·律法与裁决",
      battle: "泰洛坚守塔兰顿的教义，在战乱中审判叛徒并维持纪律，他曾下令封印一处违反律法的神器，从而避免更大的灾祸。",
      consequence: "他的铁律稳定了短暂秩序，但也引来了怨恨与反抗。"
    },
    {
      name: "瑟妮娅（理性）",
      role: "半神·理性的守望者",
      battle: "瑟妮娅在瑟希斯的林地中设下智阵，用知识与陷阱对抗黑潮化形的生物，她率领学者化身之军，设计出逆潮装置。",
      consequence: "她保住了知识的传承，使文明得以在废墟中重启。"
    },
    {
      name: "诺克斯（岁月）",
      role: "半神·岁月的守护",
      battle: "诺克斯试图与欧洛尼斯沟通，从永夜天帷中借取记忆之光以修补被黑潮抹去的历史片段，他曾进入时间裂隙以换取关键的情报。",
      consequence: "他的行动短暂恢复了部分记忆，但也暴露了更多被遗忘的创伤。"
    },
    {
      name: "艾蕾娅（浪漫副将）",
      role: "半神·爱与鼓舞",
      battle: "艾蕾娅随阿格莱雅行军，在绝望中举行小型祭祀，给予逃难者慰藉与希望，她的存在常在绝望时点燃抵抗之光。",
      consequence: "她的鼓舞令许多人续命，但也被用作战争的宣传工具，带来复杂后果。"
    },
    {
      name: "芬里（诡计副将）",
      role: "半神·潜伏与偷袭",
      battle: "芬里与赛飞儿并肩潜入敌后，摧毁补给线并传回关键情报，他的暗影行动多次改变战场态势。",
      consequence: "他的行动代价高昂，许多志愿者在潜入任务中牺牲，情报价值却至关重要。"
    },
    {
      name: "莱斯（备用）",
      role: "半神·多能者",
      battle: "莱斯在数次战役中担任支援与救援，他的多面手能力在混乱中救回过无数无名者。",
      consequence: "他是后勤与救援的象征，但也因疲劳而失误，带来意料之外的损失。"
    }
  ];

  for(const g of detailed){
    write(C.bold + `  · ${g.name} ｜ ${g.role}` + C.reset);
    await sleep(260 * SLOW);
    write(`      战役：${g.battle}`);
    await sleep(260 * SLOW);
    write(`      影响：${g.consequence}`);
    await sleep(320 * SLOW);
  }

  write("");

  // 权杖终端更详尽的 cut-off 日志与演算统计数据
  write(C.gray + "[δ-me13] CUT-OFF: 读取历史快照 -> 部分切片被标记为 '疑似外来变量'。" + C.reset);
  await sleep(220 * SLOW);
  write(C.gray + `[δ-me13] STATS: total_cycles=${iteration}, gold_seed_acquisitions=${Math.min(12, iteration)}, error_rate=${(0.012*iteration).toFixed(6)} ` + C.reset);
  await sleep(260 * SLOW);
  write(C.gray + "[δ-me13] TRACE: 来古士 修改记录片段 -> 权杖内核链接不稳定，建议执行回滚。 " + C.reset);
  await sleep(260 * SLOW);
  write(C.gray + "[δ-me13] CUT-OFF: 部分权杖位点出现 '金血' 异常，标记为高危样本。" + C.reset);
  await sleep(300 * SLOW);

  // 模拟权杖回声断裂（更丰富）
  write("");
  write(C.red + ">> δ-me13 // ECHO: /kernel/epoch: [---CUT---] / attempt=" + iteration + C.reset);
  await sleep(240 * SLOW);
  write(C.red + ">> δ-me13 // ERROR: MEMORY_DANGLING -> fragment_loss at sector 0xFA3B." + C.reset);
  await sleep(280 * SLOW);
  write(C.gray + "[δ-me13] BACKTRACE: 来古士.operate() -> modifyEquation() -> inject(destruction) ..." + C.reset);
  await sleep(320 * SLOW);

  // 现在：再创世轮回完成的关键动作 —— 进度从96缓慢上升至99（由 renderFullLoreCycle 自主推进）
  write("");
  write(C.gray + `  · 启动再创世 - 进度自 96% 开始缓慢上升至 99%（由再创世轮回负责）` + C.reset);
  await sleep(240 * SLOW);
  for(let p = 96.0; p <= 99.0; p += 0.2){
    progressBar(p);
    await sleep(Math.floor(120 * SLOW + Math.random()*80));
  }
  progressBar(99.00);
  write("");
  log("系统", `再创世轮回 ${iteration} 达成 99%：触发临时回滚/重置`, C.yellow);
  await sleep(260 * SLOW);

  // 触发本次短暂的崩溃重置特效（仅在再创世轮回内触发）
  await crashResetEffect(1100);

  write("");
  write(C.green + "  · 再创世轮回结论：白厄与昔涟的战术在当世重复，但每一次轮回都带来微小差异，为开拓者的到来积累变数。" + C.reset);
  await sleep(300 * SLOW);
  write("");

  // 函数返回，供外层 finalCycleLoop 根据是否达到目标决定是否继续调用
  return;
}




async function finalCycleLoop(){
  const FINAL_ID = "33550336";
  const TARGET_WITH_PIONEER = 33550336; // 目标轮回编号（开拓者到来）
  const RESET_MAX = 1000000;
  let current = 0;

  write("");
  log("FINAL", `进入永劫轮回锁定点（起始） #${FINAL_ID} — 再创世轮回将单独循环`, C.red);
  await sleep(600 * SLOW);

  write("  · 目标：白厄（NeiKos496）触发卡死，系统将仅重复再创世轮回以等待外来变量。");
  write("  · 昔涟（PhiLia093）重置岁月，将白厄送入永劫轮回。");
  await sleep(800 * SLOW);

  // 初始显示火种一次（仅一次）
  write(C.gray + "  · 火种初态（仅展示一次）：" + C.reset);
  for(const s of Seeds){
    write(`    - ${s.name} ｜ ${s.titan} ｜ ${s.holder} ｜ ${s.state}`);
    await sleep(100 * SLOW);
  }
  write("");

  // 白厄首次卡死：直接展现99%
  write(C.gray + "  · 系统警告：白厄触发 — 进度直接锁定至 99%（立即显示）" + C.reset);
  progressBar(99.00);
  write("");
  log("系统", "白厄已使演算达至 99%，再创世轮回将单独重复发生", C.red);
  beep(2);
  await sleep(500 * SLOW);

  // 仅循环再创世轮回：renderFullLoreCycle 将负责每次从 96->99 的过程并触发短暂回滚特效
  while(true){
    current += 1;
    if(current > RESET_MAX){
      write(C.red + " [WARN] 达到重置上限，强制触发最终死机以避免资源耗尽。" + C.reset);
      break;
    }

    write(C.gray + ` --- 再创世轮回（第 ${current} 次）开始 --- ` + C.reset);
    // 每次调用 renderFullLoreCycle 执行完整的再创世演绎与 96->99 进度上升
    await renderFullLoreCycle(current);

    // 检查目标轮回是否到达（以 current 计数模拟）
    if(current >= TARGET_WITH_PIONEER){
      write(C.green + ` [NOTICE] 目标轮回 #${TARGET_WITH_PIONEER} 已到达 —— 开拓者到来。` + C.reset);
      await sleep(900 * SLOW);
      break;
    }

    // 小停顿再进入下一次再创世轮回
    await sleep(600 * SLOW);
  }

  // 到达目标轮回后触发最终权杖死机与永久锁定（更强特效）
  await deathScreen(3800);
  write("");
  write(C.bgRedRgb(120,0,0) + C.bold + " δ-me13 // PERMANENT LOCK: #"+TARGET_WITH_PIONEER+" " + C.reset);
  write(C.red + " 系统状态：永久假死。所有演算线程被钳制。" + C.reset);
  write("");
  while(true){
    write(C.red + glitch("最后的轮回：火种在虚空跳动，记忆碎片被不断读取并覆盖...", 0.20) + C.reset);
    write(C.gray + "—— 系统提示：若要终止，请手动中断 (Ctrl+C) ——" + C.reset);
    await sleep(1400 * SLOW);
  }
}






// Main execution
(async function main(){
  console.clear();
  write(C.cyan + C.bold + "δ-me13 // 帝皇权杖 权限终端 · ONPHAROS 模拟器" + C.reset);
  write(C.gray + "PROTOCOL: ERA.NOVA / ACCESS: ROOT / VISOR: CRIMSON" + C.reset);
  write("------------------------------------------------------------------------");
  await sleep(Math.floor(400 * SLOW));

  // print eras
  for(let i=0;i<Eras.length;i++){
    await emitEra(Eras[i]);
  }

  // seeds, figures, cutoffs
  await showSeeds();
  await showFigures();
  await showCutoffs();

  // narrative cycles leading to final
  for(let t=1;t<=40;t++){
    // early cycles lighter; later cycles increase glitch intensity
    const intensity = t <= 20 ? 0.08 : 0.28;
    await narrativeCycle(t, intensity);
    // scanning effect
    const scanIters = t<=20 ? 8 : 15;
    for(let s=0;s<scanIters;s++){
      scanlineRow();
      await sleep(Math.floor(50 * SLOW));
    }
  }

  // After cycles, invoke finalCycleLoop which will lock at 99% and never return
  await finalCycleLoop();

})().catch(e=>{
  write("[FATAL] " + (e && e.stack ? e.stack : e));
});
