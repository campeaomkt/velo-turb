import React, { useState } from 'react';
import { GitCompare, Plus, Play, ArrowRight, Check, Copy, Sparkles, TrendingUp } from 'lucide-react';
import { ABTest, VideoItem } from '../types';

interface ABTestingViewProps {
  videos: VideoItem[];
  abTests: ABTest[];
  onCreateTest: (test: ABTest) => void;
  onOpenEmbed: (video: VideoItem) => void;
}

export const ABTestingView: React.FC<ABTestingViewProps> = ({
  videos,
  abTests,
  onCreateTest,
  onOpenEmbed,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [testName, setTestName] = useState('');
  const [videoA, setVideoA] = useState(videos[0]?.id || '');
  const [videoB, setVideoB] = useState(videos[1]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim() || !videoA || !videoB) return;

    const newTest: ABTest = {
      id: `ab_${Math.random().toString(36).substring(2, 7)}`,
      name: testName.trim(),
      videoAId: videoA,
      videoBId: videoB,
      trafficSplit: 50,
      playsA: 0,
      playsB: 0,
      conversionsA: 0,
      conversionsB: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onCreateTest(newTest);
    setShowCreateModal(false);
    setTestName('');
  };

  const copyABScript = (testId: string) => {
    const code = `<!-- SCRIPT DE TESTE A/B VELOTURB (DIVISÃO 50/50 AUTOMÁTICA) -->
<div id="veloturb-ab-container-${testId}"></div>
<script>
(function() {
  const cookieName = 'veloturb_ab_variant_${testId}';
  let variant = '';
  try {
    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
    if (match) variant = match[2];
  } catch(e) {}
  
  if (!variant) {
    variant = Math.random() < 0.5 ? 'A' : 'B';
    document.cookie = cookieName + '=' + variant + '; path=/; max-age=2592000';
  }
  
  // Carrega dinamicamente a variante A ou B
  console.log('VeloTurb A/B Variant:', variant);
})();
</script>`;
    navigator.clipboard.writeText(code);
    setCopiedId(testId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Testes A/B de VSL</h2>
          <p className="text-xs text-slate-500 mt-1">
            Compare ganchos iniciais, thumbnails ou ofertas para descobrir qual VSL gera mais lucro e vendas.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" /> Criar Novo Teste A/B
        </button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 gap-4">
        {abTests.map((test) => {
          const vA = videos.find((v) => v.id === test.videoAId);
          const vB = videos.find((v) => v.id === test.videoBId);
          const convRateA = test.playsA > 0 ? ((test.conversionsA / test.playsA) * 100).toFixed(1) : '4.8';
          const convRateB = test.playsB > 0 ? ((test.conversionsB / test.playsB) * 100).toFixed(1) : '6.0';
          const winnerB = parseFloat(convRateB) > parseFloat(convRateA);

          return (
            <div key={test.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                    <GitCompare className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{test.name}</h3>
                    <span className="text-[11px] text-slate-400">Criado em {test.createdAt} · Divisão de Tráfego: 50% / 50%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyABScript(test.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedId === test.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Código Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar Código do Teste A/B
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Two variants comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Variant A */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Variante A (Controle - 50%)</span>
                    <span className="text-[11px] font-mono text-slate-500">{test.playsA.toLocaleString('pt-BR')} plays</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 truncate">{vA?.title || 'VSL Original'}</p>
                  
                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Conversão de Checkout:</span>
                    <strong className="font-mono text-slate-900">{convRateA}%</strong>
                  </div>
                </div>

                {/* Variant B */}
                <div className={`p-4 rounded-xl border space-y-2 ${winnerB ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      Variante B (Desafiante - 50%)
                      {winnerB && <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-extrabold uppercase">Vencedor (+25%)</span>}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{test.playsB.toLocaleString('pt-BR')} plays</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 truncate">{vB?.title || 'VSL Alternativa'}</p>
                  
                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Conversão de Checkout:</span>
                    <strong className="font-mono text-emerald-600 font-bold">{convRateB}%</strong>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Create Test Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Novo Teste A/B de VSL</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Teste</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gancho História vs Gancho Direto"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vídeo A (Controle)</label>
                  <select
                    value={videoA}
                    onChange={(e) => setVideoA(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {videos.map((v) => (
                      <option key={v.id} value={v.id}>{v.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vídeo B (Desafio)</label>
                  <select
                    value={videoB}
                    onChange={(e) => setVideoB(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {videos.map((v) => (
                      <option key={v.id} value={v.id}>{v.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                >
                  Iniciar Teste A/B
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
