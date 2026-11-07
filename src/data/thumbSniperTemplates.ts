export interface ThumbSniperTemplate {
  id: string;
  name: string;
  theme: 'dark-red' | 'dark-yellow' | 'yellow-alert' | 'navy-red' | 'stop-red' | 'info-purple' | 'stop-cyan' | 'alert-red';
  badgeTitle?: string;
  headline: string;
  subheadline: string;
  buttonText: string;
  buttonColor: string;
  iconType: 'stop' | 'alert' | 'info' | 'warning';
}

export const THUMB_SNIPER_TEMPLATES: ThumbSniperTemplate[] = [
  {
    id: 'ts_01',
    name: 'Última Chance (Pare / Stop)',
    theme: 'stop-red',
    headline: 'Este vídeo ficará fora do ar em breve.',
    subheadline: 'Essa é sua última chance de assistir até o final.',
    buttonText: 'CONTINUAR ASSISTINDO',
    buttonColor: '#EF4444',
    iconType: 'stop',
  },
  {
    id: 'ts_02',
    name: 'Corra! Removido em Breve',
    theme: 'dark-yellow',
    badgeTitle: 'CORRA!',
    headline: 'ESSE VÍDEO SERÁ REMOVIDO EM BREVE.',
    subheadline: 'ASSISTA AGORA ANTES QUE SEJA TARDE DEMAIS!',
    buttonText: 'Continuar assistindo',
    buttonColor: '#FACC15',
    iconType: 'alert',
  },
  {
    id: 'ts_03',
    name: 'Alerta Amarelo de Atenção',
    theme: 'yellow-alert',
    badgeTitle: 'ALERTA!',
    headline: 'ESSE VÍDEO SERÁ REMOVIDO EM BREVE.',
    subheadline: 'ASSISTA AGORA ENQUANTO AINDA PODE!',
    buttonText: 'CONTINUAR ASSISTINDO',
    buttonColor: '#F59E0B',
    iconType: 'warning',
  },
  {
    id: 'ts_04',
    name: 'Navy Escuro Urgente',
    theme: 'navy-red',
    headline: 'ESSE VÍDEO FICARÁ NO AR POR POUCO TEMPO.',
    subheadline: 'ASSISTA AGORA ENQUANTO VOCÊ AINDA PODE!',
    buttonText: 'Continuar assistindo',
    buttonColor: '#E11D48',
    iconType: 'alert',
  },
  {
    id: 'ts_05',
    name: 'Stop Hand Latino (Seguir Mirando)',
    theme: 'stop-red',
    headline: 'Este vídeo desaparecerá pronto.',
    subheadline: 'Esta es tu última oportunidad de mirar hasta el final.',
    buttonText: 'SEGUIR MIRANDO',
    buttonColor: '#DC2626',
    iconType: 'stop',
  },
  {
    id: 'ts_06',
    name: 'Círculo de Alerta Amarelo',
    theme: 'info-purple',
    headline: 'Este vídeo desaparecerá pronto.',
    subheadline: 'Esta es tu última oportunidad de mirar hasta el final.',
    buttonText: 'SEGUIR MIRANDO',
    buttonColor: '#6366F1',
    iconType: 'info',
  },
  {
    id: 'ts_07',
    name: 'Stop Hand Cyan Moderno',
    theme: 'stop-cyan',
    headline: 'Este vídeo desaparecerá pronto.',
    subheadline: 'Esta es tu última oportunidad de mirar hasta el final.',
    buttonText: 'SEGUIR MIRANDO',
    buttonColor: '#06B6D4',
    iconType: 'stop',
  },
  {
    id: 'ts_08',
    name: 'Alerta Vermelho Emergência',
    theme: 'alert-red',
    headline: 'Este vídeo desaparecerá pronto.',
    subheadline: 'Esta es tu última oportunidad de mirar hasta el final.',
    buttonText: 'SEGUIR MIRANDO',
    buttonColor: '#E11D48',
    iconType: 'alert',
  },
];
