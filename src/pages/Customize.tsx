import React from 'react';
import { Card, Button, Badge } from '../components/UI';
import { useTheme, palettes } from '../lib/ThemeContext';
import { Check, Palette, Maximize, Layout, ShieldCheck, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

export const CustomizePage: React.FC = () => {
  const { settings, updateSettings } = useTheme();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col">
        <h2 className="text-3xl font-black text-text-main tracking-tighter">System Customization</h2>
        <p className="text-text-muted font-bold text-xs uppercase tracking-[0.2em] mt-2">Adjust corporate identity and interface protocols</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Mode Switcher */}
          <Card title="Interface Protocol" subtitle="Switch between standard and low-light modes">
             <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateSettings({ mode: 'light' })}
                  className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${
                    settings.mode === 'light' 
                      ? 'border-accent-sage bg-accent-sage/5 shadow-lg shadow-accent-sage/10' 
                      : 'border-border-base bg-white dark:bg-zinc-900 hover:border-stone-300'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${settings.mode === 'light' ? 'bg-accent-sage text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-400'}`}>
                    <Sun size={24} />
                  </div>
                  <div className="text-left">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${settings.mode === 'light' ? 'text-text-main' : 'text-text-muted'}`}>Light Standard</p>
                    <p className="text-[9px] font-bold text-stone-400 uppercase mt-1">High Contrast</p>
                  </div>
                </button>

                <button
                  onClick={() => updateSettings({ mode: 'dark' })}
                  className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${
                    settings.mode === 'dark' 
                      ? 'border-accent-sage bg-accent-sage/5 shadow-lg shadow-accent-sage/10' 
                      : 'border-border-base bg-white dark:bg-zinc-900 hover:border-stone-300'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${settings.mode === 'dark' ? 'bg-accent-sage text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-400'}`}>
                    <Moon size={24} />
                  </div>
                  <div className="text-left">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${settings.mode === 'dark' ? 'text-text-main' : 'text-text-muted'}`}>Dark Mode</p>
                    <p className="text-[9px] font-bold text-stone-400 uppercase mt-1">Low strain</p>
                  </div>
                </button>
             </div>
          </Card>

          {/* Color Palettes */}
          <Card title="Enterprise Palette" subtitle="Select a preset brand identity or customize below">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(palettes).map(([name, colors]) => (
                <button
                  key={name}
                  onClick={() => updateSettings({ palette: name })}
                  className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 active:scale-95 ${
                    settings.palette === name 
                      ? 'border-accent-sage bg-accent-sage/5 shadow-lg shadow-accent-sage/10' 
                      : 'border-border-base hover:border-stone-300 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <div 
                    className="w-10 h-10 rounded-full shadow-lg border-2 border-white dark:border-zinc-800" 
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-main">{name}</span>
                  {settings.palette === name && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-accent-sage text-white rounded-full flex items-center justify-center shadow-md">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-border-base/50">
               <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Primary Brand Color</p>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl border border-border-base shadow-inner overflow-hidden">
                        <input 
                           type="color" 
                           value={settings.primaryColor} 
                           onChange={(e) => updateSettings({ primaryColor: e.target.value, palette: 'custom' })}
                           className="w-full h-full scale-150 cursor-pointer"
                        />
                     </div>
                     <div>
                        <p className="text-xs font-black font-mono text-text-main">{settings.primaryColor.toUpperCase()}</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Custom Selection</p>
                     </div>
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Secondary Accent Color</p>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl border border-border-base shadow-inner overflow-hidden">
                        <input 
                           type="color" 
                           value={settings.secondaryColor} 
                           onChange={(e) => updateSettings({ secondaryColor: e.target.value, palette: 'custom' })}
                           className="w-full h-full scale-150 cursor-pointer"
                        />
                     </div>
                     <div>
                        <p className="text-xs font-black font-mono text-text-main">{settings.secondaryColor.toUpperCase()}</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Custom Selection</p>
                     </div>
                  </div>
               </div>
            </div>
          </Card>

          {/* Border Radius */}
          <Card title="Structural Tone" subtitle="Define the edge curvature of UI elements">
            <div className="flex flex-wrap gap-4">
              {(['none', 'small', 'medium', 'large', 'full'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => updateSettings({ radius: r })}
                  className={`px-6 py-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${
                    settings.radius === r 
                      ? 'bg-text-main text-white border-text-main shadow-lg shadow-stone-200' 
                      : 'bg-white border-border-base text-text-muted hover:border-stone-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </Card>

          {/* Density */}
          <Card title="Workspace Density" subtitle="Adjust information accessibility and density">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => updateSettings({ density: d })}
                    className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-32 group ${
                      settings.density === d 
                        ? 'border-accent-sage bg-accent-sage/5' 
                        : 'border-border-base hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-text-main">{d}</span>
                       <div className={`w-3 h-3 rounded-full ${settings.density === d ? 'bg-accent-sage shadow-md' : 'bg-stone-200'}`} />
                    </div>
                    <div className="space-y-1.5">
                       <div className="h-1 bg-stone-300 rounded-full" style={{ width: d === 'compact' ? '40%' : d === 'comfortable' ? '60%' : '80%' }} />
                       <div className="h-1 bg-stone-100 rounded-full w-[90%]" />
                    </div>
                  </button>
               ))}
             </div>
          </Card>
        </div>

        <div className="space-y-8 lg:sticky lg:top-28 self-start">
           <Card className="bg-sidebar-bg text-white border-none p-6 md:p-10 h-full flex flex-col justify-between overflow-hidden relative shadow-2xl min-h-[300px] md:min-h-[500px]">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-12">
                   <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                      <ShieldCheck size={28} className="text-accent-sage" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black tracking-tight uppercase">Live Preview</h3>
                      <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-1">Staging Environment</p>
                   </div>
                </div>
                
                <div className="space-y-8">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <p className="text-[10px] text-stone-500 font-black uppercase tracking-[0.3em]">Module Interaction</p>
                         <Badge className="bg-white/10 text-white border-none">Real-Time Sync</Badge>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] shadow-inner">
                         <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-accent-sage flex items-center justify-center text-sm font-black shadow-lg shadow-accent-sage/30 transition-transform hover:scale-110">A*</div>
                               <div>
                                  <p className="text-sm font-black uppercase tracking-tight">System Core</p>
                                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">A-Star Protocol</p>
                               </div>
                            </div>
                         </div>
                         <Button variant="primary" className="w-full !rounded-2xl text-[10px] py-5 shadow-xl">Apply Global Context</Button>
                      </div>
                   </div>

                   <div className="p-10 bg-black/50 rounded-[2.5rem] border border-white/5 shadow-2xl">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                         <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                         <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      </div>
                      <p className="text-sm font-bold text-stone-200 leading-relaxed italic">"Integrated enterprise interface with theme-aware persistent state modules."</p>
                   </div>
                </div>
              </div>

              <div className="relative z-10 pt-16">
                 <p className="text-stone-600 text-[9px] font-black uppercase tracking-[0.5em]">Corporate Asset Management v3.x</p>
              </div>

              <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-accent-sage/10 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-stone-800 rounded-full blur-[120px]"></div>
           </Card>
        </div>
      </div>
    </div>
  );
};
