import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Play, Sparkles, Clock, Shield, ArrowRight, Zap } from 'lucide-react';

export const AcademyView: React.FC = () => {
  const [activeArticle, setActiveArticle] = useState<number>(0);

  const articles = [
    {
      title: 'Passo a Passo: Como colar o código do VeloTurb na sua Página de Vendas (Elementor, Atomicat e GreatPages)',
      category: 'Implementação',
      readTime: '3 min',
      content: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <p>
            O VeloTurb foi desenhado para você apenas <strong>copiar e colar</strong>. Você não precisa mexer em servidores, CDN ou configurações complexas.
          </p>

          <h4 className="text-sm font-bold text-slate-900 mt-3">1. No Elementor (WordPress):</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Abra a sua página de vendas no Elementor.</li>
            <li>Arraste o widget <strong>HTML</strong> para a seção onde você quer a VSL.</li>
            <li>No VeloTurb, clique em <strong>"Obter Código da PV"</strong> no seu vídeo e copie o <strong>Código 1 (Player Inteligente)</strong>.</li>
            <li>Cole dentro do widget HTML.</li>
            <li>Agora vá no seu botão de checkout (ou na seção de compra), clique na aba <em>Avançado &gt; Classes CSS</em> e adicione <code>esconder-pitch</code>.</li>
            <li>Arraste outro widget HTML no rodapé e cole o <strong>Código 2 (Script de Pitch Delay)</strong>. Pronto!</li>
          </ul>

          <h4 className="text-sm font-bold text-slate-900 mt-3">2. No Atomicat e GreatPages:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Adicione um bloco de <strong>Código HTML / Embed</strong> no local do vídeo.</li>
            <li>Cole o código gerado pelo VeloTurb. A proporção 16:9 já é calculada de forma 100% responsiva sem cortes pretos.</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'A Ciência do Pitch Delay: Como sincronizar a revelação da oferta no segundo exato',
      category: 'Conversão',
      readTime: '4 min',
      content: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <p>
            O <strong>Pitch Delay</strong> é a ferramenta mais poderosa de uma VSL (Video Sales Letter). Se você colocar o botão de compra desde o início, o visitante rola até o final da página, vê o preço antes de entender o valor e sai sem comprar.
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
            <span className="font-bold text-rose-900">Como acertar o timing:</span>
            <p className="text-rose-800">
              Assista à sua VSL e anote o segundo exato em que o locutor fala o primeiro preço ou diz: <em>"E quanto vai custar tudo isso?..."</em>. Insira exatamente esse número no campo de Pitch Delay do VeloTurb.
            </p>
          </div>
          <p>
            O script do VeloTurb possui memória interna (localStorage): se o visitante já assistiu ao pitch e recarregar a página para comprar, o botão aparece imediatamente para não travar a conversão!
          </p>
        </div>
      ),
    },
    {
      title: 'Smart Autoplay no Celular: Como contornar o bloqueio de som do iPhone/Safari',
      category: 'Tecnologia',
      readTime: '2 min',
      content: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <p>
            Desde 2018, navegadores como Safari (iOS) e Google Chrome bloqueiam vídeos que tocam som automaticamente. Vídeos com som que tentam tocar sozinhos são pausados forçadamente pelo navegador.
          </p>
          <p>
            O VeloTurb resolve isso com o <strong>Smart Autoplay</strong>: o vídeo inicia mudo instantaneamente em segundo plano com uma faixa pulsante de alto contraste (<em>"Seu vídeo já começou! Clique para ouvir áudio 🔊"</em>).
          </p>
          <p>
            Ao dar um único toque na tela, o áudio é ativado e a reprodução continua fluida, gerando até <strong>3.2x mais plays</strong> do que players estáticos convencionais.
          </p>
        </div>
      ),
    },
    {
      title: 'Fake Progress Bar: O hack visual que retém 37% mais visitantes nos primeiros 2 minutos',
      category: 'Retenção',
      readTime: '3 min',
      content: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <p>
            Quando o visitante percebe que uma VSL tem 30 ou 40 minutos de duração, a ansiedade faz com que ele feche a aba.
          </p>
          <p>
            A <strong>Fake Progress Bar</strong> do VeloTurb utiliza uma curva não-linear: nos primeiros 2 minutos, a barra avança mais rápido, dando a sensação psicológica ao lead de que a apresentação é curta e objetiva. Isso ancora a atenção dele até os pontos cruciais da história e da prova social.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-rose-600" />
          VeloTurb Academy · Segredos da Alta Conversão para VSL
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Aprenda as melhores práticas de escala, timing de pitch e implementação nas suas páginas de vendas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Articles List */}
        <div className="md:col-span-5 space-y-2">
          {articles.map((art, idx) => (
            <div
              key={idx}
              onClick={() => setActiveArticle(idx)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeArticle === idx
                  ? 'bg-rose-50/70 border-rose-300 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold text-rose-600">{art.category}</span>
                <span className="text-slate-400">{art.readTime}</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 line-clamp-2">{art.title}</h3>
            </div>
          ))}
        </div>

        {/* Article Reader */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              {articles[activeArticle].category}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {articles[activeArticle].title}
            </h3>
          </div>

          <div>{articles[activeArticle].content}</div>
        </div>
      </div>
    </div>
  );
};
