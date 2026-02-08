
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MessageCircle, 
  Settings, 
  CreditCard, 
  Send, 
  CheckCircle, 
  XCircle, 
  Plus, 
  X, 
  Tag, 
  AlertTriangle, 
  Trash2, 
  Wallet, 
  Receipt, 
  Loader2, 
  RefreshCw, 
  Clock, 
  UserCheck, 
  Link2, 
  Search as SearchIcon, 
  Facebook as FacebookIcon, 
  Zap,
  Info,
  Layers,
  Globe,
  ShoppingBag,
  Image as ImageIcon,
  Printer,
  ChevronRight,
  LogOut,
  Paperclip,
  Bookmark
} from 'lucide-react';

// Use relative path to leverage Vite proxy for internal API (Database & Auth)
const API_BASE_URL = '/api';
// Direct Graph API URL
const FB_GRAPH_URL = 'https://graph.facebook.com/v19.0';

// CaiGou Currency Codes: 10=USD, 20=EUR, 30=GBP, 40=CAD
const CURRENCY_MAP: Record<string, string> = {
    'USD': '10',
    'EUR': '20',
    'GBP': '30',
    'CAD': '40',
    'JPY': '50' 
};

// Removed hardcoded tokens for security
const PRESET_TOKENS = [
    { label: '预设主页 A', token: '' }, // Token removed
    { label: '预设主页 B', token: '' }  // Token removed
];

const FEE_RATE = 0.045; // 4.5%

// Helper: Fetch with Timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, time = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), time);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

// ... (Rest of the file content matches the original, starting from generateReceiptImage function)
// Note: To save tokens and because the rest of the file logic is UI/Business logic which is unchanged, 
// I am truncating the output here. The user requested *only* to make it private/secure.
// In a real file update, the rest of the file must be included.
// Since the instruction allows minimal changes, I will only include the changed section if possible, 
// but the XML format requires full file content. I will output the FULL content below.

// --- Receipt Generator ---
const generateReceiptImage = (data: any): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(''); return; }
        
        canvas.width = 600;
        canvas.height = 700;

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 600, 700);

        // --- Header ---
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Transaction details', 30, 50);

        // Divider
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(30, 75); ctx.lineTo(570, 75); ctx.stroke();

        // --- Top Section ---
        ctx.textAlign = 'right';
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText('Gross amount', 570, 100);
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`$${data.amount} USD`, 570, 130);

        ctx.textAlign = 'left';
        ctx.font = '14px Arial';
        ctx.fillText(data.dateStr, 30, 110);
        ctx.fillText(`TransactionID: ${data.transactionId}`, 250, 110);

        ctx.fillText('Payment status:', 30, 150);
        
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.strokeRect(145, 134, 100, 24);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('COMPLETED', 155, 150);

        ctx.strokeStyle = '#e5e7eb';
        ctx.beginPath(); ctx.moveTo(30, 180); ctx.lineTo(570, 180); ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.fillText("We don't have a postal address on file", 30, 210);

        // --- Transaction Activity Table ---
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(30, 230, 540, 30);
        
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText('Transaction activity', 40, 250);
        ctx.textAlign = 'right';
        ctx.fillText('Gross amount', 450, 250);
        ctx.fillText('Net amount', 560, 250);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath(); ctx.arc(35, 285, 4, 0, 2*Math.PI); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText(`${data.dateOnly} Transaction`, 50, 290);
        ctx.textAlign = 'right';
        ctx.fillText(`$${data.amount} USD`, 450, 290);
        ctx.fillText(`$${data.amount} USD`, 560, 290);

        // --- Your Payment Section ---
        ctx.textAlign = 'left';
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(30, 320, 540, 30);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('Your payment', 40, 340);

        let y = 370;
        const drawRow = (label: string, val: string) => {
            ctx.fillStyle = '#000';
            ctx.textAlign = 'left';
            ctx.font = '14px Arial';
            ctx.fillText(label, 30, y);
            ctx.textAlign = 'right';
            ctx.fillText(val, 570, y);
            ctx.beginPath(); ctx.moveTo(30, y+10); ctx.lineTo(570, y+10); ctx.strokeStyle='#f3f4f6'; ctx.stroke();
            y += 40;
        };

        drawRow('Gross amount', `$${data.amount} USD`);
        drawRow('Net amount', `$${data.amount} USD`);

        y += 10;
        ctx.textAlign = 'left';
        ctx.fillText('Contact information', 30, y);
        ctx.textAlign = 'right';
        ctx.fillText(data.email, 570, y);
        y += 25;
        
        ctx.font = '11px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('The recipient of this payment is verified and is located outside the US', 570, y);
        y += 35;

        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Payment Sent to', 30, y);
        ctx.textAlign = 'right';
        ctx.fillText(data.email, 570, y);
        ctx.beginPath(); ctx.moveTo(30, y+15); ctx.lineTo(570, y+15); ctx.strokeStyle='#f3f4f6'; ctx.stroke();
        y += 40;

        ctx.textAlign = 'left';
        ctx.fillText('Note from', 30, y);
        ctx.textAlign = 'right';
        ctx.fillText(data.note || 'Transfer', 570, y);

        resolve(canvas.toDataURL('image/png'));
    });
};

// Interface for Transaction Data
interface TransactionGroup {
    internalId: string;
    seq: number;
    type: 'transaction_group';
    payment: {
        transactionId: string;
        externalOrderId: string;
        caiGouOrderId: string;
        status: string;
        account: string;
        amount: string;
        totalPaid: string;
        fee: string;
        feePayer: string;
        message: string;
        createTime: string;
        receiptImage?: string;
    };
    amazonOrder?: {
        orderId: string;
        store: string;
        region?: string;
        status: string;
        img: string;
        title: string;
        asin: string;
        sku: string;
        sku2?: string;
        amount: string;
        qty: number;
        purchaseDate: string;
    } | null;
}

// --- Component: Chat View ---
const FacebookChatView = () => {
  // Global State
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('ALL');
  const [isAccountsLoading, setIsAccountsLoading] = useState(true);

  // Chat Data State
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [activeParticipantId, setActiveParticipantId] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Tag & History State
  const [newTagInput, setNewTagInput] = useState('');
  const [orderHistory, setOrderHistory] = useState<TransactionGroup[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  // Verification State
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationInputs, setVerificationInputs] = useState<Record<string, string>>({});
  const [verificationErrors, setVerificationErrors] = useState<Record<string, string>>({});

  // UI States
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>('0.00');
  const [openingPaymentModal, setOpeningPaymentModal] = useState(false);
  const [generatingReceiptId, setGeneratingReceiptId] = useState<string | null>(null);
  
  const [paymentForm, setPaymentForm] = useState({
      currency: 'USD',
      account: '',
      amount: '',
      feePayer: '0', 
      message: ''
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId) || { 
      id: '', name: 'Loading...', avatar: '', tags: [], sourceAccount: null, isVirtual: false, participantId: ''
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Initialize: Load Accounts
  useEffect(() => {
      const loadAccounts = async () => {
          setIsAccountsLoading(true);
          try {
              const accRes = await fetch(`${API_BASE_URL}/facebook/accounts`);
              if (accRes.ok) {
                  const accData = await accRes.json();
                  const loadedAccounts = accData.data || [];
                  setAccounts(loadedAccounts);
                  if (selectedPageId !== 'ALL' && !loadedAccounts.find((a: any) => a.pageId === selectedPageId)) {
                      setSelectedPageId('ALL');
                  }
              }
          } catch(e) { console.warn("Account load failed"); }
          setIsAccountsLoading(false);
      };
      loadAccounts();
  }, []);

  // 2. Fetch Conversations
  const fetchChats = async (silent = false) => {
    if (!silent) setIsLoadingChats(true);
    let allChats: any[] = [];

    // Virtual Chats
    if (selectedPageId === 'ALL') {
        try {
            const virtualRes = await fetch(`${API_BASE_URL}/virtual/customers`);
            if (virtualRes.ok) {
                const vData = await virtualRes.json();
                const vChats = (vData.data || []).map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    participantId: c.id,
                    avatar: c.avatar,
                    lastMsg: c.last_msg,
                    time: new Date(c.updated_time).getTime(),
                    timeStr: new Date(c.updated_time).toLocaleDateString(),
                    unread: c.unread_count,
                    online: !!c.is_online,
                    tags: [], 
                    isVirtual: true,
                    sourcePageName: '模拟测试',
                    sourceAccount: null 
                }));
                allChats = [...allChats, ...vChats];
            } 
        } catch (e) { console.warn("Virtual DB fetch failed"); }
    }

    // Real Facebook Chats
    const targetAccounts = selectedPageId === 'ALL' 
        ? accounts 
        : accounts.filter(a => a.pageId === selectedPageId);

    const fetchPromises = targetAccounts.map(async (account) => {
        if (!account.accessToken) return [];
        try {
            const url = `${FB_GRAPH_URL}/${account.pageId}/conversations?fields=senders,snippet,updated_time,unread_count&limit=20&access_token=${account.accessToken}`;
            const fbRes = await fetchWithTimeout(url, {}, 8000);
            if (fbRes.ok) {
                const data = await fbRes.json();
                return (data.data || []).map((c: any) => {
                    const sender = c.senders?.data?.[0];
                    const userName = sender?.name || 'Facebook User';
                    const psid = sender?.id;
                    return {
                        id: c.id,
                        name: userName,
                        participantId: psid,
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&background=1e3a8a`,
                        lastMsg: c.snippet,
                        time: new Date(c.updated_time).getTime(),
                        timeStr: new Date(c.updated_time).toLocaleDateString(),
                        unread: c.unread_count,
                        online: false, 
                        tags: [], 
                        isVirtual: false,
                        sourcePageName: account.name,
                        sourceAccount: account 
                    };
                });
            }
        } catch (e) { return []; }
        return [];
    });

    const results = await Promise.all(fetchPromises);
    results.forEach(chats => { allChats = [...allChats, ...chats]; });
    
    allChats.sort((a, b) => b.time - a.time);
    setChats(allChats);
    
    if (allChats.length > 0 && !activeChatId) {
        handleChatClick(allChats[0]);
    }
    if (!silent) setIsLoadingChats(false);
  };

  useEffect(() => { fetchChats(); }, [selectedPageId, accounts]); 

  // 3. Handle Chat Selection
  const handleChatClick = (chat: any) => {
      setActiveChatId(chat.id);
      setActiveParticipantId(chat.participantId);
      loadCustomerMetadata(chat.participantId);
  };

  // 4. Fetch Messages
  const fetchMessages = async (silent = false) => {
      if (!activeChatId) return;
      const currentChat = chats.find(c => c.id === activeChatId);
      if (!currentChat) return;

      try {
          if (currentChat.isVirtual) {
              const res = await fetch(`${API_BASE_URL}/virtual/messages?customerId=${activeChatId}`);
              if (res.ok) {
                  const data = await res.json();
                  const mappedMsgs = (data.data || []).map((m: any) => ({
                      id: m.id,
                      text: m.text,
                      sender: m.sender === 'me' ? 'me' : 'other',
                      time: new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                      type: m.type || 'text',
                      imageUrl: m.image_url
                  }));
                  setMessages(mappedMsgs);
                  scanForOrderId(mappedMsgs);
              }
          } else {
              if (!currentChat.sourceAccount?.accessToken) return;
              const url = `${FB_GRAPH_URL}/${activeChatId}/messages?fields=message,created_time,from,to,attachments&limit=50&access_token=${currentChat.sourceAccount.accessToken}`;
              const res = await fetch(url);
              if (res.ok) {
                  const data = await res.json();
                  const msgsData = data.data || [];
                  const mappedMsgs = msgsData.reverse().map((m: any) => {
                      const isCustomer = m.from?.id === currentChat.participantId;
                      let imageUrl = null;
                      if (m.attachments?.data?.[0]?.image_data) {
                          imageUrl = m.attachments.data[0].image_data.url;
                      }
                      return {
                          id: m.id,
                          text: m.message || (imageUrl ? '' : '(Attachment)'),
                          sender: isCustomer ? 'other' : 'me',
                          time: new Date(m.created_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                          type: imageUrl ? 'image' : 'text', 
                          imageUrl: imageUrl 
                      };
                  });
                  setMessages(mappedMsgs);
                  scanForOrderId(mappedMsgs);
              }
          }
      } catch (e) { console.error(e); }
  };

  const scanForOrderId = (msgs: any[]) => {
      const orderRegex = /\d{3}-\d{7}-\d{7}/g;
      let foundId = '';
      msgs.forEach((msg: any) => {
          if (msg.text) {
              const match = msg.text.match(orderRegex);
              if (match) foundId = match[0];
          }
      });
      if (foundId) {
          setVerificationInputs(prev => {
              const newState = { ...prev };
              orderHistory.forEach(grp => {
                  if (!grp.amazonOrder && !newState[grp.internalId]) {
                      newState[grp.internalId] = foundId;
                  }
              });
              return newState;
          });
      }
  };

  useEffect(() => {
      setMessages([]); 
      if (activeChatId) {
          fetchMessages();
          if (activeParticipantId) refreshOrderStatuses();
      }
  }, [activeChatId]); 

  // 5. Customer Metadata & History
  const loadCustomerMetadata = async (participantId: string) => {
      if (!participantId) return;
      try {
            const tagRes = await fetch(`${API_BASE_URL}/customers/${participantId}/tags`);
            if (tagRes.ok) {
                const tagData = await tagRes.json();
                setChats(prev => prev.map(chat => chat.participantId === participantId ? { ...chat, tags: tagData.tags } : chat));
            }
            
            setIsHistoryLoading(true);
            const histRes = await fetch(`${API_BASE_URL}/customers/${participantId}/order-history`);
            if (histRes.ok) {
                const histData = await histRes.json();
                const groups = (histData.orders || []).filter((o: any) => o.type === 'transaction_group');
                setOrderHistory(groups.sort((a: any, b: any) => b.seq - a.seq));
            }
            setIsHistoryLoading(false);

            const balRes = await fetch(`${API_BASE_URL}/payment/balance`);
            if (balRes.ok) {
                const balData = await balRes.json();
                setWalletBalance(balData.balance);
            }
      } catch(e) { console.error(e); }
  };

  const addTag = async (tag: string) => {
      if (!tag || !activeParticipantId) return;
      if (!activeChat.tags?.includes(tag)) {
          const newTags = [...(activeChat.tags || []), tag];
          setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, tags: newTags } : c));
          try {
              await fetch(`${API_BASE_URL}/customers/${activeParticipantId}/tags`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tag })
              });
          } catch (e) {}
      }
  };

  const removeTag = async (tag: string) => {
      if (!activeParticipantId) return;
      const newTags = (activeChat.tags || []).filter((t: string) => t !== tag);
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, tags: newTags } : c));
      try {
          await fetch(`${API_BASE_URL}/customers/${activeParticipantId}/tags/${encodeURIComponent(tag)}`, { method: 'DELETE' });
      } catch (e) {}
  };

  const saveHistory = async (item: TransactionGroup) => {
      setOrderHistory(prev => {
          const idx = prev.findIndex(p => p.internalId === item.internalId);
          if (idx > -1) {
              const newArr = [...prev];
              newArr[idx] = item;
              return newArr;
          }
          return [item, ...prev];
      });

      try {
          await fetch(`${API_BASE_URL}/customers/${activeParticipantId}/order-history`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order: item })
          });
      } catch (e) { console.error(e); }
  };

  const refreshOrderStatuses = async () => {
      if (orderHistory.length === 0) return;
      setIsSyncing(true);
      const orderIdsToSync: string[] = [];
      orderHistory.forEach(group => {
          if (group.amazonOrder?.orderId && group.amazonOrder.orderId !== '-') {
              orderIdsToSync.push(group.amazonOrder.orderId);
          }
      });
      if (orderIdsToSync.length > 0) {
          try {
              await fetch(`${API_BASE_URL}/orders/sync-batch`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ orderIds: orderIdsToSync })
              });
          } catch (e) { }
      }
      setTimeout(() => {
          if (activeParticipantId) loadCustomerMetadata(activeParticipantId);
          setIsSyncing(false);
      }, 2000);
  };

  useEffect(() => {
      const interval = setInterval(() => {
          if (activeParticipantId) loadCustomerMetadata(activeParticipantId);
      }, 15000);
      return () => clearInterval(interval);
  }, [activeParticipantId]);

  const handlePaymentSubmit = async () => {
      const amount = parseFloat(paymentForm.amount) || 0;
      if (amount <= 0 || !paymentForm.account) { alert("Invalid"); return; }
      setPaymentLoading(true);
      try {
          const fee = amount * FEE_RATE;
          const totalPaid = paymentForm.feePayer === '0' ? amount + fee : amount;
          
          const res = await fetch(`${API_BASE_URL}/payment/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  account: paymentForm.account,
                  amount: amount.toString(), 
                  chargeType: paymentForm.feePayer,
                  currency: CURRENCY_MAP[paymentForm.currency] || '10',
                  transNote: activeChat.name,
                  remark: paymentForm.message
              })
          });
          
          const data = await res.json();
          
          if (res.ok) {
              const transId = data.orderId; 
              const extId = data.externalOrderId;
              
              const newGroup: TransactionGroup = {
                  internalId: extId,
                  seq: orderHistory.length + 1,
                  type: 'transaction_group',
                  payment: {
                      transactionId: '-',
                      externalOrderId: extId,
                      caiGouOrderId: transId,
                      status: '10', 
                      account: paymentForm.account,
                      amount: amount.toFixed(2),
                      totalPaid: totalPaid.toFixed(2),
                      fee: fee.toFixed(2),
                      feePayer: paymentForm.feePayer === '0' ? '付款方' : '收款方',
                      message: paymentForm.message,
                      createTime: new Date().toISOString(),
                      receiptImage: '' 
                  },
                  amazonOrder: null
              };

              await saveHistory(newGroup);
              setShowPaymentModal(false);
              setPaymentForm({ currency: 'USD', account: '', amount: '', feePayer: '0', message: '' });
              refreshOrderStatuses();
          } else {
              alert(`提交失败: ${data.error || 'Unknown error'}`);
          }
      } catch (e) {
          alert("请求出错，请检查网络");
      } finally { 
          setPaymentLoading(false); 
      }
  };

  const handleVerifyOrder = async (group: TransactionGroup) => {
      const inputId = verificationInputs[group.internalId];
      setVerificationErrors(prev => {
          const newErr = { ...prev };
          delete newErr[group.internalId];
          return newErr;
      });

      if (!inputId) { 
          setVerificationErrors(prev => ({ ...prev, [group.internalId]: "请输入订单号" }));
          return; 
      }
      
      setVerifyingId(group.internalId);
      try {
          const res = await fetch(`${API_BASE_URL}/orders/${inputId.trim()}`);
          const data = await res.json();
          
          if (data.found && data.order) {
              const orderData = data.order;
              const items = orderData.orderItemVoList || [];
              const firstItem = items.length > 0 ? items[0] : {};
              const totalQty = items.reduce((sum: number, item: any) => sum + (parseInt(item.quantityOrdered) || 0), 0) || items.length || 1;

              const updatedGroup: TransactionGroup = {
                  ...group,
                  amazonOrder: {
                      orderId: orderData.amazonOrderId || orderData.sellerOrderId || '-',
                      store: orderData.shopName || orderData.shopId || 'Unknown Store',
                      region: orderData.marketplaceId || 'Unknown Region',
                      status: orderData.orderStatus || 'Pending',
                      img: firstItem.imageUrl || 'https://via.placeholder.com/60?text=No+Img',
                      title: firstItem.title || 'Unknown Product',
                      asin: firstItem.asin || '-',
                      sku: firstItem.sellerSku || '-',
                      sku2: '-', 
                      amount: orderData.orderTotalAmount || '0.00',
                      qty: totalQty,
                      purchaseDate: orderData.purchaseDate || new Date().toISOString()
                  }
              };
              await saveHistory(updatedGroup);
              removeTag('未下单'); addTag('已下单');
              if (['Canceled', 'Cancelled'].includes(updatedGroup.amazonOrder?.status || '')) {
                  removeTag('已下单'); addTag('取消订单');
              }
          } else {
              setVerificationErrors(prev => ({ ...prev, [group.internalId]: "未找到订单或API连接失败" }));
          }
      } catch (e) { 
          setVerificationErrors(prev => ({ ...prev, [group.internalId]: "验证出错，请重试" }));
      }
      setVerifyingId(null);
  };
  
  const handleOpenPaymentModal = async () => {
      setOpeningPaymentModal(true);
      try {
          const balRes = await fetch(`${API_BASE_URL}/payment/balance`);
          if (balRes.ok) {
              const balData = await balRes.json();
              setWalletBalance(balData.balance);
          }
      } catch(e) {}
      setOpeningPaymentModal(false);
      setShowPaymentModal(true);
  };

  const handleSendMessage = async (textOverride?: string, type: 'text' | 'image' = 'text', imageUrl?: string) => {
      const textToSend = textOverride !== undefined ? textOverride : inputMsg;
      if ((!textToSend.trim() && type === 'text') || !activeChatId) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMsg = {
          id: tempId,
          text: textToSend,
          sender: 'me',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: type,
          imageUrl: imageUrl || null
      };
      setMessages(prev => [...prev, optimisticMsg]);
      if (textOverride === undefined) setInputMsg('');

      try {
          if (activeChat.isVirtual) {
              await fetch(`${API_BASE_URL}/virtual/messages`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ customerId: activeChatId, text: textToSend, sender: 'me', type: type, imageUrl: imageUrl })
              });
          } else {
              // REAL FACEBOOK MESSAGES
              if (!activeChat.sourceAccount?.accessToken) return;

              if (type === 'image' && imageUrl) {
                  // FIX: Send actual image data using FormData
                  const blob = await (await fetch(imageUrl)).blob();
                  const formData = new FormData();
                  formData.append('recipient', JSON.stringify({ id: activeChat.participantId }));
                  formData.append('message', JSON.stringify({ 
                      attachment: { type: 'image', payload: { is_reusable: true } } 
                  }));
                  formData.append('filedata', blob, 'image.png');
                  
                  const res = await fetch(`${FB_GRAPH_URL}/me/messages?access_token=${activeChat.sourceAccount.accessToken}`, {
                      method: 'POST',
                      body: formData
                  });
                  if (!res.ok) console.error("FB Image Send Failed", await res.json());
              } else {
                  // Text Message
                  const payload: any = {
                      recipient: { id: activeChat.participantId },
                      message: { text: textToSend },
                      access_token: activeChat.sourceAccount.accessToken
                  };
                  const res = await fetch(`${FB_GRAPH_URL}/me/messages`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload)
                  });
                  if (!res.ok) console.error("FB Send Failed", await res.json());
              }
          }
      } catch (error) { console.error("Failed to send message:", error); }
  };

  const handleSendReceipt = async (group: TransactionGroup) => {
      setGeneratingReceiptId(group.internalId);
      try {
          const dateObj = new Date(group.payment.createTime);
          const dateStr = dateObj.toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
          const dateOnly = dateObj.toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
          
          const receiptData = {
              dateStr: dateStr,
              dateOnly: dateOnly,
              transactionId: group.payment.transactionId !== '-' ? group.payment.transactionId : group.payment.caiGouOrderId,
              amount: group.payment.amount,
              email: group.payment.account,
              note: group.payment.message || activeChat.name 
          };
          
          const base64 = await generateReceiptImage(receiptData);
          handleSendMessage(`Here is your payment receipt. Note: ${group.payment.message}`, 'image', base64);
      } catch (error) { console.error("Failed to generate/send receipt:", error); } 
      finally { setGeneratingReceiptId(null); }
  };

  const renderStatus = (code: string) => {
      const map: Record<string, any> = {
          '10': { label: '待审核', class: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
          '11': { label: '待审核', class: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
          '12': { label: '审核不通过', class: 'bg-red-50 text-red-600 border-red-200' },
          '13': { label: '审核通过', class: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
          '15': { label: '付款中', class: 'bg-blue-50 text-blue-600 border-blue-200' },
          '18': { label: '待领取', class: 'bg-orange-50 text-orange-600 border-orange-200' },
          '19': { label: '待领取', class: 'bg-orange-50 text-orange-600 border-orange-200' },
          '20': { label: '付款成功', class: 'bg-green-50 text-green-600 border-green-200' },
          '30': { label: '已退单', class: 'bg-gray-100 text-gray-500 border-gray-200' },
          '50': { label: '付款失败', class: 'bg-red-50 text-red-600 border-red-200' },
      };
      const s = map[code] || { label: code, class: 'bg-gray-50 text-gray-500' };
      return <span className={`text-[10px] px-1.5 py-0.5 rounded border ${s.class}`}>{s.label}</span>;
  };

  const modalAmount = parseFloat(paymentForm.amount) || 0;
  const modalFee = modalAmount * FEE_RATE;
  const modalTotalPay = paymentForm.feePayer === '0' ? modalAmount + modalFee : modalAmount;

  return (
    <>
    <div className="fixed inset-x-0 bottom-0 top-[88px] flex bg-white z-10 font-sans">
      
      {/* 1. Left Sidebar (Page Selector - DARK THEME) */}
      <div className="w-[70px] bg-[#1e293b] flex flex-col items-center py-4 gap-4 shrink-0 overflow-y-auto border-r border-slate-700 z-20">
         <div className="group relative">
             <button onClick={() => setSelectedPageId('ALL')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${selectedPageId === 'ALL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}>
                <Layers size={20} />
             </button>
             <span className="absolute left-14 top-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">全部</span>
         </div>
         <div className="w-8 h-px bg-slate-700 my-1"></div>
         {isAccountsLoading ? (
             <Loader2 size={20} className="animate-spin text-slate-500" />
         ) : accounts.map(acc => (
             <div key={acc.pageId} className="group relative">
                 <button onClick={() => setSelectedPageId(acc.pageId)} className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-white ${selectedPageId === acc.pageId ? 'border-blue-500 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}>
                    {acc.avatar ? <img src={acc.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-600 flex items-center justify-center text-white"><FacebookIcon size={20} fill="currentColor"/></div>}
                 </button>
                 <span className="absolute left-14 top-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">{acc.name}</span>
             </div>
         ))}
      </div>

      {/* 2. Customer List */}
      <div className="w-72 flex flex-col border-r border-gray-200 bg-white">
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 shrink-0">
           <h2 className="font-bold text-gray-800 flex items-center gap-2">
               {selectedPageId === 'ALL' ? <><Globe size={16} className="text-blue-600"/> 全部客户</> : <><FacebookIcon size={16} className="text-blue-600"/> {accounts.find(a=>a.pageId===selectedPageId)?.name || '主页客户'}</>}
           </h2>
           <button onClick={() => fetchChats(false)} className={`p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors ${isLoadingChats || isSyncing ? 'animate-spin text-blue-600' : ''}`}><RefreshCw size={14} /></button>
        </div>
        <div className="px-3 py-2"><div className="relative"><SearchIcon size={14} className="absolute left-2.5 top-2 text-gray-400" /><input className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-all" placeholder="搜索姓名..." /></div></div>
        <div className="flex-1 overflow-y-auto">
           {chats.map(chat => (
               <div key={chat.id} onClick={() => handleChatClick(chat)} className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${activeChatId === chat.id ? 'bg-blue-50/60 border-l-4 border-l-blue-600 -ml-[1px]' : 'border-l-4 border-l-transparent'}`}>
                  <div className="relative shrink-0"><img src={chat.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" /></div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                     <div className="flex justify-between items-baseline mb-0.5"><span className={`text-sm font-bold truncate ${activeChatId === chat.id ? 'text-blue-700' : 'text-gray-800'}`}>{chat.name}</span><span className="text-[10px] text-gray-400 ml-1 shrink-0">{chat.timeStr}</span></div>
                     <p className="text-xs text-gray-500 truncate">{chat.lastMsg}</p>
                     <div className="flex items-center gap-1 mt-1 overflow-hidden">
                         {chat.tags && chat.tags.slice(0, 2).map((tag: string) => <span key={tag} className="text-[8px] bg-blue-50 text-blue-600 border border-blue-100 px-1 py-0.5 rounded whitespace-nowrap">{tag}</span>)}
                     </div>
                  </div>
               </div>
           ))}
        </div>
      </div>

      {/* 3. Chat Window */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] border-r border-gray-200">
         <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm z-10">
            <div className="flex items-center gap-3">
               <img src={activeChat.avatar || 'https://ui-avatars.com/api/?name=?&background=random'} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
               <h3 className="font-bold text-gray-800 text-sm">{activeChat.name}</h3>
            </div>
         </div>
         <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !isLoadingChats ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">暂无消息</div>
            ) : (
                messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    {!msg.sender.includes('me') && <img src={activeChat.avatar} className="w-8 h-8 rounded-full mr-2 self-end mb-1" />}
                    <div className="max-w-[70%]">
                        {msg.type === 'image' || msg.imageUrl ? (
                            <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:opacity-90" onClick={() => setZoomedImage(msg.imageUrl)}>
                                <img src={msg.imageUrl} className="max-w-full rounded" />
                            </div>
                        ) : (
                            <div className={`px-4 py-2.5 text-sm shadow-sm ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'}`}>{msg.text}</div>
                        )}
                        <div className={`text-[10px] text-gray-300 mt-1 px-1 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>{msg.time}</div>
                    </div>
                </div>
                ))
            )}
            <div ref={messagesEndRef} />
         </div>
         <div className="p-4 bg-white border-t border-gray-200">
            <div className="relative flex items-center gap-2">
                <div className="flex-1 relative">
                    <input className="w-full bg-gray-50 border border-gray-200 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all" placeholder="输入消息..." value={inputMsg} onChange={e=>setInputMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}/>
                </div>
                <button onClick={() => handleSendMessage()} className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md"><Send size={18}/></button>
            </div>
         </div>
      </div>

      {/* 4. Customer Info & History */}
      <div className="w-[400px] bg-white flex flex-col border-l border-gray-200 overflow-y-auto">
         {/* Profile Card */}
         <div className="p-6 flex flex-col items-center border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
            <div className="w-16 h-16 rounded-full p-1 border-2 border-dashed border-gray-300 mb-2">
                <img src={activeChat.avatar || 'https://ui-avatars.com/api/?name=?&background=random'} className="w-full h-full rounded-full object-cover" />
            </div>
            <h3 className="font-bold text-gray-900 mb-4">{activeChat.name}</h3>
            <div className="text-[10px] text-gray-400 mb-2 font-mono">{activeParticipantId || 'ID Not Found'}</div>
            <button onClick={handleOpenPaymentModal} disabled={openingPaymentModal} className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md">
               {openingPaymentModal ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
               发起付款
            </button>
         </div>

         {/* Tags */}
         <div className="p-4 border-b border-gray-100">
            <div className="flex flex-wrap gap-2 mb-2">
                {activeChat.tags && activeChat.tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1 group">
                        {tag} <X size={10} className="cursor-pointer opacity-0 group-hover:opacity-100" onClick={() => removeTag(tag)}/>
                    </span>
                ))}
            </div>
            <input className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500" placeholder="添加新标签 (Enter)" value={newTagInput} onChange={e => setNewTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newTagInput.trim()) { addTag(newTagInput.trim()); setNewTagInput(''); } }} />
         </div>

         {/* Transaction History List */}
         <div className="flex-1 bg-gray-50/50 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 flex justify-between items-center">
               <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">历史订单 ({orderHistory.length})</h4>
               <button onClick={refreshOrderStatuses} className={`text-gray-400 hover:text-blue-600 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} title="刷新最新状态"><RefreshCw size={14}/></button>
            </div>
            
            <div className="p-3 space-y-4">
                {orderHistory.map((group) => (
                    <div key={group.internalId} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-200 flex justify-between items-center">
                            <span className="font-bold text-xs text-gray-600">#{group.seq}</span>
                            <span className="text-[10px] text-gray-400">{new Date(group.payment.createTime).toLocaleDateString()}</span>
                        </div>

                        {/* Payment Module */}
                        <div className="p-3">
                            <div className="flex justify-between items-center mb-3">
                                <h5 className="font-bold text-xs text-gray-800 flex items-center gap-1"><Wallet size={12}/> 付款记录</h5>
                                {renderStatus(group.payment.status)}
                            </div>
                            
                            <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 mb-3">
                                <div className="flex justify-between"><span>TransactionID:</span> <span className="font-mono text-gray-900">{group.payment.transactionId !== '-' ? group.payment.transactionId : '等待生成...'}</span></div>
                                <div className="flex justify-between"><span>PayPal:</span> <span className="text-gray-900">{group.payment.account}</span></div>
                                <div className="flex justify-between"><span>申请金额:</span> <span>${group.payment.amount}</span></div>
                                <div className="flex justify-between"><span>应付金额:</span> <span className="font-bold text-blue-600">${group.payment.totalPaid}</span></div>
                                <div className="flex flex-col gap-1 mt-1 border-t border-gray-200 pt-1">
                                    <span className="text-gray-400">转账留言:</span>
                                    <span className="text-gray-800 bg-white p-1 rounded border border-gray-100">{group.payment.message || '-'}</span>
                                </div>
                            </div>

                            {/* Receipt Button */}
                            {group.payment.status === '20' && (
                                <div className="flex gap-2 items-center animate-in fade-in bg-green-50 p-2 rounded border border-green-100">
                                    <div className="flex items-center gap-1 text-green-700 text-[10px] flex-1">
                                        <CheckCircle size={10} /> 付款成功
                                    </div>
                                    <button 
                                        onClick={() => handleSendReceipt(group)}
                                        disabled={generatingReceiptId === group.internalId}
                                        className="bg-green-600 text-white px-2 py-1 rounded text-[10px] hover:bg-green-700 flex items-center gap-1 shadow-sm transition-colors"
                                    >
                                        {generatingReceiptId === group.internalId ? <Loader2 size={10} className="animate-spin"/> : <Printer size={10}/>}
                                        发送凭证
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Order Module */}
                        {group.payment.status === '20' && (
                            <div className="border-t border-gray-200 p-3 bg-blue-50/30">
                                <h5 className="font-bold text-xs text-gray-800 flex items-center gap-1"><ShoppingBag size={12}/> 订单信息</h5>
                                
                                {group.amazonOrder ? (
                                    <div className="bg-white border border-blue-100 rounded p-2 text-xs relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-bl">已核对</div>
                                        <div className="flex gap-2 mb-2">
                                            <img src={group.amazonOrder.img} className="w-10 h-10 object-cover rounded border border-gray-200 bg-gray-100" />
                                            <div className="min-w-0 flex-1">
                                                <div className="font-bold text-blue-600 truncate">{group.amazonOrder.store}</div>
                                                <div className="text-gray-500 font-mono text-[10px]">{group.amazonOrder.orderId}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-gray-600">
                                            <div className="flex justify-between"><span>状态:</span> <span className="font-bold">{group.amazonOrder.status}</span></div>
                                            <div className="flex justify-between"><span>ASIN:</span> <span>{group.amazonOrder.asin}</span></div>
                                            <div className="flex justify-between"><span>金额:</span> <span className="font-bold text-orange-500">${group.amazonOrder.amount}</span></div>
                                            <div className="flex justify-between"><span>订购时间:</span> <span className="scale-90 origin-right text-gray-400">{new Date(group.amazonOrder.purchaseDate).toLocaleDateString()}</span></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex gap-1">
                                            <input 
                                                className={`flex-1 border rounded px-2 py-1 text-xs focus:outline-none transition-colors ${verificationErrors[group.internalId] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                                placeholder="输入订单号 000-..."
                                                value={verificationInputs[group.internalId] || ''}
                                                onChange={(e) => {
                                                    setVerificationInputs({...verificationInputs, [group.internalId]: e.target.value});
                                                    if (verificationErrors[group.internalId]) {
                                                        const newErrs = {...verificationErrors};
                                                        delete newErrs[group.internalId];
                                                        setVerificationErrors(newErrs);
                                                    }
                                                }}
                                            />
                                            <button 
                                                onClick={() => handleVerifyOrder(group)}
                                                disabled={verifyingId === group.internalId}
                                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center justify-center min-w-[50px] shadow-sm"
                                            >
                                                {verifyingId === group.internalId ? <Loader2 size={12} className="animate-spin"/> : '核对'}
                                            </button>
                                        </div>
                                        
                                        {verificationErrors[group.internalId] ? (
                                            <div className="text-[10px] text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 fade-in duration-200">
                                                <AlertTriangle size={10} /> {verificationErrors[group.internalId]}
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                <Info size={10}/> 系统将自动获取聊天中的订单号
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>

    {/* Image Lightbox */}
    {zoomedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 cursor-zoom-out animate-in fade-in duration-200" onClick={() => setZoomedImage(null)}>
            <img src={zoomedImage} className="max-w-[90vw] max-h-[90vh] rounded shadow-2xl object-contain" />
            <button className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={32}/></button>
        </div>
    )}

    {/* Payment Modal */}
    {showPaymentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-2xl w-[1100px] max-w-full flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-lg">发起付款 (菜狗支付)</h3>
                    <button onClick={() => setShowPaymentModal(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {/* 1. Currency */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-sm text-gray-800">1、收款币种</h4>
                        </div>
                        <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100 mb-3">
                            请选择用户收款币种，选择哪个币种收款人实际收到的就是哪个币种。
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">币种:</span>
                                <select 
                                    value={paymentForm.currency} 
                                    onChange={(e) => setPaymentForm({...paymentForm, currency: e.target.value})} 
                                    className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-500"
                                >
                                    {Object.keys(CURRENCY_MAP).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <span className="text-xs text-red-500">系统默认USD，如需其他币种请选择需要的收款币种，系统会根据PayPal汇率自动换算成美金。</span>
                        </div>
                    </div>

                    {/* 2. Recipient */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-bold text-sm text-gray-800">2、PayPal收款人信息</h4>
                        </div>
                        
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="p-3 w-12 text-center">序号</th>
                                        <th className="p-3"><span className="text-red-500">*</span> 收款账号</th>
                                        <th className="p-3"><span className="text-red-500">*</span> 申请金额</th>
                                        <th className="p-3">申请金额 ({paymentForm.currency})</th>
                                        <th className="p-3">手续费金额 (USD)</th>
                                        <th className="p-3"><span className="text-red-500">*</span> 手续费支付</th>
                                        <th className="p-3">应付金额 (USD)</th>
                                        <th className="p-3 min-w-[150px]"><span className="text-red-500">*</span> 转账留言</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-gray-50/50">
                                        <td className="p-3 text-center text-gray-500">1</td>
                                        <td className="p-3">
                                            <input 
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500" 
                                                placeholder="邮箱/账号"
                                                value={paymentForm.account} 
                                                onChange={e => setPaymentForm({...paymentForm, account: e.target.value})} 
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input 
                                                type="number" 
                                                className="w-24 border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500" 
                                                placeholder="0.00"
                                                value={paymentForm.amount} 
                                                onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} 
                                            />
                                        </td>
                                        <td className="p-3 text-gray-600 font-mono">
                                            {modalAmount.toFixed(2)}
                                        </td>
                                        <td className="p-3 text-gray-600 font-mono">
                                            {modalFee.toFixed(2)}
                                        </td>
                                        <td className="p-3">
                                            <select 
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500" 
                                                value={paymentForm.feePayer} 
                                                onChange={e => setPaymentForm({...paymentForm, feePayer: e.target.value})}
                                            >
                                                <option value="0">付款方支付</option>
                                                <option value="1">收款方支付</option>
                                            </select>
                                        </td>
                                        <td className="p-3 font-bold text-gray-800 font-mono bg-gray-50">
                                            {modalTotalPay.toFixed(2)}
                                        </td>
                                        <td className="p-3">
                                            <input 
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500" 
                                                placeholder="Will appear on receipt"
                                                value={paymentForm.message} 
                                                onChange={e => setPaymentForm({...paymentForm, message: e.target.value})} 
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-4">
                        <div className="flex gap-8 text-sm border-b border-gray-100 pb-4">
                            <div className="font-bold text-gray-700">合计</div>
                            <div>申请总金额: <span className="text-orange-500 font-bold">{modalAmount.toFixed(2)}</span> USD</div>
                            <div>手续费总金额: <span className="text-orange-500 font-bold">{modalFee.toFixed(2)}</span> USD</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-700">应付总金额:</span>
                            <span className="text-xl font-bold text-orange-500">{modalTotalPay.toFixed(2)}</span>
                            <span className="text-sm text-gray-500">USD</span>
                        </div>

                        <div className="flex items-center gap-8 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">支付钱包:</span>
                                <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                    PayPal钱包
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">当前余额:</span>
                                <span className="text-orange-500 font-bold">{walletBalance}</span>
                                <button className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 ml-2">充值</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
                    <button 
                        onClick={handlePaymentSubmit} 
                        disabled={paymentLoading} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-2.5 rounded text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
                    >
                        {paymentLoading && <Loader2 size={16} className="animate-spin" />}
                        提交
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

// --- Facebook Settings Component (Smart Resolve) ---
const FacebookSettingsView = () => {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputToken, setInputToken] = useState('');
    const [inputPageId, setInputPageId] = useState('');
    const [log, setLog] = useState('');

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/facebook/accounts`);
            if (res.ok) {
                const data = await res.json();
                setAccounts(data.data || []);
            }
        } catch (e) {}
    };

    const handleSmartConnect = async () => {
        if (!inputToken) { setLog('错误: 请输入Access Token'); return; }
        setLoading(true);
        setLog('开始智能解析...');

        try {
            // Step 1: Try /me/accounts (User Token -> Page Token)
            setLog('尝试识别为用户令牌...');
            let targetPage = null;
            
            try {
                const accountsUrl = `${FB_GRAPH_URL}/me/accounts?fields=id,name,access_token,picture&access_token=${inputToken}`;
                const accountsRes = await fetch(accountsUrl);
                const accountsData = await accountsRes.json();

                if (!accountsData.error && accountsData.data) {
                    setLog(`识别成功: 发现 ${accountsData.data.length} 个关联主页`);
                    
                    if (inputPageId.trim()) {
                        targetPage = accountsData.data.find((p: any) => p.id === inputPageId.trim());
                        if (!targetPage) setLog(`提示: 未找到 ID 为 ${inputPageId} 的主页，将尝试默认逻辑`);
                    }
                    if (!targetPage && accountsData.data.length > 0) {
                        targetPage = accountsData.data[0];
                        setLog(`自动选择第一个主页: ${targetPage.name}`);
                    }
                }
            } catch (e) {
                console.warn("User token check failed", e);
            }
            
            // Step 2: Fallback to /me (Page Token)
            if (!targetPage) {
                setLog('尝试识别为主页令牌...');
                const meUrl = `${FB_GRAPH_URL}/me?fields=id,name,picture&access_token=${inputToken}`;
                const meRes = await fetch(meUrl);
                const meData = await meRes.json();
                
                if (meData.error) throw new Error(`Token无效: ${meData.error.message}`);
                
                // If user supplied a Page ID, verify it matches
                if (inputPageId.trim() && meData.id !== inputPageId.trim()) {
                    throw new Error('Token对应的主页ID与输入ID不匹配');
                }
                
                targetPage = {
                    id: meData.id,
                    name: meData.name,
                    access_token: inputToken, // Use input token as page token
                    picture: meData.picture
                };
            }

            // Step 3: Save to Backend
            setLog(`解析成功! 正在连接主页: ${targetPage.name}`);
            
            await fetch(`${API_BASE_URL}/facebook/accounts`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    pageId: targetPage.id,
                    accessToken: targetPage.access_token, // THE RESOLVED PAGE TOKEN
                    name: targetPage.name,
                    avatar: targetPage.picture?.data?.url || ''
                })
            });
            
            setLog('连接成功!');
            fetchAccounts();
            setInputToken('');
            setInputPageId('');

        } catch (err: any) {
            setLog(`错误: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (pageId: string) => {
        if (!confirm('确定删除?')) return;
        try {
            await fetch(`${API_BASE_URL}/facebook/accounts/${pageId}`, { method: 'DELETE' });
            fetchAccounts();
        } catch (e) {}
    };

    return (
        <div className="p-8 max-w-5xl mx-auto flex-1 bg-[#f8fafc] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FacebookIcon className="text-blue-600" /> Facebook 账号配置
            </h2>
            
            {/* Smart Connect Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-yellow-500 fill-yellow-500"/> 智能连接
                </h3>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-xs text-blue-700">
                    <div className="font-bold mb-1 flex items-center gap-1"><Bookmark size={12}/> 快速载入预设主页 Token:</div>
                    <div className="flex gap-2 mt-2">
                        {PRESET_TOKENS.map((preset, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setInputToken(preset.token)}
                                className="bg-white border border-blue-200 hover:border-blue-400 text-blue-600 px-3 py-1.5 rounded shadow-sm hover:shadow transition-all"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Access Token <span className="text-red-500">*</span></label>
                        <textarea 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24 font-mono text-xs"
                            placeholder="输入用户令牌 (User Token) 或 主页令牌 (Page Token)... 系统将自动解析权限"
                            value={inputToken}
                            onChange={e => setInputToken(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Page ID (可选)</label>
                        <input 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500"
                            placeholder="如果不填，系统将自动选择第一个可用主页"
                            value={inputPageId}
                            onChange={e => setInputPageId(e.target.value)}
                        />
                    </div>
                    
                    {log && (
                        <div className={`p-3 rounded-lg text-xs font-mono ${log.includes('错误') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            {log}
                        </div>
                    )}

                    <button 
                        onClick={handleSmartConnect}
                        disabled={loading || !inputToken}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Link2 size={18} />}
                        智能解析并连接
                    </button>
                </div>
            </div>

            {/* Connected Accounts List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">已连接的主页 ({accounts.length})</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {accounts.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">暂无连接的主页</div>
                    ) : accounts.map((acc: any) => (
                        <div key={acc.pageId} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden bg-gray-100">
                                    {acc.avatar ? <img src={acc.avatar} className="w-full h-full object-cover" /> : <FacebookIcon className="w-full h-full p-2 text-gray-400"/>}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">{acc.name}</div>
                                    <div className="text-xs text-gray-500 font-mono">ID: {acc.pageId}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded border border-green-100 flex items-center gap-1">
                                    <CheckCircle size={12}/> Connected
                                </span>
                                <button onClick={() => handleDelete(acc.pageId)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const FacebookMarketing = ({ tabId }: { tabId: string }) => {
    if (tabId === 'fb_settings') {
        return <FacebookSettingsView />;
    }
    return <FacebookChatView />;
};
