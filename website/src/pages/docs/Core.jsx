import DocsLayout from '../DocsLayout'

export default function Core(){
  const toc = [
    { href: '#dashboard', label: 'Dashboard' },
    { href: '#mirroring', label: 'Mirroring' },
    { href: '#actions', label: 'Actions & controls' },
    { href: '#performance', label: 'Performance tips' }
  ]
  return (
    <DocsLayout title="Core usage" toc={toc}>
      <section id="dashboard" className="doc-section"><h2 className="doc-h2">Dashboard</h2><p className="doc-p">Select devices, monitor status, and launch mirrors or automations. Per‑device logs help you diagnose issues quickly.</p><ol className="doc-list"><li>Filter or multi‑select devices.</li><li>Open mirror or run quick actions.</li><li>Inspect logs if something fails.</li></ol></section>
      <hr className="doc-hr" />
      <section id="mirroring" className="doc-section"><h2 className="doc-h2">Mirroring</h2><p className="doc-p">Open scrcpy with defaults tuned for stability. You can override FPS, bitrate, and resolution if needed.</p><div className="doc-table-wrapper"><table className="doc-table"><thead><tr><th>Setting</th><th>Default</th><th>When to change</th></tr></thead><tbody><tr><td>FPS</td><td>30</td><td>Lower on slow machines; raise to 60 on powerful PCs</td></tr><tr><td>Bitrate</td><td>8 Mbps</td><td>Lower for Wi‑Fi; higher for USB if you need clarity</td></tr><tr><td>Max size</td><td>1080p</td><td>Lower for CPU‑bound setups</td></tr></tbody></table></div><ol className="doc-list"><li>Open mirror from the device row.</li><li>Test default settings for a minute.</li><li>Tweak FPS/bitrate if needed.</li></ol></section>
      <hr className="doc-hr" />
      <section id="actions" className="doc-section"><h2 className="doc-h2">Actions & controls</h2><p className="doc-p">Use quick actions for common device operations without opening the mirror.</p><ul className="doc-list"><li>Connectivity: Wi‑Fi toggle, Airplane mode</li><li>System: Home, Back, Recents</li><li>Media: Volume up/down/mute</li><li>Display: Brightness up/down</li><li>Capture: Screenshot</li></ul></section>
      <section id="performance" className="doc-section"><h2 className="doc-h2">Performance tips</h2><ul className="doc-list"><li>Prefer USB for best latency and stability.</li><li>Close heavy background apps before long sessions.</li><li>Lower FPS/bitrate if you see stutters or black frames.</li><li>Use one mirror per GPU output when multitasking heavily.</li></ul></section>
    </DocsLayout>
  )
}


