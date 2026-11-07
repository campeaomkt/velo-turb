import React, { useState } from 'react';
import { HardDrive, Server, Cloud, Zap, ArrowRight, Check, Copy, ExternalLink, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const HostingView: React.FC<{ onOpenUpload: () => void }> = ({ onOpenUpload }) => {
  const [selectedStorage, setSelectedStorage] = useState<'local' | 'bunny' | 'cloudflare' | 's3'>('local');
  const [bunnyApiKey, setBunnyApiKey] = useState('');
  const [bunnyStorageZone, setBunnyStorageZone] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveBunny = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Title & Overview */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-rose-600" />
          Onde Hospedar Seus Vídeos de VSL (Sem YouTube)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Entenda como funciona a infraestrutura de streaming de alta velocidade para páginas de vendas e escolha sua opção.
        </p>
      </div>

      {/* WHY NOT YOUTUBE COMPARISON BANNER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          Por que NUNCA usar YouTube em Páginas de Vendas (VSLs)?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
            <span className="font-extrabold text-rose-900 flex items-center gap-1.5 text-xs">
              ❌ Usar YouTube (Destrói suas Vendas)
            </span>
            <ul className="space-y-1.5 text-rose-950 pl-4 list-disc">
              <li><strong>Vídeos Recomendados:</strong> Ao pausar ou no final, exibe vídeos de concorrentes tirando o lead da sua PV.</li>
              <li><strong>Barra de Tempo Visível:</strong> O lead vê que o vídeo tem 35 minutos, pula para o final ou desiste antes do pitch.</li>
              <li><strong>Sem Smart Autoplay:</strong> O som não toca sozinho no Safari/iOS e não permite faixas customizadas de áudio.</li>
              <li><strong>Sem Pitch Delay sincronizado:</strong> Não conversa nativamente com o botão de compra da sua página.</li>
              <li><strong>Risco de Remoção:</strong> Políticas rígidas do Google podem derrubar sua VSL a qualquer momento.</li>
            </ul>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <span className="font-extrabold text-emerald-900 flex items-center gap-1.5 text-xs">
              ✅ Usar VeloTurb (Hospedagem Dedicada para VSL)
            </span>
            <ul className="space-y-1.5 text-emerald-950 pl-4 list-disc">
              <li><strong>100% Blindado:</strong> Zero logos, zero vídeos sugeridos, zero links externos.</li>
              <li><strong>Fake Progress Bar:</strong> Sensação de que o vídeo é curto, aumentando retenção em até 37%.</li>
              <li><strong>Smart Autoplay com Som:</strong> Banner de clique para ouvir que contorna o bloqueio do iPhone/Android.</li>
              <li><strong>Pitch Delay Preciso:</strong> O botão de compra surge automaticamente no segundo exato da oferta.</li>
              <li><strong>Proteção Anti-Download:</strong> Bloqueia botão direito, download direto e cópias por concorrentes.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* STORAGE PROVIDERS OPTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Option 1: VeloTurb Nativo */}
        <div
          onClick={() => setSelectedStorage('local')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            selectedStorage === 'local'
              ? 'bg-rose-50/50 border-rose-500 shadow-sm ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
              Imediato
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-900">Upload Direto VeloTurb</h4>
          <p className="text-xs text-slate-500 mt-1">
            Arraste seu arquivo MP4 do seu computador e nós hospedamos diretamente no servidor da sua aplicação.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-600 font-bold">
            <span>Configuração Zero</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Option 2: Bunny.net (Como o VTurb faz) */}
        <div
          onClick={() => setSelectedStorage('bunny')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            selectedStorage === 'bunny'
              ? 'bg-amber-50/50 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
              Padrão VTurb
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-900">Bunny.net (Bunny Stream)</h4>
          <p className="text-xs text-slate-500 mt-1">
            A CDN ultra-barata que o VTurb e PandaVideo usam. Custa cerca de R$ 0,02 por GB com servidores em SP.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-bold">
            <span>Para Escala Milionária</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Option 3: Cloudflare / S3 */}
        <div
          onClick={() => setSelectedStorage('cloudflare')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            selectedStorage === 'cloudflare'
              ? 'bg-sky-50/50 border-sky-500 shadow-sm ring-2 ring-sky-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-sky-100 text-sky-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
              Cloudflare / S3
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-900">Cloudflare R2 / AWS S3</h4>
          <p className="text-xs text-slate-500 mt-1">
            Armazene seus arquivos MP4 no Cloudflare R2 com taxa de transferência ZERO ou no Amazon AWS S3.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-sky-700 font-bold">
            <span>Links Diretos MP4</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* SELECTED OPTION DETAILS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        
        {selectedStorage === 'local' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-rose-600" />
                  Hospedagem Nativa VeloTurb Ativa
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seu servidor Express possui o endpoint <code>/api/upload</code> configurado com suporte a requisições de streaming HTTP 206 Range.
                </p>
              </div>

              <button
                onClick={onOpenUpload}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Fazer Upload de Vídeo Agora
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <strong className="text-slate-900">Como funciona:</strong>
              <p>
                1. Você clica no botão <strong>Upload</strong> no menu superior.<br />
                2. Seleciona o arquivo do seu vídeo (MP4, WebM ou MOV) salvo no seu computador.<br />
                3. O arquivo é enviado diretamente para a pasta de streaming da aplicação.<br />
                4. O VeloTurb gera o código HTML/JS completo para você colar na sua página de vendas!
              </p>
            </div>
          </div>
        )}

        {selectedStorage === 'bunny' && (
          <form onSubmit={handleSaveBunny} className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                Como o VTurb usa o Bunny.net para Hospedar VSLs
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                O Bunny.net é a plataforma de entrega de vídeo mais barata e rápida do mundo. Milhares de infoprodutores usam para pagar menos de R$ 10 por mês com milhões de visualizações.
              </p>
            </div>

            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-2">
              <strong className="text-amber-900">Passo a passo rápido:</strong>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Crie uma conta gratuita em <strong>bunny.net</strong>.</li>
                <li>No menu lateral do Bunny, clique em <strong>Stream &gt; Add Video Library</strong>.</li>
                <li>Faça upload do seu arquivo MP4 da sua VSL lá.</li>
                <li>O Bunny gera um link direto (Direct Play URL / MP4 URL).</li>
                <li>Copie esse link e cole no VeloTurb ao adicionar um novo vídeo. O VeloTurb cuidará de todo o resto (Smart Autoplay, Pitch Delay e proteção anti-download)!</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  API Key do Bunny Stream (Opcional)
                </label>
                <input
                  type="password"
                  value={bunnyApiKey}
                  onChange={(e) => setBunnyApiKey(e.target.value)}
                  placeholder="Ex: 89a8120b-4891-..."
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Library ID do Bunny (Opcional)
                </label>
                <input
                  type="text"
                  value={bunnyStorageZone}
                  onChange={(e) => setBunnyStorageZone(e.target.value)}
                  placeholder="Ex: 194821"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                {isSaved ? '✓ Configurações Salvas!' : 'Salvar Conexão Bunny'}
              </button>
            </div>
          </form>
        )}

        {selectedStorage === 'cloudflare' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-600" />
                Hospedagem em Cloudflare R2 ou AWS S3
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Você pode armazenar seus vídeos em qualquer bucket na nuvem (Cloudflare R2, Amazon S3, Backblaze B2, Google Cloud Storage, Supabase Storage).
              </p>
            </div>

            <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl text-xs text-sky-950 space-y-2">
              <strong className="text-sky-900">Como funciona:</strong>
              <p>
                Basta ter a URL pública do seu arquivo MP4 (ex: <code>https://pub-xxxx.r2.dev/minha-vsl.mp4</code> ou <code>https://meubucket.s3.amazonaws.com/vsl.mp4</code>).
              </p>
              <p>
                Quando você cadastra essa URL no VeloTurb, o player aplica toda a inteligência (esconder botões, barra de progresso falsa, Smart Autoplay e Pitch Delay) sem que ninguém saiba onde o arquivo está guardado e impedindo downloads piratas!
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
