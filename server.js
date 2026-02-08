const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔐 [SECURITY] Supabase 설정 (환경변수가 없으면 Mock 모드로 동작)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sbAdmin = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

// ==========================================================================
// 1. DATA_SHEET (15 Landscape Types Optimized)
// ==========================================================================
const DATA_SHEET = {
    "config": { "masters": [] },
    "country": [
        "South Korea (대한민국)", "Kyoto, Japan (일본 교토)", "New York, USA (미국 뉴욕)", 
        "London, UK (영국 런던)", "Paris, France (프랑스 파리)", "Singapore (싱가포르)", 
        "Bali, Indonesia (인도네시아 발리)", "Dubai, UAE (두바이)", "Scandinavian (북유럽)", 
        "Mediterranean (지중해)"
    ],
    "region": [
        "Urban High-Density (도심 고밀도)", "Suburban Residential (교외 주거지)", "Coastal Area (해안가)", 
        "Mountainous Terrain (산악 지형)", "Riverfront (강변)", "Historic District (역사 지구)", 
        "Industrial Complex (산업 단지)", "University Campus (대학 캠퍼스)"
    ],
    "site": [
        "Flat Terrain (평지)", "Slope/Hillside (경사지/법면)", "Rooftop/Artificial Ground (옥상/인공지반)", 
        "Sunken Courtyard (성큰/지하 정원)", "Narrow Linear (좁은 선형)", "Open Plaza (광장)", 
        "Wetland/Water Edge (습지/수변)", "Roadside (도로변)"
    ],
    // 🌳 [CORE] 5대 대분류 -> 15개 세부 유형 매핑
    "usage_mapping": {
        "1.주거 조경 (Residential)": [
            "Private Garden (단독주택 정원/중정)", 
            "Apartment Complex (공동주택/아파트 조경)", 
            "Mixed-Use/Officetel (주상복합/오피스텔/인공지반)"
        ],
        "2.도시/공공 조경 (Urban & Public)": [
            "Urban Park (도시공원/근린공원)", 
            "Streetscape (가로환경/보행로)", 
            "Urban Plaza (광장/오픈스페이스)"
        ],
        "3.상업/업무 조경 (Commercial)": [
            "Corporate Landscape (사옥/오피스 공개공지)", 
            "Commercial/Resort (상업시설/호텔/리조트)", 
            "Theme Park (테마파크/위락단지)"
        ],
        "4.특수/생태 조경 (Specialized)": [
            "Ecological Park/Biotope (생태공원/비오톱)", 
            "Healing Garden (치유 정원/의료시설)", 
            "Campus Landscape (학교/캠퍼스)"
        ],
        "5.인프라/기타 조경 (Infrastructure)": [
            "Road & Traffic (도로/교통시설/휴게소)", 
            "Industrial Landscape (산업단지/공장 완충녹지)", 
            "Cultural/Traditional (문화재/전통 조경)"
        ]
    },
    "style": [
        "Modern Minimalist (모던 미니멀리즘)", "Naturalistic (자연주의/Piet Oudolf)", 
        "Traditional Korean (한국 전통)", "Japanese Zen (일본식 젠)", "English Cottage (영국식)", 
        "Tropical Resort (열대 휴양지)", "Ecological/Wild (생태적/야생)", "Industrial Chic (인더스트리얼)", 
        "Parametric/Futuristic (파라메트릭/미래지향적)"
    ],
    "mat": [ // Hardscape Materials
        "Granite Pavers (화강석 포장)", "Permeable Pavers (투수 블록)", "Wood Decking (목재 데크)", 
        "Basalt Brick (현무암 벽돌)", "Decomposed Granite (마사토)", "River Gravel (강자갈)", 
        "Corten Steel (코르텐강)", "Exposed Concrete (노출 콘크리트)", "Rubber Chip (탄성 고무칩)", 
        "Sand (모래)", "Grass Pavers (잔디 블록)"
    ],
    "planting": [ // Softscape Palette
        "Lush Canopy Trees (대형 녹음수)", "Native Wildflowers (자생 야생화)", "Ornamental Grasses (그라스류)", 
        "Pine Trees (소나무 군락)", "Bamboo Grove (대나무 숲)", "Aquatic Plants (수생식물)", 
        "Dense Buffer Planting (차폐 식재)", "Medicinal/Herbal Plants (약용/허브)", 
        "Vertical Green Wall (벽면 녹화)", "Manicured Lawn (잔디 광장)"
    ],
    "detail": [ // Amenities & Features
        "Water Feature/Mirror Pond (수경시설)", "Pergola/Shelter (파고라/휴게시설)", 
        "Floor Fountain (바닥 분수)", "Rain Garden/Bioswale (레인가든/식생체류지)", 
        "Soundproof Wall (방음벽)", "Art Sculpture (조형물)", "Play Structure (놀이시설)", 
        "Stone Pagoda/Wall (석탑/담장)", "Smart Bench/Pole (스마트 시설물)"
    ],
    "light": ["Dappled Sunlight", "Warm Pole Lights", "Up-lighting on Trees", "Linear Step Lights", "Moonlight", "Indirect Strip Lights"],
    "season": ["Spring (Cherry Blossom)", "Summer (Lush Green)", "Autumn (Maple Red)", "Winter (Snowy)", "Rainy Season"],
    "ratio": ["--ar 16:9", "--ar 4:3", "--ar 1:1", "--ar 9:16", "--ar 3:2"]
};

// ==========================================================================
// 2. 15 THEME PRESETS (Mapped to Data Sheet)
// ==========================================================================
const COMMON = { s14: "Photorealistic", s15: "Lumion 2024", s16: "Eye-level", s22: "24mm Wide", s18: "--ar 16:9" };

const THEME_PRESETS = {
    // === 1. 주거 조경 (Residential) ===
    'res_private': [{ ...COMMON, s3: "1.주거 조경 (Residential)", s4: "Private Garden (단독주택 정원/중정)", s5: "Modern Minimalist", s19: "Manicured Lawn", s6: "Basalt Brick", s23: "Water Feature/Mirror Pond", boost: "luxury private villa, inner courtyard (Jung-jeong), cozy terrace, lifestyle reflection, high privacy" }],
    'res_apt': [{ ...COMMON, s3: "1.주거 조경 (Residential)", s4: "Apartment Complex (공동주택/아파트 조경)", s5: "Naturalistic", s19: "Pine Trees", s6: "Granite Pavers", s23: "Pergola/Shelter", boost: "large apartment central plaza, community park, water playground, lush canopy trees, walking trail" }],
    'res_complex': [{ ...COMMON, s3: "1.주거 조경 (Residential)", s4: "Mixed-Use/Officetel (주상복합/오피스텔/인공지반)", s5: "Modern Minimalist", s19: "Ornamental Grasses", s6: "Wood Decking", s23: "Smart Bench/Pole", s1: "Urban High-Density", boost: "rooftop garden, artificial ground greening, sky lounge, urban oasis, intensive green roof" }],

    // === 2. 도시/공공 조경 (Urban & Public) ===
    'urb_park': [{ ...COMMON, s3: "2.도시/공공 조경 (Urban & Public)", s4: "Urban Park (도시공원/근린공원)", s5: "Ecological/Wild", s19: "Lush Canopy Trees", s6: "Decomposed Granite", s23: "Pergola/Shelter", boost: "neighborhood park, open lawn, citizen rest area, sustainable park design, public access" }],
    'urb_street': [{ ...COMMON, s3: "2.도시/공공 조경 (Urban & Public)", s4: "Streetscape (가로환경/보행로)", s5: "Modern Minimalist", s19: "Vertical Green Wall", s6: "Permeable Pavers", s23: "Smart Bench/Pole", boost: "pedestrian friendly street, linear park, street furniture, avenue trees, greenway" }],
    'urb_plaza': [{ ...COMMON, s3: "2.도시/공공 조경 (Urban & Public)", s4: "Urban Plaza (광장/오픈스페이스)", s5: "Modern Minimalist", s19: "Manicured Lawn", s6: "Granite Pavers", s23: "Floor Fountain", boost: "city landmark, event space, open gathering area, hardscape focus, urban node" }],

    // === 3. 상업/업무 조경 (Commercial) ===
    'comm_office': [{ ...COMMON, s3: "3.상업/업무 조경 (Commercial)", s4: "Corporate Landscape (사옥/오피스 공개공지)", s5: "Modern Minimalist", s19: "Bamboo Grove", s6: "Exposed Concrete", s23: "Art Sculpture", boost: "company headquarters, public open space (Gong-gae-gong-ji), atrium garden, corporate identity, employee rest" }],
    'comm_mall': [{ ...COMMON, s3: "3.상업/업무 조경 (Commercial)", s4: "Commercial/Resort (상업시설/호텔/리조트)", s5: "Tropical Resort", s19: "Lush Canopy Trees", s6: "Wood Decking", s23: "Water Feature/Mirror Pond", boost: "shopping mall outdoor terrace, luxury hotel garden, experiential space, stay-cation vibe" }],
    'comm_theme': [{ ...COMMON, s3: "3.상업/업무 조경 (Commercial)", s4: "Theme Park (테마파크/위락단지)", s5: "Parametric/Futuristic", s19: "Native Wildflowers", s6: "Rubber Chip", s23: "Play Structure", boost: "amusement park masterplan, fantasy landscape, colorful, large scale leisure facility" }],

    // === 4. 특수/생태 조경 (Specialized) ===
    'spec_eco': [{ ...COMMON, s3: "4.특수/생태 조경 (Specialized)", s4: "Ecological Park/Biotope (생태공원/비오톱)", s5: "Ecological/Wild", s19: "Aquatic Plants", s6: "Wood Decking", s23: "Rain Garden/Bioswale", s2: "Wetland/Water Edge", boost: "biodiversity, wetland restoration, wildlife habitat, LID (Low Impact Development) techniques, natural succession" }],
    'spec_heal': [{ ...COMMON, s3: "4.특수/생태 조경 (Specialized)", s4: "Healing Garden (치유 정원/의료시설)", s5: "Naturalistic", s19: "Medicinal/Herbal Plants", s6: "Decomposed Granite", s23: "Pergola/Shelter", boost: "hospital therapy garden, sensory experience, wheelchair accessible, calming atmosphere, rehabilitation" }],
    'spec_campus': [{ ...COMMON, s3: "4.특수/생태 조경 (Specialized)", s4: "Campus Landscape (학교/캠퍼스)", s5: "Traditional Korean", s19: "Pine Trees", s6: "Permeable Pavers", s23: "Stone Pagoda/Wall", boost: "university campus, academic atmosphere, school forest, eco-learning ground, history and tradition" }],

    // === 5. 인프라/기타 조경 (Infrastructure) ===
    'inf_road': [{ ...COMMON, s3: "5.인프라/기타 조경 (Infrastructure)", s4: "Road & Traffic (도로/교통시설/휴게소)", s5: "Ecological/Wild", s19: "Native Wildflowers", s6: "Concrete Pavers", s23: "Soundproof Wall", boost: "highway slope greening, rest area landscape, functional planting, dust mitigation, road safety" }],
    'inf_ind': [{ ...COMMON, s3: "5.인프라/기타 조경 (Infrastructure)", s4: "Industrial Landscape (산업단지/공장 완충녹지)", s5: "Modern Minimalist", s19: "Dense Buffer Planting", s6: "Permeable Pavers", s23: "Rain Garden/Bioswale", boost: "industrial complex buffer green, pollution mitigation, worker rest area, screening trees, factory garden" }],
    'inf_trad': [{ ...COMMON, s3: "5.인프라/기타 조경 (Infrastructure)", s4: "Cultural/Traditional (문화재/전통 조경)", s5: "Traditional Korean", s19: "Pine Trees", s6: "River Gravel", s23: "Stone Pagoda/Wall", boost: "palace restoration, buddhist temple garden, historical preservation, heritage landscape, antique atmosphere" }]
};

// ==========================================================================
// 3. API ROUTES
// ==========================================================================

app.get('/api/data', (req, res) => res.json({ dataSheet: DATA_SHEET }));

app.get('/api/preset/:themeKey', (req, res) => {
    const key = req.params.themeKey;
    const presets = THEME_PRESETS[key];
    if (presets && presets.length > 0) {
        const choice = presets[Math.floor(Math.random() * presets.length)];
        res.json(choice);
    } else {
        res.json({ error: "No preset found" });
    }
});

// Mock Charge Logic
app.post('/api/charge-success', async (req, res) => {
    const { userId, amount } = req.body;
    console.log(`Charge Request: ${userId}, Amount: ${amount}`);
    res.json({ success: true, newCredits: 100 }); 
});

// 🌳 [ENGINE] 조경 특화 프롬프트 생성 로직 (Landscape Logic)
app.post('/api/generate', async (req, res) => {
    const { choices, themeBoost, userId } = req.body;
    
    // Prompt Construction
    const prompt = generateLandscapePrompt(choices, themeBoost);
    
    // Credits Logic (Simplified)
    res.json({ result: prompt, remainingCredits: 99 });
});

function generateLandscapePrompt(choices, themeBoost) {
    const getV = (k) => choices[k] ? choices[k].replace(/\([^)]*\)/g, "").trim() : "";

    // 1. Classification Definition
    const mainType = getV('s3') || "Landscape Architecture"; // 대분류
    const subType = getV('s4') || "Space"; // 세부 유형
    const style = getV('s5') ? `${getV('s5')} style` : "";
    const site = getV('s2') ? `situated on ${getV('s2')}` : "";
    
    // 2. Main Composition
    let prompt = `A professional landscape architecture visualization of a ${subType} (${mainType}), designed in ${style}, ${site}.`;

    // 3. Key Elements
    const planting = getV('s19');
    const hardscape = getV('s6');
    const feature = getV('s23');
    
    if (planting) prompt += ` The planting design features ${planting}.`;
    if (hardscape) prompt += ` The hardscape materiality consists of ${hardscape}.`;
    if (feature) prompt += ` A focal point is the ${feature}.`;

    // 4. Context & Atmosphere
    const context = [getV('s0'), getV('s1')].filter(Boolean).join(", ");
    if (context) prompt += ` Context: ${context}.`;

    const atmosphere = [getV('s21'), getV('s9'), getV('s10'), getV('s17')].filter(Boolean).join(", ");
    if (atmosphere) prompt += ` Atmosphere: ${atmosphere}.`;

    // 5. Professional Boost
    if (themeBoost) prompt += `\n\n**Design Intent**: ${themeBoost}.`;
    
    // 6. Technical Specs
    const tech = [getV('s14'), getV('s15'), getV('s16')].filter(Boolean).join(", ");
    if (tech) prompt += `\n**Rendering**: ${tech}, 8k resolution, volumetric lighting, highly detailed vegetation textures.`;

    const ratioStr = getV('s18').replace("--ar ", "") || "16:9";
    prompt += `\n\n**Constraints**: Do not include text, watermark, logo.`;
    prompt += `\n(Aspect Ratio: ${ratioStr})`;

    return prompt;
}

app.listen(port, () => {
    console.log(`🚀 MY LANDSCAPE PRO Server (15 Types) running on port ${port}`);
});