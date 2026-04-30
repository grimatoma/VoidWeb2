export function TierUpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="hero" style={{ color: "var(--accent-cyan)" }}>T1 Lunar Foothold</div>
        <div className="hero-sub">authorized · operations cleared</div>
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
          <p style={{ margin: "10px 0" }}>
            Habitat construction cleared. Life support imports available. Pop tier mechanics live.
          </p>
          <h3>Newly unlocked</h3>
          <div className="mono" style={{ fontSize: 12, lineHeight: 1.7 }}>
            <div>· Lunar Surface Mine — extract Lunar Regolith on the Moon</div>
            <div>· Refinery (Aluminum), Construction Yard, Habitat Assembler, Greenhouse</div>
            <div>· Earth Prefab Kits: Lunar Habitat Module, Lunar Surface Mine</div>
            <div>· Aluminum, Construction Materials, Food Pack, Habitat Module, Lunar Regolith resources</div>
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <button className="btn primary" onClick={onClose}>Begin</button>
        </div>
      </div>
    </div>
  );
}
