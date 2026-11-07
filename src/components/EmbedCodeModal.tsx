import React, { useState } from 'react';
import { Copy, Check, Code, Clock, Eye, Sparkles, ExternalLink, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import { VideoItem } from '../types';
import {
  generateSmartPlayerEmbed,
  generatePitchDelayScript,
  generateReadyToPasteSalesButton,
  generateIframeEmbed,
  formatTime,
} from '../utils/embedGenerator';

interface EmbedCodeModalProps {
  video: VideoItem;
  isOpen: boolean;
  onClose: () => void;
  onOpenSimulator: () => void;
}

export const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({
  video,
  isOpen,
  onClose,
  onOpenSimulator,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'player' | 'pitch' | 'button' | 'iframe'>('player');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [selectorInput, setSelectorInput] = useState('.esconder-pitch');
  const [activeGuideTab, setActiveGuideTab] = useState<'elementor' | 'atomicat' | 'greatpages' | 'html'>('elementor');

  if (!isOpen) return null;

  const playerCode = generateSmartPlayerEmbed(video);
  const pitchCode = generatePitchDelayScript(video, selectorInput);
  const buttonCode = generateReadyToPasteSalesButton(video);
  const iframeCode = generateIframeEmbed(video);

  const getActiveCode = () => {
    switch (activeCodeTab) {
      case 'player':
        return playerCode;
      case 'pitch':
        return pitchCode;
      case 'button':
        return buttonCode;
      case 'iframe':
        return iframeCode;
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Código de Incorporação Pronto para PV
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Vídeo: <strong className="text-slate-700 font-semibold">{video.title}</strong> · Pitch em <span className="font-mono text-rose-600 font-bold">{formatTime(video.settings.pitchDelaySeconds || 0)}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSimulator}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Testar no Simulador de PV
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Notice Banner */}
          <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs text-rose-950 space-y-1">
              <p className="font-bold text-sm text-rose-900">
                Tudo configurado com as otimizações do seu player!
              </p>
              <p className="text-rose-800 leading-relaxed">
                Este código já inclui o <strong>Smart Autoplay</strong> (com banner de desmutar), <strong>Barra de Progresso Otimizada</strong>, <strong>Bloqueio Anti-Download</strong> e integração com o <strong>Pitch Delay aos {formatTime(video.settings.pitchDelaySeconds || 0)}</strong>.
              </p>
            </div>
          </div>

          {/* Code Selection Tabs */}
          <div>
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveCodeTab('player')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                  activeCodeTab === 'player'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Code className="w-4 h-4" />
                1. Player Inteligente (HTML + Script)
              </button>

              <button
                onClick={() => setActiveCodeTab('pitch')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                  activeCodeTab === 'pitch'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                2. Script de Pitch Delay ({formatTime(video.settings.pitchDelaySeconds || 0)})
              </button>

              <button
                onClick={() => setActiveCodeTab('button')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                  activeCodeTab === 'button'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                3. Botão de Compra CTA Pronto
              </button>

              <button
                onClick={() => setActiveCodeTab('iframe')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                  activeCodeTab === 'iframe'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                4. iFrame Universal
              </button>
            </div>

            {/* Customizer for Pitch Tab */}
            {activeCodeTab === 'pitch' && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Classe CSS ou ID dos elementos a esconder na PV antes do pitch:
                </span>
                <input
                  type="text"
                  value={selectorInput}
                  onChange={(e) => setSelectorInput(e.target.value)}
                  placeholder=".esconder-pitch"
                  className="px-2.5 py-1 font-mono text-xs border border-slate-300 rounded bg-white text-slate-800 w-48 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            )}
          </div>

          {/* Code Viewer Box */}
          <div className="relative">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-slate-300 rounded-t-xl text-xs font-mono">
              <span>{activeCodeTab.toUpperCase()}_SNIPPET.html</span>
              <button
                onClick={() => copyToClipboard(getActiveCode(), activeCodeTab)}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                {copiedType === activeCodeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copiado com Sucesso!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar Código
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto rounded-b-xl border border-t-0 border-slate-800 max-h-64 leading-relaxed select-all">
              {getActiveCode()}
            </pre>
          </div>

          {/* Platform Step-by-Step Guide */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                Como colar na sua ferramenta de Página de Vendas:
              </h3>
              <div className="flex items-center gap-1 text-xs font-medium">
                <button
                  onClick={() => setActiveGuideTab('elementor')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeGuideTab === 'elementor' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Elementor / WP
                </button>
                <button
                  onClick={() => setActiveGuideTab('atomicat')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeGuideTab === 'atomicat' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Atomicat
                </button>
                <button
                  onClick={() => setActiveGuideTab('greatpages')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeGuideTab === 'greatpages' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  GreatPages
                </button>
                <button
                  onClick={() => setActiveGuideTab('html')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeGuideTab === 'html' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  HTML / Outros
                </button>
              </div>
            </div>

            {/* Platform Instructions */}
            <div className="text-xs text-slate-600 space-y-2">
              {activeGuideTab === 'elementor' && (
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>No editor do Elementor, arraste o widget <strong>HTML</strong> para a seção onde deseja o vídeo.</li>
                  <li>Cole o <strong>Código do Player Inteligente</strong> na caixa de texto do widget HTML.</li>
                  <li>Para o Pitch Delay: adicione a classe <code>esconder-pitch</code> nas seções ou botões de compra que deseja ocultar até os {formatTime(video.settings.pitchDelaySeconds || 0)}.</li>
                  <li>Adicione outro widget <strong>HTML</strong> no rodapé da página e cole o <strong>Script de Pitch Delay</strong>. Pronto!</li>
                </ol>
              )}

              {activeGuideTab === 'atomicat' && (
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>No construtor do Atomicat, adicione um componente do tipo <strong>Código / Embed</strong>.</li>
                  <li>Cole o <strong>Código do Player Inteligente</strong>. O Atomicat manterá a proporção de 16:9 perfeita.</li>
                  <li>Para ocultar a oferta até o pitch, use a opção nativa de Delay do Atomicat ou cole o <strong>Script de Pitch Delay</strong> no campo de Scripts da página.</li>
                </ol>
              )}

              {activeGuideTab === 'greatpages' && (
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>No GreatPages, insira um elemento de <strong>Código HTML</strong> no local do vídeo.</li>
                  <li>Cole o código gerado pelo VeloTurb.</li>
                  <li>Se desejar exibir o botão animado nativo, basta colar o <strong>Botão de Compra CTA Pronto</strong> logo abaixo do vídeo.</li>
                </ol>
              )}

              {activeGuideTab === 'html' && (
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>Abra o arquivo HTML da sua página de vendas no seu editor (VS Code, Webflow, etc.).</li>
                  <li>Cole o código do player exatamente no local onde a VSL deve aparecer.</li>
                  <li>Coloque a classe <code>class="esconder-pitch"</code> na <code>&lt;div&gt;</code> do seu botão de checkout.</li>
                  <li>Cole o <strong>Script de Pitch Delay</strong> antes de fechar a tag <code>&lt;/body&gt;</code>.</li>
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Código testado e 100% compatível com iOS Safari, Android Chrome e Desktop.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={() => copyToClipboard(getActiveCode(), activeCodeTab)}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              {copiedType === activeCodeTab ? (
                <>
                  <Check className="w-4 h-4" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copiar Código Atual
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
