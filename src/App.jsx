import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客戶端
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const COUNTRY_APPS = {
  kr: {
    name: "🇰🇷 韓國",
    apps: [
      { name: "Naver Map (地圖/導航)", scheme: "navermap://" },
      { name: "Kakao Map (地圖)", scheme: "kakaomap://" },
      { name: "Kakao T (計程車/叫車)", scheme: "kakaot://" },
      { name: "Papago (翻譯)", scheme: "papago://" },
      { name: "Subway Korea (地鐵)", scheme: "subwaykorea://" }
    ]
  },
  jp: {
    name: "🇯🇵 日本",
    apps: [
      { name: "Google Maps (地圖)", scheme: "comgooglemaps://" },
      { name: "Yahoo!乘換案內 (地鐵/轉乘)", scheme: "yahootransit://" },
      { name: "Suica / Apple Wallet (交通卡)", scheme: "suica://" },
      { name: "Tabelog (美食)", scheme: "tabelog://" }
    ]
  },
  global: {
    name: "🌍 通用 / 其他",
    apps: [
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

  // Modals
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [capsuleModalOpen, setCapsuleModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editBgModalOpen, setEditBgModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // 表單暫存
  const [newCapsuleTitle, setNewCapsuleTitle] = useState('');
  const [newCapsuleBgFile, setNewCapsuleBgFile] = useState(null);
  const [updateBgFile, setUpdateBgFile] = useState(null);

  // 新增資源表單
  const [itemType, setItemType] = useState('link');
  const [itemEmoji, setItemEmoji] = useState('🌐');
  const [itemName, setItemName] = useState('');
  const [itemContent, setItemContent] = useState('');
  const [appCountry, setAppCountry] = useState('kr');
  const [appScheme, setAppScheme] = useState(COUNTRY_APPS.kr.apps[0].scheme);
  const [customAppInput, setCustomAppInput] = useState('');
  const [modalError, setModalError] = useState(false);

  // 確認對話框回調
  const [confirmConfig, setConfirmConfig] = useState({ title: '', desc: '', onYes: () => {} });

  // 拖曳排序暫存
  const draggedIndexRef = useRef(null);

  useEffect(() => {
    if (!supabase) {
      setConfigModalOpen(true);
    } else {
      fetchCapsules();
    }
  }, []);

  // 從 Supabase 資料庫讀取資料
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

  // 上傳圖片到 Supabase Storage
  const uploadImageToStorage = async (file) => {
    if (!supabase || !file) return '';
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('travel-photos') // 對應你在 Supabase 建立的 Bucket 名稱
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

  // 建立新包裝
  const handleCreateCapsule = async () => {
    if (!newCapsuleTitle.trim()) {
      alert('請輸入包裝名稱');
      return;
    }

    let bgUrl = '';
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
    setNewCapsuleBgFile(null);
    await fetchCapsules();
    setActiveCapsuleId(newCap.id);
    setCurrentView('detail');
  };

  // 更新背景照片
  const handleUpdateBg = async () => {
    if (!updateBgFile) {
      alert('請先選擇一張照片');
      return;
    }
    const bgUrl = await uploadImageToStorage(updateBgFile);
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

  // 新增資源
  const handleCreateItem = async () => {
    if (!itemName.trim()) {
      setModalError(true);
      return;
    }

    let content = '';
    if (itemType === 'app') {
      content = customAppInput.trim() ? customAppInput.trim() : appScheme;
    } else {
      content = itemContent.trim();
    }

    if (!content) {
      setModalError(true);
      return;
    }
    setModalError(false);

    const newItem = {
      id: Date.now().toString(),
      type: itemType,
      name: itemName.trim(),
      content: content,
      emoji: itemEmoji.trim() || '🌐'
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
    setCustomAppInput('');
    await fetchCapsules();
  };

  // 刪除確認對話框
  const confirmDelete = (title, desc, onYes) => {
    setConfirmConfig({ title, desc, onYes });
    setConfirmModalOpen(true);
  };

  // 拖拉排序邏輯 (具備插入線提示)
  const handleDragStart = (e, index) => {
    draggedIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, itemEl) => {
    e.preventDefault();
    const rect = itemEl.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    
    document.querySelectorAll('.sortable-item').forEach(el => {
      el.classList.remove('border-t-4', 'border-blue-500', 'border-b-4');
    });

    if (e.clientY < midpoint) {
      itemEl.classList.add('border-t-4', 'border-blue-500');
    } else {
      itemEl.classList.add('border-b-4', 'border-blue-500');
    }
  };

  const handleDrop = async (e, targetIndex, type) => {
    e.preventDefault();
    const draggedIdx = draggedIndexRef.current;
    if (draggedIdx === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    let finalTarget = targetIndex;
    if (e.clientY >= midpoint) finalTarget = targetIndex + 1;

    if (type === 'capsules') {
      const list = [...capsules];
      const [moved] = list.splice(draggedIdx, 1);
      if (draggedIdx < finalTarget) finalTarget--;
      list.splice(finalTarget, 0, moved);

      const updates = list.map((cap, idx) => 
        supabase.from('capsules').update({ sort_order: idx }).eq('id', cap.id)
      );
      await Promise.all(updates);
      setCapsules(list);
    } else {
      const targetCapsule = capsules.find(c => c.id === activeCapsuleId);
      if (!targetCapsule) return;

      const items = [...(targetCapsule.items || [])];
      const [moved] = items.splice(draggedIdx, 1);
      if (draggedIdx < finalTarget) finalTarget--;
      items.splice(finalTarget, 0, moved);

      await supabase
        .from('capsules')
        .update({ items })
        .eq('id', activeCapsuleId);

      await fetchCapsules();
    }
    draggedIndexRef.current = null;
    document.querySelectorAll('.sortable-item').forEach(el => {
      el.classList.remove('border-t-4', 'border-blue-500', 'border-b-4');
    });
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen pb-12 select-none">
      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* 頂部導覽列 */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">📦 Travel Capsule</h1>
            <p className="text-xs sm:text-sm text-slate-500">React + Supabase 雲端資料庫版</p>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button onClick={fetchCapsules} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition">
              🔄 同步
            </button>
            <button onClick={() => setConfigModalOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition">
              ⚙️ 設定說明
            </button>
            <button onClick={() => setCapsuleModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition shadow-sm">
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

        {loading && <div className="text-center py-12 text-sm text-slate-400">正在從 Supabase 讀取資料...</div>}

        {/* ================= 畫面 A：首頁清單 ================= */}
        {currentView === 'home' && (
          <div>
            {capsules.length === 0 && !loading ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-6 shadow-sm">
                <p className="text-sm text-slate-400 mb-3">目前沒有任何旅行包裝</p>
                <button onClick={() => setCapsuleModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">建立第一個包裝</button>
              </div>
            ) : (
              <div className="space-y-3">
                {capsules.map((cap, index) => {
                  const itemCount = (cap.items || []).length;
                  const bgStyle = cap.bg_url ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url('${cap.bg_url}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {};
                  const textColor = cap.bg_url ? 'text-white' : 'text-slate-800';
                  const subColor = cap.bg_url ? 'text-slate-200' : 'text-slate-400';

                  return (
                    <div
                      key={cap.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, e.currentTarget)}
                      onDrop={(e) => handleDrop(e, index, 'capsules')}
                      onClick={() => { setActiveCapsuleId(cap.id); setCurrentView('detail'); }}
                      style={bgStyle}
                      className="sortable-item bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex justify-between items-center group cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden z-10">
                        <span className={`cursor-move px-2 py-1 text-base select-none font-bold ${cap.bg_url ? 'text-white/70 hover:text-white' : 'text-slate-300 hover:text-slate-600'}`} title="按住拖拉">☰</span>
                        <div className="truncate">
                          <h2 className={`font-bold ${textColor} text-base transition truncate`}>{cap.title}</h2>
                          <p className={`text-xs ${subColor} mt-0.5`}>包含 {itemCount} 項資源與 App 捷徑</p>
                        </div>
                      </div>
                      <span className={`${textColor} font-bold text-lg shrink-0 ml-2 z-10`}>›</span>
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

          return (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <button onClick={() => setCurrentView('home')} className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition">
                  ⬅️ 返回清單
                </button>
                <div className="flex items-center space-x-3">
                  <button onClick={() => setEditBgModalOpen(true)} className="text-xs text-slate-500 hover:text-blue-600 font-medium">
                    🖼️ 設定背景照片
                  </button>
                  <button onClick={() => confirmDelete("確定要刪除這個旅行包裝嗎？", "刪除後該包裝內的所有資料將自資料庫移除。", async () => {
                    await supabase.from('capsules').delete().eq('id', target.id);
                    setCurrentView('home');
                    await fetchCapsules();
                  })} className="text-xs text-slate-400 hover:text-red-500 font-medium">
                    刪除此包裝
                  </button>
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-800 mb-4">{target.title}</h2>

              <div className="space-y-3 mb-4">
                {(!target.items || target.items.length === 0) ? (
                  <p className="text-xs text-slate-400 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">這個包裝還空空如也，快點下方新增資料吧！</p>
                ) : (
                  target.items.map((item, index) => {
                    let actionHtml = null;
                    if (item.type === 'link') {
                      actionHtml = <a href={item.content} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl font-medium">開啟</a>;
                    } else if (item.type === 'app') {
                      actionHtml = <a href={item.content} onClick={(e) => e.stopPropagation()} className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl font-medium">喚醒 App</a>;
                    } else if (item.type === 'file') {
                      actionHtml = item.content.startsWith('http') ?
                        <a href={item.content} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl font-medium">開啟檔案</a> :
                        <span className="text-xs bg-amber-50 text-amber-600 px-2.5 py-1 rounded-xl font-mono">路徑</span>;
                    } else if (item.type === 'note') {
                      actionHtml = <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-xl">備忘</span>;
                    }

                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, e.currentTarget)}
                        onDrop={(e) => handleDrop(e, index, 'items')}
                        onClick={() => { setActiveItemId(item.id); setCurrentView('itemDetail'); setIsEditingItem(false); }}
                        className="sortable-item flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-300 transition cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden mr-2">
                          <span className="text-slate-300 hover:text-slate-600 cursor-move px-2 py-1 text-sm select-none font-bold" title="按住拖拉">☰</span>
                          <span className="text-base shrink-0">{item.emoji || '🌐'}</span>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600 truncate">{item.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{item.content}</p>
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
                          }} className="text-slate-300 hover:text-red-500 px-1 text-base">×</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <button onClick={() => { setItemName(''); setItemContent(''); setItemModalOpen(true); }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-sm transition">
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

          return (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <button onClick={() => setCurrentView('detail')} className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition">
                  ⬅️ 返回包裝
                </button>
                <div className="flex items-center space-x-2">
                  {targetItem.type === 'file' && targetItem.content.startsWith('http') && (
                    <a href={targetItem.content} target="_blank" rel="noreferrer" className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center">📁 開啟雲端檔案</a>
                  )}
                  {targetItem.type === 'link' && (
                    <a href={targetItem.content} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center">🌐 前往網頁</a>
                  )}

                  {!isEditingItem ? (
                    <button onClick={() => setIsEditingItem(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition">
                      ✏️ 編輯
                    </button>
                  ) : (
                    <button onClick={async () => {
                      const newName = document.getElementById('editItemName').value.trim();
                      const newContent = document.getElementById('editItemContent').value.trim();
                      const newEmoji = document.getElementById('editItemEmoji').value.trim() || '🌐';
                      if (!newName || !newContent) { alert('名稱與內容不得為空！'); return; }

                      const updatedItems = targetCapsule.items.map(i => i.id === targetItem.id ? { ...i, name: newName, content: newContent, emoji: newEmoji } : i);
                      await supabase.from('capsules').update({ items: updatedItems }).eq('id', targetCapsule.id);
                      setIsEditingItem(false);
                      await fetchCapsules();
                    }} className="bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm">
                      💾 儲存
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex space-x-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Emoji</label>
                    {!isEditingItem ? <p className="text-xl">{targetItem.emoji || '🌐'}</p> : (
                      <input type="text" id="editItemEmoji" defaultValue={targetItem.emoji || '🌐'} maxLength={2} className="w-16 border rounded-xl px-3 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">資源類型</label>
                    <p className="text-xs font-bold text-slate-700 uppercase mt-2">{targetItem.type}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">名稱 / 標題</label>
                  {!isEditingItem ? <p className="text-sm font-bold text-slate-800">{targetItem.name}</p> : (
                    <input type="text" id="editItemName" defaultValue={targetItem.name} className="w-full border rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">內容 / 網址 / 路徑 / 筆記</label>
                  {!isEditingItem ? (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 break-all whitespace-pre-wrap">{targetItem.content}</div>
                  ) : (
                    <textarea id="editItemContent" rows={5} defaultValue={targetItem.content} className="w-full border rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      </div>

      {/* ================= 各種彈跳視窗 Modals ================= */}

      {configModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl my-auto">
            <h3 className="text-base sm:text-lg font-bold mb-2">⚙️ Supabase 設定說明</h3>
            <p className="text-xs text-slate-500 mb-4">請確認已在專案根目錄建立 <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">.env</code> 檔案，並填入以下環境變數：</p>
            <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl text-xs overflow-x-auto mb-4 font-mono">
{`VITE_SUPABASE_URL=你的專案URL
VITE_SUPABASE_ANON_KEY=你的專案Anon_Key`}
            </pre>
            <div className="flex justify-end">
              <button onClick={() => setConfigModalOpen(false)} className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">關閉</button>
            </div>
          </div>
        </div>
      )}

      {capsuleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl my-auto">
            <h3 className="text-base sm:text-lg font-bold mb-4">建立新的旅行包裝</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">包裝名稱</label>
                <input type="text" value={newCapsuleTitle} onChange={(e) => setNewCapsuleTitle(e.target.value)} placeholder="例如：2026 首爾自由行 🇰🇷" className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">背景照片上傳 (支援 iPhone 相簿/HEIC)</label>
                <input type="file" accept="image/*,.heic,.heif" onChange={(e) => setNewCapsuleBgFile(e.target.files[0])} className="w-full border rounded-lg px-3 py-2 text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setCapsuleModalOpen(false)} className="px-4 py-2 text-xs sm:text-sm text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
              <button onClick={handleCreateCapsule} className="px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">建立</button>
            </div>
          </div>
        </div>
      )}

      {editBgModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl my-auto">
            <h3 className="text-base sm:text-lg font-bold mb-2">🖼️ 設定行程背景照片</h3>
            <p className="text-xs text-slate-500 mb-4">選擇一張代表這個行程的照片。</p>
            <div className="space-y-3 mb-4">
              <input type="file" accept="image/*,.heic,.heif" onChange={(e) => setUpdateBgFile(e.target.files[0])} className="w-full border rounded-lg px-3 py-2 text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <div className="flex justify-between items-center">
              <button onClick={handleRemoveBg} className="text-xs text-red-500 hover:underline">移除背景圖</button>
              <div className="flex space-x-2">
                <button onClick={() => setEditBgModalOpen(false)} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
                <button onClick={handleUpdateBg} className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">上傳更新</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {itemModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl my-auto max-h-[90vh] flex flex-col">
            <h3 className="text-base sm:text-lg font-bold mb-3">新增資源到包裝</h3>
            {modalError && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs">請填寫完整名稱與內容！</div>}
            
            <div className="space-y-3 mb-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">自訂 Emoji 圖示</label>
                <input type="text" value={itemEmoji} onChange={(e) => setItemEmoji(e.target.value)} maxLength={2} className="w-16 border rounded-lg px-3 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">資源類型</label>
                <select value={itemType} onChange={(e) => setItemType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm bg-white">
                  <option value="link">🌐 一般網頁連結 (URL)</option>
                  <option value="app">📱 喚醒手機 App (依國家選擇)</option>
                  <option value="file">📁 檔案/雲端硬碟路徑 (可貼連結)</option>
                  <option value="note">📝 隨手筆記/資訊</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">名稱 / 標題</label>
                <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="例如：Naver Map 導航" className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {itemType === 'app' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">1. 選擇國家</label>
                  <select value={appCountry} onChange={(e) => {
                    const c = e.target.value;
                    setAppCountry(c);
                    setAppScheme(COUNTRY_APPS[c].apps[0].scheme);
                  }} className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm bg-white mb-2">
                    <option value="kr">🇰🇷 韓國</option>
                    <option value="jp">🇯🇵 日本</option>
                    <option value="global">🌍 通用 / 其他</option>
                  </select>

                  <label className="block text-xs font-semibold text-slate-500 mb-1">2. 選擇常用 App</label>
                  <select value={appScheme} onChange={(e) => setAppScheme(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm bg-white mb-2">
                    {COUNTRY_APPS[appCountry].apps.map((app, idx) => (
                      <option key={idx} value={app.scheme}>{app.name}</option>
                    ))}
                  </select>

                  <label className="block text-xs font-semibold text-slate-500 mb-1">3. 或手動輸入自訂 Scheme (選填)</label>
                  <input type="text" value={customAppInput} onChange={(e) => setCustomAppInput(e.target.value)} placeholder="例如：instagram://" className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">內容 / 網址 / 備忘說明</label>
                  <input type="text" value={itemContent} onChange={(e) => setItemContent(e.target.value)} placeholder={itemType === 'file' ? "https://drive.google.com/..." : "https://... 或 文字說明"} className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 shrink-0">
              <button onClick={() => setItemModalOpen(false)} className="px-4 py-2 text-xs sm:text-sm text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
              <button onClick={handleCreateItem} className="px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">新增</button>
            </div>
          </div>
        </div>
      )}

      {confirmModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <h3 className="text-base font-bold text-slate-900 mb-2">{confirmConfig.title}</h3>
            <p className="text-xs text-slate-500 mb-6">{confirmConfig.desc}</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setConfirmModalOpen(false)} className="flex-1 px-4 py-2.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">取消</button>
              <button onClick={() => { setConfirmModalOpen(false); confirmConfig.onYes(); }} className="flex-1 px-4 py-2.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl">確定</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}