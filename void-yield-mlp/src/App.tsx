import { useState } from "react";
import "./ui/styles.css";
import { useGame } from "./game/useGame";
import { StatusBar } from "./ui/StatusBar";
import { Rail } from "./ui/Rail";
import type { DestId } from "./ui/Rail";
import { OpsView } from "./ui/OpsView";
import { ProductionView } from "./ui/ProductionView";
import { MapView } from "./ui/MapView";
import { FleetView } from "./ui/FleetView";
import { TradeView } from "./ui/TradeView";
import { ColoniesView } from "./ui/ColoniesView";
import { MilestonesView } from "./ui/MilestonesView";
import { SurveyView } from "./ui/SurveyView";
import { AfkModal } from "./ui/AfkModal";
import { TierUpModal } from "./ui/TierUpModal";

export default function App() {
  const game = useGame();
  const [dest, setDest] = useState<DestId>("ops");
  // Tier-up modal lives alongside the persisted tierUpModalSeen flag so a
  // reload after dismissal doesn't reshow it.
  const showTierUp =
    game.state.tierUpClaimed[1] && !game.state.tierUpModalSeen[1];

  return (
    <div className="app">
      <StatusBar game={game} />
      <div className="app-body">
        <Rail current={dest} onChange={setDest} game={game} />
        {dest === "ops" && <OpsView game={game} goto={setDest} />}
        {dest === "production" && <ProductionView game={game} />}
        {dest === "map" && (
          <MapView
            game={game}
            gotoProduction={() => setDest("production")}
          />
        )}
        {dest === "fleet" && <FleetView game={game} />}
        {dest === "survey" && <SurveyView game={game} />}
        {dest === "trade" && <TradeView game={game} />}
        {dest === "colonies" && <ColoniesView game={game} />}
        {dest === "milestones" && <MilestonesView game={game} />}
      </div>

      {game.afkSummary && (
        <AfkModal
          summary={game.afkSummary}
          onDismiss={() => game.dismissAfk()}
        />
      )}

      {showTierUp && (
        <TierUpModal onClose={() => game.dismissTierUpModal()} />
      )}
    </div>
  );
}
