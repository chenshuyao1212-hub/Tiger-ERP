
import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  QrCode, 
  ChevronRight,
  ShoppingBag,
  Globe,
  ShoppingCart,
  Store,
  Box,
  Truck
} from 'lucide-react';
import { TigerLogo } from './TigerLogo';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loginMethod, setLoginMethod] = useState<'password' | 'sms'>('password');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: account, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Simple delay for visual effect
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 500);
      } else {
        setErrorMsg(data.message || '登录失败，请检查账号密码');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMsg('网络连接错误，请稍后重试');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans overflow-hidden">
      {/* --- Left Side: Ecosystem Visualization --- */}
      <div className="hidden lg:flex w-7/12 bg-[#eff6ff] relative items-center justify-center overflow-hidden flex-col">
        {/* Brand Logo Top Left */}
        <div className="absolute top-8 left-8">
           <TigerLogo className="text-slate-800" />
        </div>

        {/* Central Animation Area */}
        <div className="relative w-[600px] h-[600px] flex items-center justify-center">
           {/* Center Core */}
           <div className="z-20 w-40 h-40 bg-white rounded-full shadow-[0_0_40px_rgba(59,130,246,0.15)] flex items-center justify-center animate-pulse-slow">
              <div className="w-24 h-24">
                 <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 14 L17 5 L32 10 L47 5 L54 14 L58 32 L50 54 L32 60 L14 54 L6 32 L10 14 Z" fill="#F59E0B" />
                    <path d="M17 5 L21 16 L12 16 Z" fill="#92400E" />
                    <path d="M47 5 L43 16 L52 16 Z" fill="#92400E" />
                    <path d="M32 10 L27 22 L32 26 L37 22 Z" fill="#1E293B" />
                    <path d="M16 32 L28 34 L16 40 Z" fill="#1E293B" />
                    <path d="M48 32 L36 34 L48 40 Z" fill="#1E293B" />
                    <path d="M26 48 L32 44 L38 48 L32 58 Z" fill="#F8FAFC" />
                 </svg>
              </div>
           </div>

           {/* Orbit Rings */}
           <div className="absolute inset-0 border border-blue-200/40 rounded-full animate-spin-slower"></div>
           <div className="absolute inset-16 border border-blue-200/60 rounded-full border-dashed animate-reverse-spin"></div>
           
           {/* Floating Icons (Simulating Platforms) */}
           {/* Walmart */}
           <div className="absolute top-10 right-20 bg-white p-3 rounded-full shadow-lg flex items-center gap-2 animate-float">
              <span className="text-blue-600 font-bold text-sm">Walmart</span>
              <div className="text-yellow-400">✻</div>
           </div>

           {/* Shopee */}
           <div className="absolute top-20 left-20 bg-white p-3 rounded-full shadow-lg flex items-center gap-2 animate-float-delay-1">
              <div className="bg-orange-500 text-white p-1 rounded-sm"><ShoppingBag size={14}/></div>
              <span className="text-orange-500 font-bold text-sm">Shopee</span>
           </div>

           {/* Amazon */}
           <div className="absolute bottom-40 -right-4 bg-white p-4 rounded-full shadow-xl flex items-center justify-center animate-float-delay-2 w-24 h-24">
              <span className="font-bold text-slate-800 text-lg">Amazon</span>
           </div>

           {/* AliExpress */}
           <div className="absolute top-1/2 right-10 bg-white p-3 rounded-full shadow-lg flex items-center gap-1 animate-float">
              <span className="text-orange-500 font-bold">Ali</span><span className="text-red-500 font-bold">Express</span>
           </div>

           {/* Lazada */}
           <div className="absolute top-40 left-10 bg-white p-2 rounded-full shadow-md flex items-center gap-2 animate-float-delay-2">
              <div className="text-pink-600 font-bold text-lg">L</div>
              <span className="text-slate-700 text-xs font-bold">Lazada</span>
           </div>

           {/* SHEIN */}
           <div className="absolute bottom-10 left-20 bg-white w-20 h-20 rounded-full shadow-lg flex items-center justify-center animate-float">
              <span className="font-bold text-slate-900 tracking-wider">SHEIN</span>
           </div>

           {/* TikTok Shop */}
           <div className="absolute bottom-20 right-20 bg-white p-2 rounded-xl shadow-lg flex flex-col items-center animate-float-delay-1">
              <div className="bg-black text-white p-1.5 rounded-lg"><MusicNoteIcon /></div>
              <span className="text-[10px] font-bold mt-1">TikTok Shop</span>
           </div>

           {/* Ozon */}
           <div className="absolute top-1/2 -left-4 bg-white p-3 rounded-full shadow-md animate-float-delay-2">
              <span className="text-blue-500 font-bold text-sm">OZON</span>
           </div>
           
           {/* Mercado Libre */}
           <div className="absolute top-20 right-1/2 translate-x-20 bg-white p-2 rounded-full shadow-md flex flex-col items-center w-16 h-16 justify-center animate-float">
              <div className="text-yellow-500 text-xs">🤝</div>
              <span className="text-[8px] text-blue-900 leading-tight text-center">mercado<br/>libre</span>
           </div>

           {/* Shopify */}
           <div className="absolute bottom-32 left-1/3 bg-white p-2 rounded-full shadow-sm flex items-center gap-1 animate-float-delay-1">
              <ShoppingBag size={14} className="text-green-500"/>
              <span className="text-slate-700 text-xs font-bold">shopify</span>
           </div>

           {/* OTTO */}
           <div className="absolute bottom-1/3 right-1/3 translate-x-10 translate-y-10 bg-white p-2 rounded-full shadow-sm animate-float">
              <span className="text-red-600 font-black text-sm italic">OTTO</span>
           </div>

           {/* eBay */}
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 bg-white w-20 h-20 rounded-full shadow-lg flex items-center justify-center animate-float-delay-2">
              <span className="text-red-500 font-bold">e</span>
              <span className="text-blue-500 font-bold">b</span>
              <span className="text-yellow-500 font-bold">a</span>
              <span className="text-green-500 font-bold">y</span>
           </div>
        </div>
      </div>

      {/* --- Right Side: Login Form --- */}
      <div className="w-full lg:w-5/12 bg-white flex items-center justify-center p-8 relative">
         
         <div className="w-full max-w-[400px]">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
               <h2 className="text-2xl font-bold text-slate-800">登录</h2>
               <div className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer hover:text-blue-600 transition-colors border border-gray-200 rounded-full px-3 py-1">
                  <span>微信扫码登录</span>
                  <QrCode size={14} />
               </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mb-6 text-sm font-medium">
               <button 
                 className={`pb-2 transition-all ${loginMethod === 'password' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                 onClick={() => setLoginMethod('password')}
               >
                 密码登录
               </button>
               <button 
                 className={`pb-2 transition-all ${loginMethod === 'sms' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                 onClick={() => setLoginMethod('sms')}
               >
                 验证码登录
               </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
               {loginMethod === 'password' ? (
                 <>
                   <div className="group relative">
                      <div className="absolute left-3 top-2.5 text-gray-400">
                         <User size={18} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="请输入手机号/邮箱/账号" 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-700 placeholder:text-gray-300 bg-white"
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                      />
                   </div>
                   <div className="group relative">
                      <div className="absolute left-3 top-2.5 text-gray-400">
                         <Lock size={18} />
                      </div>
                      <input 
                        type="password" 
                        placeholder="请输入密码" 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-700 placeholder:text-gray-300 bg-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button type="button" className="absolute right-3 top-3 text-gray-300 hover:text-gray-500">
                         {/* Eye Icon would go here */}
                      </button>
                   </div>
                 </>
               ) : (
                 <>
                   <div className="group relative">
                      <div className="absolute left-3 top-2.5 text-gray-400">
                         <Smartphone size={18} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="请输入手机号" 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-700 placeholder:text-gray-300 bg-white"
                      />
                   </div>
                   <div className="flex gap-3">
                      <div className="group relative flex-1">
                          <div className="absolute left-3 top-2.5 text-gray-400">
                             <ShieldCheck size={18} />
                          </div>
                          <input 
                            type="text" 
                            placeholder="验证码" 
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-700 placeholder:text-gray-300 bg-white"
                          />
                      </div>
                      <button type="button" className="px-4 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:text-blue-600 hover:border-blue-200 whitespace-nowrap bg-gray-50 transition-colors">
                         获取验证码
                      </button>
                   </div>
                 </>
               )}

               {/* Captcha (Visual Mock) */}
               <div className="flex gap-3">
                  <div className="group relative flex-1">
                      <div className="absolute left-3 top-2.5 text-gray-400">
                         <ShieldCheck size={18} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="请输入图形验证码" 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-700 placeholder:text-gray-300 bg-white"
                      />
                  </div>
                  <div className="w-28 bg-slate-800 flex items-center justify-center text-white font-mono text-lg tracking-widest cursor-pointer rounded select-none relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      TA8v
                  </div>
               </div>

               {/* Footer Actions */}
               <div className="flex justify-between items-center text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800">
                     <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" defaultChecked />
                     5天内自动登录
                  </label>
                  <a href="#" className="text-gray-500 hover:text-blue-600">忘记密码?</a>
               </div>

               {errorMsg && (
                 <div className="text-red-500 text-xs text-center bg-red-50 py-2 rounded">
                   {errorMsg}
                 </div>
               )}

               <button 
                 type="submit" 
                 disabled={isLoading}
                 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded text-sm font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                 登录
               </button>

               <div className="text-center text-xs text-gray-400 mt-6">
                  没有账号? <a href="#" className="text-blue-600 hover:underline">去注册</a>
               </div>
            </form>
         </div>
      </div>
    </div>
  );
};

// Simple Music Note Icon for TikTok
const MusicNoteIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);
