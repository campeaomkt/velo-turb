import React from 'react';
import { HelpCircle, MessageCircle, Mail, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export const HelpView: React.FC = () => {
  const faqs = [
    {
      q: 'Como colocar o código na minha página de vendas?',
      a: 'Basta ir em "Meus vídeos", clicar no botão vermelho "Obter Código da PV" ao lado do seu vídeo. Você terá o código do player e o código do pitch delay com 1 clique para copiar e instruções para Elementor, Atomicat, GreatPages e HTML.',
    },
    {
      q: 'O Smart Autoplay funciona em celulares iPhone (iOS)?',
      a: 'Sim! No iPhone, o vídeo começa a rodar imediatamente sem som e com a faixa animada chamando a atenção. Ao dar 1 clique no player, o som é liberado sem recarregar a página.',
    },
    {
      q: 'O que acontece se o visitante fechar a página e voltar depois?',
      a: 'Com a "Retomada Inteligente" ativada, o player lembra exatamente onde o visitante parou. Se ele já tinha assistido ao Pitch Delay, o botão de compra aparecerá imediatamente para ele poder comprar sem ter que rever o vídeo!',
    },
    {
      q: 'Concorrentes conseguem baixar minha VSL?',
      a: 'Nosso player possui proteção anti-download, desativação de botão direito, trava por domínio (Domain Lock) e marca d\'água dinâmica que inibe cópias.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-sky-600" />
          Central de Ajuda & Suporte VeloTurb
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Dúvidas frequentes sobre incorporação, pitch delay e configurações de alta conversão.
        </p>
      </div>

      {/* Support Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <MessageCircle className="w-4 h-4 text-emerald-600" /> Suporte via WhatsApp Especializado
          </div>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Precisa de ajuda urgente para colocar sua VSL no ar ou dúvidas com Elementor? Fale com nosso time de engenharia.
          </p>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 mt-1"
          >
            Abrir WhatsApp de Suporte <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-5 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
            <Mail className="w-4 h-4 text-sky-600" /> Atendimento por E-mail
          </div>
          <p className="text-xs text-sky-700 leading-relaxed">
            Envie o link da sua página de vendas para análise de performance e verificação de compatibilidade.
          </p>
          <span className="text-xs font-mono text-sky-900 font-semibold block mt-1">
            suporte@veloturb.com
          </span>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" /> Perguntas Mais Frequentes (FAQ)
        </h3>

        <div className="space-y-3 pt-2">
          {faqs.map((f, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                {f.q}
              </h4>
              <p className="text-xs text-slate-600 pl-5.5 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
