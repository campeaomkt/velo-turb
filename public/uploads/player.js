/**
 * VeloTurb SmartPlayer - High Conversion VSL Player Runtime
 * Ultra-lightweight player core for embed codes
 */
(function() {
  if (window.__veloturb_loaded) return;
  window.__veloturb_loaded = true;

  // Custom Element definition if needed
  if (typeof customElements !== 'undefined' && !customElements.get('veloturb-smartplayer')) {
    class VeloTurbSmartPlayer extends HTMLElement {
      connectedCallback() {
        this.style.display = 'block';
      }
    }
    customElements.define('veloturb-smartplayer', VeloTurbSmartPlayer);
  }

  // Preload performance metric
  window._veloturb_ready = Date.now();
  console.log('[VeloTurb] Player Runtime initialized.');
})();
