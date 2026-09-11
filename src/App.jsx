import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客戶端
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

import logoImg from './assets/logo.png';

// 資源 Emoji 下拉選項
const PRESET_EMOJIS = [
  { label: "✈️ 飛機/交通", value: "✈️" },
  { label: "🏨 住宿/飯店", value: "🏨" },
  { label: "🍜 美食/餐廳", value: "🍜" },
  { label: "🗺️ 地圖/景點", value: "🗺️" },
  { label: "🎫 門票/票券", value: "🎫" }
];

// 背景圖片設定
const PRESET_BG_IMAGES = [
  { name: "日本", url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80" },
  { name: "南韓", url: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200&q=80" },
  { name: "台灣", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80" },
  { name: "泰國", url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80" },
  { name: "新加坡", url: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80" },
  { name: "美國", url: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=80" },
  { name: "越南", url: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80" },
  { name: "歐洲", url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80" },
  { name: "全球", url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80" }
];

// 各國家與地區 App Scheme
const COUNTRY_APPS = {
  jp: {
    name: "🇯🇵 日本",
    apps: [
      { name: "Google Maps (地圖)", scheme: "comgooglemaps://" },
      { name: "Yahoo!乘換案內 (地鐵/轉乘)", scheme: "yahootransit://" },
      { name: "Suica / Apple Wallet (交通卡)", scheme: "suica://" },
      { name: "Tabelog (美食)", scheme: "tabelog://" },
      { name: "乘換NAVITIME (轉乘)", scheme: "navitime://" },
      { name: "Smart EX (新幹線預約)", scheme: "smartex://" }
    ]
  },
  kr: {
    name: "🇰🇷 南韓",
    apps: [
      { name: "Naver Map (地圖/導航)", scheme: "navermap://" },
      { name: "Kakao Map (地圖)", scheme: "kakaomap://" },
      { name: "Kakao T (計程車/叫車)", scheme: "kakaot://" },
      { name: "Papago (翻譯)", scheme: "papago://" },
      { name: "Subway Korea (地鐵)", scheme: "subwaykorea://" },
      { name: "Coupang Eats (外送)", scheme: "cpangeats://" }
    ]
  },
  th: {
    name: "🇹🇭 泰國",
    apps: [
      { name: "Grab (叫車/外送)", scheme: "grab://" },
      { name: "Bolt (叫車)", scheme: "bolt://" },
      { name: "Google Maps (地圖)", scheme: "comgooglemaps://" },
      { name: "LINE MAN (美食外送)", scheme: "lineman://" },
      { name: "ViaBus (公車追蹤)", scheme: "viabus://" }
    ]
  },
  sg: {
    name: "🇸🇬 新加坡",
    apps: [
      { name: "Grab (叫車/外送)", scheme: "grab://" },
      { name: "Citymapper (大眾運輸)", scheme: "citymapper://" },
      { name: "Google Maps (地圖)", scheme: "comgooglemaps://" },
      { name: "ComfortDelGro (德士叫車)", scheme: "cdgtaxi://" }
    ]
  },
  us: {
    name: "🇺🇸 美國",
    apps: [
      { name: "Uber (叫車)", scheme: "uber://" },
      { name: "Lyft (叫車)", scheme: "lyft://" },
      { name: "Google Maps (地圖)", scheme: "comgooglemaps://" },
      { name: "Yelp (美食/店家評價)", scheme: "yelp://" },
      { name: "OpenTable (餐廳訂位)", scheme: "opentable://" }
    ]
  },
  vn: {
    name: "🇻🇳 越南",
    apps: [
      { name: "Grab (叫車/外送)", scheme: "grab://" },
      { name: "Be (叫車/外送)", scheme: "be://" },
      { name: "Google Maps (地圖)", scheme: "comgooglemaps://" },
      { name: "Gojek (叫車/美食)", scheme: "gojek://" }
    ]
  },
  eu: {
    name: "🇪🇺 歐洲",
    apps: [
      { name: "Citymapper (歐洲大眾運輸)", scheme: "citymapper://" },
      { name: "Omio (跨國火車/巴士)", scheme: "omio://" },
      { name: "Uber (叫車)", scheme: "uber://" },
      { name: "Google Maps (地圖)", scheme: "comgooglemaps://" },
      { name: "TheFork (歐洲餐廳訂位)", scheme: "thefork://" }
    ]
  },
  global: {
    name: "🌍 全球通用",
    apps: [
      { name: "Klook (旅遊票券/行程)", scheme: "klook://" },
      { name: "KKday (旅遊體驗)", scheme: "kkday://" },
      { name: "Google Maps (地圖)", scheme: "comgooglemaps://" },
      { name: "Uber (叫車)", scheme: "uber://" },
      { name: "Google Translate (翻譯)", scheme: "googletranslate://" },
      { name: "Airbnb (住宿)", scheme: "airbnb://" }
    ]
  }
};

export default function App() {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(false);

  // 導覽狀態
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'detail' | 'itemDetail'
  const [activeCapsuleId, setActiveCapsuleId] = useState(null);
  const [activeItemId, setActiveItemId] = useState(null);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [isEditingCapsule, setIsEditingCapsule] = useState(false);

  // 首頁卡片左滑刪除狀態
  const [swipedCapsuleId, setSwipedCapsuleId] = useState(null);
  const touchStartXRef = useRef(0);

  // 長按計時器 Ref (用於畫面 B 長按複製)
  const longPressTimerRef = useRef(null);
  const isDraggingRef = useRef(false);

  // 複製資源 Modal 狀態
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [itemToCopy, setItemToCopy] = useState(null);
  const [targetCopyCapsuleId, setTargetCopyCapsuleId] = useState('');

  // 資源列表排序模式: 'manual' (手動排序) | 'emoji' (依 Emoji 自動分類)
  const [itemSortMode, setItemSortMode] = useState('manual');

  // Modals
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [capsuleModalOpen, setCapsuleModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editBgModalOpen, setEditBgModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // 表單暫存
  const [newCapsuleTitle, setNewCapsuleTitle] = useState('');
  const [newCapsuleBgUrl, setNewCapsuleBgUrl] = useState('');
  const [newCapsuleBgFile, setNewCapsuleBgFile] = useState(null);
  const [updateBgFile, setUpdateBgFile] = useState(null);

  // 新增資源表單
  const [itemType, setItemType] = useState('link');
  const [itemEmojiSelect, setItemEmojiSelect] = useState('✈️');
  const [itemEmojiCustom, setItemEmojiCustom] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemContent, setItemContent] = useState('');
  const [appCountry, setAppCountry] = useState('jp');
  const [appScheme, setAppScheme] = useState(COUNTRY_APPS.jp.apps[0].scheme);
  const [isCustomScheme, setIsCustomScheme] = useState(false);
  const [customAppInput, setCustomAppInput] = useState('');
  const [modalError, setModalError] = useState(false);

  // 編輯資源時的 Emoji 暫存狀態
  const [editEmojiSelect, setEditEmojiSelect] = useState('✈️');
  const [editEmojiCustom, setEditEmojiCustom] = useState('');

  // 確認對話框回調
  const [confirmConfig, setConfirmConfig] = useState({ title: '', desc: '', onYes: () => {} });

  // 拖曳排序與自動滾動參照
  const draggedIndexRef = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const autoScrollRafRef = useRef(null);
  const autoScrollClientYRef = useRef(null);

  const AUTO_SCROLL_EDGE = 90;        // 距離邊緣多少 px 開始觸發
  const AUTO_SCROLL_MIN_SPEED = 4;    // 剛超過邊界時的速度
  const AUTO_SCROLL_MAX_SPEED = 20;   // 最靠近邊界時的速度（可依手感調整）

  const stopAutoScroll = () => {
    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
    autoScrollClientYRef.current = null;
  };

  const autoScrollStep = () => {
    const clientY = autoScrollClientYRef.current;
    if (clientY == null) {
      autoScrollRafRef.current = null;
      return;
    }
    const windowHeight = window.innerHeight;
    let delta = 0;

    if (clientY < AUTO_SCROLL_EDGE) {
      const ratio = (AUTO_SCROLL_EDGE - clientY) / AUTO_SCROLL_EDGE;
      delta = -(AUTO_SCROLL_MIN_SPEED + (AUTO_SCROLL_MAX_SPEED - AUTO_SCROLL_MIN_SPEED) * ratio);
    } else if (clientY > windowHeight - AUTO_SCROLL_EDGE) {
      const ratio = (clientY - (windowHeight - AUTO_SCROLL_EDGE)) / AUTO_SCROLL_EDGE;
      delta = AUTO_SCROLL_MIN_SPEED + (AUTO_SCROLL_MAX_SPEED - AUTO_SCROLL_MIN_SPEED) * ratio;
    }

    if (delta !== 0) {
      window.scrollBy(0, delta);
    }
    autoScrollRafRef.current = requestAnimationFrame(autoScrollStep);
  };

  // 拖曳中持續更新目前手指/滑鼠的 Y 座標，讓 rAF 迴圈讀取
  const updateAutoScroll = (clientY) => {
    autoScrollClientYRef.current = clientY;
    if (!autoScrollRafRef.current) {
      autoScrollRafRef.current = requestAnimationFrame(autoScrollStep);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setConfigModalOpen(true);
    } else {
      fetchCapsules();
    }
  }, []);

    // 拖曳排序時，用原生非被動監聽阻止手機瀏覽器的原生滑動手勢
  useEffect(() => {
    const preventScrollWhileDragging = (e) => {
      if (isDraggingRef.current) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventScrollWhileDragging, { passive: false });
    return () => document.removeEventListener('touchmove', preventScrollWhileDragging);
  }, []);

  // 關閉頁面下拉回彈手勢，避免手機拖曳排序時觸發下拉刷新/彈跳
  useEffect(() => {
    document.documentElement.style.overscrollBehaviorY = 'none';
    document.body.style.overscrollBehaviorY = 'none';
  }, []);

  const fetchCapsules = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('capsules')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('讀取失敗:', error.message);
    } else {
      setCapsules(data || []);
    }
    setLoading(false);
  };

  const uploadImageToStorage = async (file) => {
    if (!supabase || !file) return '';
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('travel-photos')
      .upload(fileName, file);

    if (uploadError) {
      console.error('圖片上傳失敗:', uploadError.message);
      alert('圖片上傳失敗，請確認 Storage 權限設定');
      return '';
    }

    const { data } = supabase.storage
      .from('travel-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleCreateCapsule = async () => {
    if (!newCapsuleTitle.trim()) {
      alert('請輸入包裝名稱');
      return;
    }

    let bgUrl = newCapsuleBgUrl;
    if (newCapsuleBgFile) {
      bgUrl = await uploadImageToStorage(newCapsuleBgFile);
    }

    const newCap = {
      id: Date.now().toString(),
      title: newCapsuleTitle.trim(),
      bg_url: bgUrl,
      items: [],
      sort_order: capsules.length
    };

    const { error } = await supabase.from('capsules').insert([newCap]);
    if (error) {
      alert('建立失敗: ' + error.message);
      return;
    }

    setCapsuleModalOpen(false);
    setNewCapsuleTitle('');
    setNewCapsuleBgUrl('');
    setNewCapsuleBgFile(null);
    await fetchCapsules();
    setActiveCapsuleId(newCap.id);
    setCurrentView('detail');
  };

  const handleUpdateBg = async (bgUrlInput = '') => {
    let bgUrl = bgUrlInput;
    if (updateBgFile) {
      bgUrl = await uploadImageToStorage(updateBgFile);
    }
    if (!bgUrl) {
      alert('請先選擇一張照片或點選預設圖片');
      return;
    }

    const { error } = await supabase
      .from('capsules')
      .update({ bg_url: bgUrl })
      .eq('id', activeCapsuleId);

    if (error) {
      alert('更新失敗: ' + error.message);
      return;
    }

    setEditBgModalOpen(false);
    setUpdateBgFile(null);
    await fetchCapsules();
  };

  const handleRemoveBg = async () => {
    const { error } = await supabase
      .from('capsules')
      .update({ bg_url: '' })
      .eq('id', activeCapsuleId);

    if (!error) {
      setEditBgModalOpen(false);
      setUpdateBgFile(null);
      await fetchCapsules();
    }
  };

  const handleCreateItem = async () => {
    if (!itemName.trim()) {
      setModalError(true);
      return;
    }

    let content = '';
    if (itemType === 'app') {
      content = isCustomScheme ? customAppInput.trim() : appScheme;
    } else {
      content = itemContent.trim();
    }

    if (!content) {
      setModalError(true);
      return;
    }
    setModalError(false);

    const finalEmoji = itemEmojiSelect === 'custom' ? (itemEmojiCustom.trim() || '🌐') : itemEmojiSelect;

    const newItem = {
      id: Date.now().toString(),
      type: itemType,
      name: itemName.trim(),
      content: content,
      emoji: finalEmoji
    };

    const targetCapsule = capsules.find(c => c.id === activeCapsuleId);
    if (!targetCapsule) return;

    const updatedItems = [...(targetCapsule.items || []), newItem];

    const { error } = await supabase
      .from('capsules')
      .update({ items: updatedItems })
      .eq('id', activeCapsuleId);

    if (error) {
      alert('新增項目失敗: ' + error.message);
      return;
    }

    setItemModalOpen(false);
    setItemName('');
    setItemContent('');
    setItemEmojiSelect('✈️');
    setItemEmojiCustom('');
    setCustomAppInput('');
    setIsCustomScheme(false);
    await fetchCapsules();
  };

  const handleCopyItem = async () => {
    if (!itemToCopy || !targetCopyCapsuleId) return;

    const targetCapsule = capsules.find(c => c.id === targetCopyCapsuleId);
    if (!targetCapsule) return;

    const duplicatedItem = {
      ...itemToCopy,
      id: Date.now().toString(),
      name: `${itemToCopy.name} (複製)`
    };

    const updatedItems = [...(targetCapsule.items || []), duplicatedItem];

    const { error } = await supabase
      .from('capsules')
      .update({ items: updatedItems })
      .eq('id', targetCopyCapsuleId);

    if (error) {
      alert('複製失敗: ' + error.message);
      return;
    }

    setCopyModalOpen(false);
    setItemToCopy(null);
    await fetchCapsules();
  };

  const confirmDelete = (title, desc, onYes) => {
    setConfirmConfig({ title, desc, onYes });
    setConfirmModalOpen(true);
  };

  // 執行順序重排與更新資料庫
  const executeReorder = async (draggedIdx, targetIdx, type) => {
    if (type === 'capsules') {
      const list = [...capsules];
      const [moved] = list.splice(draggedIdx, 1);
      if (draggedIdx < targetIdx) targetIdx--;
      list.splice(targetIdx, 0, moved);

      setCapsules(list);

      const updates = list.map((cap, idx) => 
        supabase.from('capsules').update({ sort_order: idx }).eq('id', cap.id)
      );
      await Promise.all(updates);
    } else {
      if (itemSortMode === 'emoji') {
        setItemSortMode('manual');
      }

      const targetCapsule = capsules.find(c => c.id === activeCapsuleId);
      if (!targetCapsule) return;

      const items = [...(targetCapsule.items || [])];
      const [moved] = items.splice(draggedIdx, 1);
      if (draggedIdx < targetIdx) targetIdx--;
      items.splice(targetIdx, 0, moved);

      const updatedCapsules = capsules.map(c => c.id === activeCapsuleId ? { ...c, items } : c);
      setCapsules(updatedCapsules);

      await supabase
        .from('capsules')
        .update({ items })
        .eq('id', activeCapsuleId);
    }
  };

  // 桌面端滑鼠拖曳排序 (HTML5 Drag & Drop)
  const handleDragStart = (e, index) => {
    isDraggingRef.current = true;
    draggedIndexRef.current = index;
    document.documentElement.style.touchAction = 'none';
    document.body.style.touchAction = 'none';
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      e.target.classList.add('opacity-40');
    }, 0);
  };

  const handleDragEnd = (e) => {
    isDraggingRef.current = false;
    e.target.classList.remove('opacity-40');
    setDragOverIndex(null);
    document.documentElement.style.touchAction = '';
    document.body.style.touchAction = '';
    stopAutoScroll();
  };

  const handleDragOver = (e, index, itemEl) => {
    e.preventDefault();
    const rect = itemEl.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;

    if (e.clientY < midpoint) {
      setDragOverIndex(`top-${index}`);
    } else {
      setDragOverIndex(`bottom-${index}`);
    }

    // 邊緣自動慢速滾動（滑鼠拖曳）
    updateAutoScroll(e.clientY);
  };

  const handleDrop = async (e, targetIndex, type) => {
    e.preventDefault();
    const draggedIdx = draggedIndexRef.current;
    if (draggedIdx === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    let finalTarget = targetIndex;
    if (e.clientY >= midpoint) finalTarget = targetIndex + 1;

    await executeReorder(draggedIdx, finalTarget, type);
    draggedIndexRef.current = null;
    setDragOverIndex(null);
  };

  // 行動裝置觸控排序 (Touch Events)
  const handleTouchStart = (e, index) => {
    isDraggingRef.current = true;
    draggedIndexRef.current = index;
    document.documentElement.style.touchAction = 'none';
    document.body.style.touchAction = 'none';
  };

  const handleTouchMove = (e, type, listLength) => {
    if (!isDraggingRef.current) return;
    const touch = e.touches[0];
    const clientY = touch.clientY;

    const elements = document.elementsFromPoint(touch.clientX, clientY);
    const cardEl = elements.find(el => el.getAttribute('data-index') !== null);

    if (cardEl) {
      const targetIndex = parseInt(cardEl.getAttribute('data-index'), 10);
      const rect = cardEl.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;

      if (clientY < midpoint) {
        setDragOverIndex(`top-${targetIndex}`);
      } else {
        setDragOverIndex(`bottom-${targetIndex}`);
      }
    }

    // 邊緣自動慢速滾動（觸控拖曳）
    updateAutoScroll(clientY);
  };

  const handleTouchEnd = async (e, type) => {
    isDraggingRef.current = false;
    document.documentElement.style.touchAction = '';
    document.body.style.touchAction = '';
    stopAutoScroll();
  
    const draggedIdx = draggedIndexRef.current;
    if (draggedIdx === null) return;
  
    if (dragOverIndex) {
      const [position, targetIdxStr] = dragOverIndex.split('-');
      let targetIdx = parseInt(targetIdxStr, 10);
      if (position === 'bottom') targetIdx += 1;
  
      if (draggedIdx !== targetIdx && draggedIdx !== targetIdx - 1) {
        await executeReorder(draggedIdx, targetIdx, type);
      }
    }
  
    draggedIndexRef.current = null;
    setDragOverIndex(null);
  };

  // 包裝卡片：維持深綠色遮罩
  const getCardBgStyle = (bgUrl) => {
    if (!bgUrl) return {};
    return {
      backgroundImage: `linear-gradient(rgba(58, 79, 65, 0.6), rgba(58, 79, 65, 0.7)), url('${bgUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  };

  const targetCapsule = capsules.find(c => c.id === activeCapsuleId);
  const activeBgStyle = (currentView === 'detail' && targetCapsule?.bg_url) ? {
    backgroundImage: `linear-gradient(rgba(232, 213, 176, 0.4), rgba(232, 213, 176, 0.5)), url('${targetCapsule.bg_url}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  } : {};

  return (
    <div style={activeBgStyle} className={`min-h-screen pb-12 select-none transition-colors duration-300 bg-[#E8D5B0]/30 text-[#3A4F41]`}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* 頂部導覽列與專屬 Logo */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4 border-[#7A8A6A]/30">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-[#7A8A6A]/30 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
              <img 
                src={logoImg}
                alt="travel capsule logo" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#3A4F41]">travel capsule</h1>
              <p className="text-xs sm:text-sm text-[#7A8A6A]">Journey Log & Cloud Database</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button onClick={fetchCapsules} className="bg-[#E8D5B0]/70 hover:bg-[#E8D5B0] text-[#3A4F41] px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition active:scale-95">
              🔄 同步
            </button>
            <button onClick={() => setConfigModalOpen(true)} className="bg-[#E8D5B0]/70 hover:bg-[#E8D5B0] text-[#3A4F41] px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition active:scale-95">
              ⚙️ 設定說明
            </button>
            <button onClick={() => {
              setNewCapsuleTitle('');
              setNewCapsuleBgUrl('');
              setNewCapsuleBgFile(null);
              setCapsuleModalOpen(true);
            }} className="bg-[#C0624A] hover:bg-[#A8533E] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition shadow-sm active:scale-95">
              + 新旅行包裝
            </button>
          </div>
        </header>

        {!supabase && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex justify-between items-center">
            <span>尚未設定 Supabase 憑證 (.env)</span>
            <button onClick={() => setConfigModalOpen(true)} className="underline font-bold">查看設定說明</button>
          </div>
        )}

        {loading && <div className="text-center py-12 text-sm text-[#7A8A6A]">正在從 Supabase 讀取資料...</div>}

        {/* ================= 畫面 A：首頁清單 ================= */}
        {currentView === 'home' && (
          <div>
            {capsules.length === 0 && !loading ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#7A8A6A]/40 p-6 shadow-sm">
                <p className="text-sm text-[#7A8A6A] mb-3">目前沒有任何旅行包裝</p>
                <button onClick={() => setCapsuleModalOpen(true)} className="bg-[#C0624A] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#A8533E] transition">建立第一個包裝</button>
              </div>
            ) : (
              <div className="space-y-3" onClick={() => { if (swipedCapsuleId !== null) setSwipedCapsuleId(null); }}>
                {capsules.map((cap, index) => {
                  const itemCount = (cap.items || []).length;
                  const capBgStyle = cap.bg_url ? getCardBgStyle(cap.bg_url) : {};
                  const textColor = cap.bg_url ? 'text-white' : 'text-[#3A4F41]';
                  const subColor = cap.bg_url ? 'text-[#E8D5B0]' : 'text-[#7A8A6A]';

                  const isTopBorder = dragOverIndex === `top-${index}`;
                  const isBottomBorder = dragOverIndex === `bottom-${index}`;
                  const isSwiped = swipedCapsuleId === cap.id;

                  return (
                    <div 
                      key={cap.id} 
                      className="relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* 底層隱藏的刪除按鈕 (手機滑出顯示) */}
                      <div className="absolute inset-y-0 right-0 w-28 bg-red-600 flex items-center justify-center z-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete("確定要刪除這個旅行包裝嗎？", "刪除後該包裝內的所有資料將自資料庫移除。", async () => {
                              await supabase.from('capsules').delete().eq('id', cap.id);
                              setSwipedCapsuleId(null);
                              await fetchCapsules();
                            });
                          }}
                          className="w-full h-full text-white text-xs font-bold flex items-center justify-center transition hover:bg-red-700"
                        >
                          🗑️ 刪除
                        </button>
                      </div>

                      {/* 上層可滑動的卡片本體 */}
                      <div
                        data-index={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index, e.currentTarget)}
                        onDrop={(e) => handleDrop(e, index, 'capsules')}
                        onTouchStart={(e) => {
                          touchStartXRef.current = e.touches[0].clientX;
                        }}
                        onTouchMove={(e) => {
                          if (isDraggingRef.current) {
                            handleTouchMove(e, 'capsules', capsules.length);
                          }
                        }}
                        onTouchEnd={(e) => {
                          if (!isDraggingRef.current) {
                            const touchEndX = e.changedTouches[0].clientX;
                            const diffX = touchStartXRef.current - touchEndX;
                            if (diffX > 50) {
                              setSwipedCapsuleId(cap.id);
                            } else if (diffX < -30 && isSwiped) {
                              setSwipedCapsuleId(null);
                            }
                          }
                          handleTouchEnd(e, 'capsules');
                        }}
                        onClick={() => {
                          if (isSwiped) {
                            setSwipedCapsuleId(null);
                          } else {
                            setActiveCapsuleId(cap.id);
                            setCurrentView('detail');
                          }
                        }}
                        style={{
                          ...capBgStyle,
                          transform: isSwiped ? 'translateX(-112px)' : 'translateX(0px)',
                          transition: 'transform 0.25s ease-in-out'
                        }}
                        className={`${cap.bg_url ? '' : 'bg-white'} p-5 border border-[#7A8A6A]/20 relative z-10 cursor-pointer flex justify-between items-center touch-manipulation ${
                          (isTopBorder || isBottomBorder) ? 'scale-[1.01]' : ''
                        }`}
                      >
                          {/* 插入位置指示條：絕對定位，不影響版面高度，避免拖曳卡頓 */}
                        <div className={`pointer-events-none absolute left-2 right-2 -top-[3px] h-[4px] rounded-full bg-[#C0624A] shadow-[0_0_6px_rgba(192,98,74,0.6)] transition-opacity duration-150 z-20 ${isTopBorder ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
                        <div className={`pointer-events-none absolute left-2 right-2 -bottom-[3px] h-[4px] rounded-full bg-[#C0624A] shadow-[0_0_6px_rgba(192,98,74,0.6)] transition-opacity duration-150 z-20 ${isBottomBorder ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />

                        <div className="flex items-center space-x-3.5 overflow-hidden z-10">
                          <span 
                            className={`cursor-grab active:cursor-grabbing px-2 py-1 text-lg select-none font-bold transition ${cap.bg_url ? 'text-white/70 hover:text-white' : 'text-[#7A8A6A] hover:text-[#3A4F41]'}`} 
                            style={{ touchAction: 'none' }}
                            title="按住上下拖拉排序"
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              handleTouchStart(e, index);
                            }}
                          >
                            ☰
                          </span>
                          <div className="truncate">
                            <h2 className={`font-bold ${textColor} text-base transition truncate`}>{cap.title}</h2>
                            <p className={`text-xs ${subColor} mt-0.5`}>包含 {itemCount} 項資源與捷徑</p>
                          </div>
                        </div>
                        <span className={`${textColor} font-bold text-lg shrink-0 ml-2 z-10 group-hover:translate-x-1 transition-transform`}>›</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= 畫面 B：行程細節頁 ================= */}
        {currentView === 'detail' && (() => {
          const target = capsules.find(c => c.id === activeCapsuleId);
          if (!target) { setCurrentView('home'); return null; }

          const headerBgStyle = target.bg_url ? getCardBgStyle(target.bg_url) : {};

          // 處理資源排序：支援手動排序或依 Emoji 排序
          let displayItems = [...(target.items || [])];
          if (itemSortMode === 'emoji') {
            displayItems.sort((a, b) => (a.emoji || '').localeCompare(b.emoji || ''));
          }

          return (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <button onClick={() => setCurrentView('home')} className="inline-flex items-center text-xs font-bold text-white bg-[#C0624A] hover:bg-[#A8533E] px-3 py-2 rounded-xl backdrop-blur transition shadow-sm">
                  ⬅️ 返回清單
                </button>
                <div className="flex items-center space-x-3">
                  <button onClick={() => setEditBgModalOpen(true)} className="text-xs text-[#3A4F41] hover:text-[#C0624A] bg-white px-3 py-1.5 rounded-xl border border-[#7A8A6A]/40 font-medium transition shadow-sm">
                    🖼️ 設定背景照片
                  </button>
                  <button onClick={() => confirmDelete("確定要刪除這個旅行包裝嗎？", "刪除後該包裝內的所有資料將自資料庫移除。", async () => {
                    await supabase.from('capsules').delete().eq('id', target.id);
                    setCurrentView('home');
                    await fetchCapsules();
                  })} className="text-xs text-red-500 hover:text-red-600 bg-white px-3 py-1.5 rounded-xl border border-[#7A8A6A]/40 font-medium transition shadow-sm">
                    刪除此包裝
                  </button>
                </div>
              </div>

              {/* 包裝名稱顯示 / 編輯區 */}
              <div 
                style={headerBgStyle} 
                className={`p-4 rounded-2xl border shadow-sm mb-4 flex justify-between items-center ${target.bg_url ? 'text-white border-white/25' : 'bg-white text-[#3A4F41] border-[#7A8A6A]/30'}`}
              >
                {!isEditingCapsule ? (
                  <h2 className="text-lg font-bold">{target.title}</h2>
                ) : (
                  <input 
                    type="text" 
                    id="editCapsuleTitle" 
                    defaultValue={target.title} 
                    className="flex-1 border border-[#7A8A6A]/40 rounded-xl px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#C0624A] mr-2 text-[#3A4F41] bg-white" 
                  />
                )}

                <div>
                  {!isEditingCapsule ? (
                    <button onClick={() => setIsEditingCapsule(true)} className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${target.bg_url ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-[#E8D5B0]/70 hover:bg-[#E8D5B0] text-[#3A4F41]'}`}>
                      ✏️ 編輯
                    </button>
                  ) : (
                    <button onClick={async () => {
                      const newTitle = document.getElementById('editCapsuleTitle').value.trim();
                      if (!newTitle) { alert('包裝名稱不得為空！'); return; }

                      const { error } = await supabase
                        .from('capsules')
                        .update({ title: newTitle })
                        .eq('id', target.id);

                      if (!error) {
                        setIsEditingCapsule(false);
                        await fetchCapsules();
                      } else {
                        alert('更新失敗: ' + error.message);
                      }
                    }} className="text-xs bg-[#C0624A] hover:bg-[#A8533E] text-white px-3 py-1.5 rounded-xl font-bold transition shadow-sm">
                      💾 儲存
                    </button>
                  )}
                </div>
              </div>

              {/* 排序方式切換列 */}
              {target.items && target.items.length > 1 && (
                <div className="flex justify-between items-center mb-3 px-1">
                  <span className="text-xs text-[#7A8A6A]">
                    {itemSortMode === 'manual' ? '👉 長按項目可快速複製，拖曳左側 ☰ 排序' : '⚡ 已依照 Emoji 分類自動排序'}
                  </span>
                  <div className="inline-flex bg-white/90 backdrop-blur rounded-xl p-1 border border-[#7A8A6A]/30 text-xs shadow-sm">
                    <button 
                      onClick={() => setItemSortMode('manual')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition ${itemSortMode === 'manual' ? 'bg-[#C0624A] text-white shadow-sm' : 'text-[#3A4F41] hover:bg-[#E8D5B0]/30'}`}
                    >
                      手動排列
                    </button>
                    <button 
                      onClick={() => setItemSortMode('emoji')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition ${itemSortMode === 'emoji' ? 'bg-[#C0624A] text-white shadow-sm' : 'text-[#3A4F41] hover:bg-[#E8D5B0]/30'}`}
                    >
                      Emoji 自動排序
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-4">
                {(!target.items || target.items.length === 0) ? (
                  <p className="text-xs text-[#7A8A6A] text-center py-12 bg-white rounded-2xl border border-dashed border-[#7A8A6A]/40 shadow-sm">這個包裝還空空如也，快點下方新增資料吧！</p>
                ) : (
                  displayItems.map((item, index) => {
                    let actionHtml = null;
                    if (item.type === 'link') {
                      actionHtml = <a href={item.content} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-[#E8D5B0]/50 text-[#3A4F41] px-3 py-1.5 rounded-xl font-medium hover:bg-[#E8D5B0]">開啟</a>;
                    } else if (item.type === 'app') {
                      actionHtml = <a href={item.content} onClick={(e) => e.stopPropagation()} className="text-xs bg-[#E8D5B0]/50 text-[#3A4F41] px-3 py-1.5 rounded-xl font-medium hover:bg-[#E8D5B0]">App</a>;
                    } else if (item.type === 'file') {
                      actionHtml = item.content.startsWith('http') ?
                        <a href={item.content} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-[#E8D5B0]/50 text-[#C0624A] px-3 py-1.5 rounded-xl font-medium hover:bg-[#E8D5B0]">檔案</a> :
                        <span className="text-xs bg-[#E8D5B0]/50 text-[#C0624A] px-2.5 py-1 rounded-xl font-mono">路徑</span>;
                    } else if (item.type === 'note') {
                      actionHtml = <span className="text-xs bg-[#E8D5B0]/50 text-[#3A4F41] px-2.5 py-1 rounded-xl">筆記</span>;
                    }

                    const isTopBorder = dragOverIndex === `top-${index}`;
                    const isBottomBorder = dragOverIndex === `bottom-${index}`;

                    return (
                      <div
                        key={item.id}
                        data-index={index}
                        draggable={itemSortMode === 'manual'}
                        onDragStart={(e) => itemSortMode === 'manual' && handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => itemSortMode === 'manual' && handleDragOver(e, index, e.currentTarget)}
                        onDrop={(e) => itemSortMode === 'manual' && handleDrop(e, index, 'items')}
                        onTouchStart={(e) => {
                          if (!isDraggingRef.current) {
                            longPressTimerRef.current = setTimeout(() => {
                              if (!isDraggingRef.current) {
                                setItemToCopy(item);
                                setTargetCopyCapsuleId(target.id);
                                setCopyModalOpen(true);
                              }
                            }, 600);
                          }
                        }}
                        onTouchMove={(e) => {
                          if (isDraggingRef.current) {
                            itemSortMode === 'manual' && handleTouchMove(e, 'items', target.items.length);
                          }
                          if (longPressTimerRef.current) {
                            clearTimeout(longPressTimerRef.current);
                            longPressTimerRef.current = null;
                          }
                        }}
                        onTouchEnd={(e) => {
                          if (isDraggingRef.current) {
                            itemSortMode === 'manual' && handleTouchEnd(e, 'items');
                          }
                          if (longPressTimerRef.current) {
                            clearTimeout(longPressTimerRef.current);
                            longPressTimerRef.current = null;
                          }
                        }}
                        onMouseDown={() => {
                          if (!isDraggingRef.current) {
                            longPressTimerRef.current = setTimeout(() => {
                              if (!isDraggingRef.current) {
                                setItemToCopy(item);
                                setTargetCopyCapsuleId(target.id);
                                setCopyModalOpen(true);
                              }
                            }, 600);
                          }
                        }}
                        onMouseUp={() => {
                          if (longPressTimerRef.current) {
                            clearTimeout(longPressTimerRef.current);
                            longPressTimerRef.current = null;
                          }
                        }}
                        onMouseLeave={() => {
                          if (longPressTimerRef.current) {
                            clearTimeout(longPressTimerRef.current);
                            longPressTimerRef.current = null;
                          }
                        }}
                        onClick={() => { 
                          if (!isDraggingRef.current) {
                            setActiveItemId(item.id); 
                            setCurrentView('itemDetail'); 
                            setIsEditingItem(false); 
                            const isPreset = PRESET_EMOJIS.some(e => e.value === item.emoji);
                            setEditEmojiSelect(isPreset ? item.emoji : 'custom');
                            setEditEmojiCustom(isPreset ? '' : item.emoji);
                          }
                        }}
                        className={`flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#7A8A6A]/20 shadow-sm transition-all duration-200 cursor-pointer group relative transform text-[#3A4F41] touch-manipulation hover:border-[#C0624A] ${
                          (isTopBorder || isBottomBorder) ? 'scale-[1.01] bg-[#C0624A]/5' : ''
                        }`}
                      >
                        {/* 插入位置指示條：絕對定位，不影響版面高度，避免拖曳卡頓 */}
                        <div className={`pointer-events-none absolute left-2 right-2 -top-[3px] h-[4px] rounded-full bg-[#C0624A] shadow-[0_0_6px_rgba(192,98,74,0.6)] transition-opacity duration-150 ${isTopBorder ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
                        <div className={`pointer-events-none absolute left-2 right-2 -bottom-[3px] h-[4px] rounded-full bg-[#C0624A] shadow-[0_0_6px_rgba(192,98,74,0.6)] transition-opacity duration-150 ${isBottomBorder ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
                        
                        <div className="flex items-center space-x-3 overflow-hidden mr-2">
                          <span 
                            className={`cursor-grab active:cursor-grabbing px-2 py-1 text-sm select-none font-bold ${itemSortMode !== 'manual' ? 'opacity-30 cursor-not-allowed' : 'text-[#7A8A6A] hover:text-[#3A4F41]'}`} 
                            style={{ touchAction: 'none' }}
                            title={itemSortMode === 'manual' ? "按住上下拖拉排序" : "切換至手動排序以啟用拖曳"}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              handleTouchStart(e, index);
                            }}
                          >
                            ☰
                          </span>
                          <span className="text-base shrink-0">{item.emoji || '🌐'}</span>
                          <div className="truncate">
                            <p className="text-xs font-bold text-[#3A4F41] group-hover:text-[#C0624A] truncate">{item.name}</p>
                            <p className="text-[11px] text-[#7A8A6A] truncate">{item.content}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          {actionHtml}
                          <button onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete("確定要刪除這個項目嗎？", "刪除後將無法復原。", async () => {
                              const updatedItems = target.items.filter(i => i.id !== item.id);
                              await supabase.from('capsules').update({ items: updatedItems }).eq('id', target.id);
                              await fetchCapsules();
                            });
                          }} className="text-[#7A8A6A] hover:text-red-500 px-1.5 py-0.5 text-base rounded-lg hover:bg-red-50 transition">×</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <button onClick={() => { setItemName(''); setItemContent(''); setItemEmojiSelect('✈️'); setItemEmojiCustom(''); setItemModalOpen(true); }} className="w-full py-3 bg-[#C0624A] hover:bg-[#A8533E] text-white rounded-2xl text-xs font-bold shadow-sm transition active:scale-[0.99]">
                + 新增資源 / 喚醒 App 到此包裝
              </button>
            </div>
          );
        })()}

        {/* ================= 畫面 C：資源詳細編輯頁 ================= */}
        {currentView === 'itemDetail' && (() => {
          const targetCapsule = capsules.find(c => c.id === activeCapsuleId);
          const targetItem = targetCapsule?.items?.find(i => i.id === activeItemId);
          if (!targetCapsule || !targetItem) { setCurrentView('home'); return null; }

          const headerBgStyle = targetCapsule.bg_url ? getCardBgStyle(targetCapsule.bg_url) : {};

          return (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <button onClick={() => setCurrentView('detail')} className="inline-flex items-center text-xs font-bold text-white bg-[#C0624A] hover:bg-[#A8533E] px-3 py-2 rounded-xl backdrop-blur transition shadow-sm">
                  ⬅️ 返回包裝
                </button>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      setItemToCopy(targetItem);
                      setTargetCopyCapsuleId(targetCapsule.id);
                      setCopyModalOpen(true);
                    }} 
                    className="bg-white hover:bg-[#E8D5B0]/30 text-[#3A4F41] px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm border border-[#7A8A6A]/40"
                  >
                    📋 複製
                  </button>

                  {targetItem.type === 'file' && targetItem.content.startsWith('http') && (
                    <a href={targetItem.content} target="_blank" rel="noreferrer" className="bg-[#C0624A] hover:bg-[#A8533E] text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center">📁 開啟雲端檔案</a>
                  )}
                  {targetItem.type === 'link' && (
                    <a href={targetItem.content} target="_blank" rel="noreferrer" className="bg-[#C0624A] hover:bg-[#A8533E] text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center">🌐 前往網頁</a>
                  )}

                  {!isEditingItem ? (
                    <button onClick={() => {
                      setIsEditingItem(true);
                      const isPreset = PRESET_EMOJIS.some(e => e.value === targetItem.emoji);
                      setEditEmojiSelect(isPreset ? targetItem.emoji : 'custom');
                      setEditEmojiCustom(isPreset ? '' : targetItem.emoji);
                    }} className="bg-white hover:bg-[#E8D5B0]/30 text-[#3A4F41] px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm border border-[#7A8A6A]/40">
                      ✏️ 編輯
                    </button>
                  ) : (
                    <button onClick={async () => {
                      const newName = document.getElementById('editItemName').value.trim();
                      const newContent = document.getElementById('editItemContent').value.trim();
                      const finalEditEmoji = editEmojiSelect === 'custom' ? (editEmojiCustom.trim() || '🌐') : editEmojiSelect;

                      if (!newName || !newContent) { alert('名稱與內容不得為空！'); return; }

                      const updatedItems = targetCapsule.items.map(i => i.id === targetItem.id ? { ...i, name: newName, content: newContent, emoji: finalEditEmoji } : i);
                      await supabase.from('capsules').update({ items: updatedItems }).eq('id', targetCapsule.id);
                      setIsEditingItem(false);
                      await fetchCapsules();
                    }} className="bg-[#C0624A] hover:bg-[#A8533E] text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm">
                      💾 儲存
                    </button>
                  )}
                </div>
              </div>

              {/* 所屬旅行包裝卡片欄位 */}
              <div 
                style={headerBgStyle}
                className={`p-4 rounded-2xl border shadow-sm mb-4 flex items-center justify-between ${targetCapsule.bg_url ? 'text-white border-white/25' : 'bg-white text-[#3A4F41] border-[#7A8A6A]/30'}`}
              >
                <div>
                  <p className={`text-[10px] uppercase tracking-wider font-semibold ${targetCapsule.bg_url ? 'text-[#E8D5B0]' : 'text-[#7A8A6A]'}`}>所屬旅行包裝</p>
                  <h2 className="text-base font-bold">{targetCapsule.title}</h2>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-xl font-medium ${targetCapsule.bg_url ? 'bg-white/20 text-white' : 'bg-[#E8D5B0]/50 text-[#3A4F41]'}`}>📦 項目檢視</span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#7A8A6A]/20 shadow-sm space-y-4 text-[#3A4F41]">
                <div className="flex space-x-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">Emoji</label>
                    {!isEditingItem ? <p className="text-xl">{targetItem.emoji || '🌐'}</p> : (
                      <div>
                        <select value={editEmojiSelect} onChange={(e) => setEditEmojiSelect(e.target.value)} className="w-full border border-[#7A8A6A]/40 rounded-lg px-2 py-1.5 text-xs bg-white mb-1.5">
                          {PRESET_EMOJIS.map((emoji, idx) => (
                            <option key={idx} value={emoji.value}>{emoji.label}</option>
                          ))}
                          <option value="custom">✏️ 自訂 Emoji</option>
                        </select>
                        {editEmojiSelect === 'custom' && (
                          <input type="text" value={editEmojiCustom} onChange={(e) => setEditEmojiCustom(e.target.value)} maxLength={2} placeholder="☕" className="w-16 border border-[#7A8A6A]/40 rounded-lg px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#C0624A]" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">資源類型</label>
                    <p className="text-xs font-bold text-[#3A4F41] uppercase mt-2">{targetItem.type}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">名稱 / 標題</label>
                  {!isEditingItem ? <p className="text-sm font-bold text-[#3A4F41]">{targetItem.name}</p> : (
                    <input type="text" id="editItemName" defaultValue={targetItem.name} className="w-full border border-[#7A8A6A]/40 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C0624A]" />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">內容 / 網址 / 路徑 / 筆記</label>
                  {!isEditingItem ? (
                    <div className="p-3 bg-[#E8D5B0]/20 rounded-xl border border-[#7A8A6A]/20 text-xs text-[#3A4F41] break-all whitespace-pre-wrap">{targetItem.content}</div>
                  ) : (
                    <textarea id="editItemContent" rows={5} defaultValue={targetItem.content} className="w-full border border-[#7A8A6A]/40 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C0624A]"></textarea>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      </div>

      {/* ================= 各種彈跳視窗 Modals ================= */}

      {/* 複製資源 Modal */}
      {copyModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-xl my-auto text-[#3A4F41]">
            <h3 className="text-base font-bold mb-2">📋 複製資源</h3>
            <p className="text-xs text-[#7A8A6A] mb-4">請選擇要將「{itemToCopy?.name}」複製到哪一個旅行包裝：</p>
            
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">目標旅行包裝</label>
              <select 
                value={targetCopyCapsuleId} 
                onChange={(e) => setTargetCopyCapsuleId(e.target.value)} 
                className="w-full border border-[#7A8A6A]/40 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C0624A]"
              >
                {capsules.map((cap) => (
                  <option key={cap.id} value={cap.id}>{cap.title}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#7A8A6A]/20">
              <button onClick={() => setCopyModalOpen(false)} className="px-4 py-2 text-xs text-[#7A8A6A] hover:bg-[#E8D5B0]/30 rounded-lg">取消</button>
              <button onClick={handleCopyItem} className="px-4 py-2 text-xs bg-[#C0624A] text-white rounded-lg hover:bg-[#A8533E]">確定複製</button>
            </div>
          </div>
        </div>
      )}

      {configModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl my-auto text-[#3A4F41]">
            <h3 className="text-base sm:text-lg font-bold mb-2">⚙️ Supabase 設定說明</h3>
            <p className="text-xs text-[#7A8A6A] mb-4">請確認已在專案根目錄建立 <code className="bg-[#E8D5B0]/50 px-1 py-0.5 rounded text-[#3A4F41]">.env</code> 檔案，並填入以下環境變數：</p>
            <pre className="bg-[#3A4F41] text-[#E8D5B0] p-3 rounded-xl text-xs overflow-x-auto mb-4 font-mono">
{`VITE_SUPABASE_URL=你的專案URL
VITE_SUPABASE_ANON_KEY=你的專案Anon_Key`}
            </pre>
            <div className="flex justify-end">
              <button onClick={() => setConfigModalOpen(false)} className="px-4 py-2 text-xs bg-[#C0624A] text-white rounded-lg hover:bg-[#A8533E]">關閉</button>
            </div>
          </div>
        </div>
      )}

      {/* 建立新旅行包裝 Modal */}
      {capsuleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl my-auto max-h-[90vh] flex flex-col text-[#3A4F41]">
            <h3 className="text-base sm:text-lg font-bold mb-3">建立新的旅行包裝</h3>
            
            <div className="space-y-3 mb-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">包裝名稱</label>
                <input type="text" value={newCapsuleTitle} onChange={(e) => setNewCapsuleTitle(e.target.value)} placeholder="例如：2026 東京自由行 🇯🇵" className="w-full border border-[#7A8A6A]/40 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C0624A]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">選擇精選背景圖片</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
                  {PRESET_BG_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setNewCapsuleBgUrl(img.url); setNewCapsuleBgFile(null); }}
                      className={`h-16 rounded-lg overflow-hidden border-2 relative transition ${newCapsuleBgUrl === img.url ? 'border-[#C0624A] ring-2 ring-[#C0624A]/30' : 'border-[#7A8A6A]/30 hover:opacity-80'}`}
                      title={img.name}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 text-[10px] text-white text-center py-0.5 truncate">{img.name}</div>
                    </button>
                  ))}
                </div>
                {newCapsuleBgUrl && (
                  <p className="text-[11px] text-[#C0624A] mb-2 font-medium">✓ 已選擇精選背景圖</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">或自行上傳背景照片 (支援 iPhone / HEIC)</label>
                <input type="file" accept="image/*,.heic,.heif" onChange={(e) => { setNewCapsuleBgFile(e.target.files[0]); setNewCapsuleBgUrl(''); }} className="w-full border border-[#7A8A6A]/40 rounded-lg px-3 py-2 text-xs text-[#7A8A6A] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E8D5B0]/50 file:text-[#3A4F41] hover:file:bg-[#E8D5B0]" />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#7A8A6A]/20 shrink-0">
              <button onClick={() => setCapsuleModalOpen(false)} className="px-4 py-2 text-xs sm:text-sm text-[#7A8A6A] hover:bg-[#E8D5B0]/30 rounded-lg">取消</button>
              <button onClick={handleCreateCapsule} className="px-4 py-2 text-xs sm:text-sm bg-[#C0624A] text-white rounded-lg hover:bg-[#A8533E]">建立</button>
            </div>
          </div>
        </div>
      )}

      {/* 編輯背景照片 Modal */}
      {editBgModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl my-auto text-[#3A4F41]">
            <h3 className="text-base sm:text-lg font-bold mb-2">🖼️ 設定行程背景照片</h3>
            <p className="text-xs text-[#7A8A6A] mb-3">選擇精選圖片或自訂上傳一張代表這個行程的照片。</p>
            
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PRESET_BG_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUpdateBg(img.url)}
                    className="h-16 rounded-lg overflow-hidden border-2 border-[#7A8A6A]/30 hover:border-[#C0624A] transition relative group"
                    title={img.name}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/50 text-[10px] text-white text-center py-0.5 truncate">{img.name}</div>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-[#7A8A6A]/20">
                <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">自訂上傳照片</label>
                <input type="file" accept="image/*,.heic,.heif" onChange={(e) => setUpdateBgFile(e.target.files[0])} className="w-full border border-[#7A8A6A]/40 rounded-lg px-3 py-2 text-xs text-[#7A8A6A] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E8D5B0]/50 file:text-[#3A4F41] hover:file:bg-[#E8D5B0] mb-2" />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#7A8A6A]/20">
              <button onClick={handleRemoveBg} className="text-xs text-red-500 hover:underline">移除背景圖</button>
              <div className="flex space-x-2">
                <button onClick={() => setEditBgModalOpen(false)} className="px-4 py-2 text-xs text-[#7A8A6A] hover:bg-[#E8D5B0]/30 rounded-lg">取消</button>
                <button onClick={() => handleUpdateBg()} className="px-4 py-2 text-xs bg-[#C0624A] text-white rounded-lg hover:bg-[#A8533E]">上傳更新</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新增資源 Modal */}
      {itemModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl my-auto max-h-[90vh] flex flex-col text-[#3A4F41]">
            <h3 className="text-base sm:text-lg font-bold mb-3">新增資源到包裝</h3>
            {modalError && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs">請填寫完整名稱與內容！</div>}
            
            <div className="space-y-3 mb-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">圖示 Emoji</label>
                <select value={itemEmojiSelect} onChange={(e) => setItemEmojiSelect(e.target.value)} className="w-full border border-[#7A8A6A]/40 rounded-lg px-3 py-2 text-xs sm:text-sm bg-white mb-2">
                  {PRESET_EMOJIS.map((emoji, idx) => (
                    <option key={idx} value={emoji.value}>{emoji.label}</option>
                  ))}
                  <option value="custom">✏️ 自訂 Emoji</option>
                </select>

                {itemEmojiSelect === 'custom' && (
                  <input type="text" value={itemEmojiCustom} onChange={(e) => setItemEmojiCustom(e.target.value)} maxLength={2} placeholder="輸入自訂 Emoji (例如: ☕)" className="w-full border border-[#7A8A6A]/40 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C0624A]" />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">資源類型</label>
                <select value={itemType} onChange={(e) => setItemType(e.target.value)} className="w-full border border-[#7A8A6A]/40 rounded-lg px-3 py-2 text-xs sm:text-sm bg-white">
                  <option value="link">🌐 一般網頁連結 (URL)</option>
                  <option value="app">📱 喚醒手機 App (依國家選擇)</option>
                  <option value="file">📁 檔案/雲端硬碟路徑 (可貼連結)</option>
                  <option value="note">📝 隨手筆記/資訊</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">名稱 / 標題</label>
                <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="例如：Naver Map 導航" className="w-full border border-[#7A8A6A]/40 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C0624A]" />
              </div>

              {itemType === 'app' ? (
                <div>
                  <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">1. 選擇國家 / 地區</label>
                  <select value={appCountry} onChange={(e) => {
                    const c = e.target.value;
                    setAppCountry(c);
                    setAppScheme(COUNTRY_APPS[c].apps[0].scheme);
                    setIsCustomScheme(false);
                  }} className="w-full border border-[#7A8A6A]/40 rounded-lg px-3 py-2 text-xs sm:text-sm bg-white mb-2">
                    <option value="jp">🇯🇵 日本</option>
                    <option value="kr">🇰🇷 南韓</option>
                    <option value="th">🇹🇭 泰國</option>
                    <option value="sg">🇸🇬 新加坡</option>
                    <option value="us">🇺🇸 美國</option>
                    <option value="vn">🇻🇳 越南</option>
                    <option value="eu">🇪🇺 歐洲</option>
                    <option value="global">🌍 全球通用</option>
                  </select>

                  <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">2. 選擇 App 與 URL Scheme</label>
                  <select value={isCustomScheme ? 'custom' : appScheme} onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setIsCustomScheme(true);
                    } else {
                      setIsCustomScheme(false);
                      setAppScheme(val);
                    }
                  }} className="w-full border border-[#7A8A6A]/40 rounded-lg px-3 py-2 text-xs sm:text-sm bg-white mb-2">
                    {COUNTRY_APPS[appCountry].apps.map((app, idx) => (
                      <option key={idx} value={app.scheme}>{app.name} ({app.scheme})</option>
                    ))}
                    <option value="custom">✏️ 自選 / 手動輸入其他 Scheme</option>
                  </select>

                  {isCustomScheme && (
                    <div>
                      <label className="block text-xs font-semibold text-[#C0624A] mb-1">3. 手動輸入自訂 Scheme</label>
                      <input type="text" value={customAppInput} onChange={(e) => setCustomAppInput(e.target.value)} placeholder="例如：instagram://" className="w-full border border-[#7A8A6A]/40 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C0624A]" />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#7A8A6A] mb-1">內容 / 網址 / 備忘說明</label>
                  <input type="text" value={itemContent} onChange={(e) => setItemContent(e.target.value)} placeholder={itemType === 'file' ? "https://drive.google.com/..." : "https://... 或 文字說明"} className="w-full border border-[#7A8A6A]/40 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C0624A]" />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#7A8A6A]/20 shrink-0">
              <button onClick={() => setItemModalOpen(false)} className="px-4 py-2 text-xs sm:text-sm text-[#7A8A6A] hover:bg-[#E8D5B0]/30 rounded-lg">取消</button>
              <button onClick={handleCreateItem} className="px-4 py-2 text-xs sm:text-sm bg-[#C0624A] text-white rounded-lg hover:bg-[#A8533E]">新增</button>
            </div>
          </div>
        </div>
      )}

      {confirmModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center text-[#3A4F41]">
            <h3 className="text-base font-bold text-[#3A4F41] mb-2">{confirmConfig.title}</h3>
            <p className="text-xs text-[#7A8A6A] mb-6">{confirmConfig.desc}</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setConfirmModalOpen(false)} className="flex-1 px-4 py-2.5 text-xs font-medium text-[#3A4F41] bg-[#E8D5B0]/60 hover:bg-[#E8D5B0] rounded-xl">取消</button>
              <button onClick={() => { setConfirmModalOpen(false); confirmConfig.onYes(); }} className="flex-1 px-4 py-2.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl">確定</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}