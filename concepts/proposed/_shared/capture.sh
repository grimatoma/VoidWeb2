#!/usr/bin/env bash
# Capture all 20 mockup PNGs via headless Chrome.
# Most pages render at 1440x900 desktop; map-mobile at 390x844.

set -e

CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
ROOT="C:\\Users\\grima\\Documents\\aiDev\\voidYield2\\.claude\\worktrees\\peaceful-roentgen-4e6cda\\concepts\\proposed"
SRC_URL="file:///C:/Users/grima/Documents/aiDev/voidYield2/.claude/worktrees/peaceful-roentgen-4e6cda/concepts/proposed/src"

shoot() {
  local file="$1"
  local w="$2"
  local h="$3"
  local stem="${file%.html}"
  echo "→ $stem ($w x $h)"
  "$CHROME" \
    --headless \
    --disable-gpu \
    --hide-scrollbars \
    --window-size="${w},${h}" \
    --screenshot="${ROOT}\\${stem}.png" \
    "${SRC_URL}/${file}" 2>&1 | grep -v "^$" | tail -1
}

# 15 spec-faithful (mostly 1440x900, mobile is 390x844)
shoot 01-map-desktop.html      1440 900
shoot 02-body-sheet.html       1440 900
shoot 03-ops.html              1440 900
shoot 04-production.html       1440 900
shoot 05-fleet.html            1440 900
shoot 06-build-drawer.html     1440 900
shoot 07-buy-ship.html         1440 900
shoot 08-trade.html            1440 900
shoot 09-colonies.html         1440 900
shoot 10-afk-return.html       1440 900
shoot 11-tier-up.html          1440 900
shoot 12-survey.html           1440 900
shoot 13-map-mobile.html        390 844
shoot 14-milestones.html       1440 900
shoot 15-research.html         1440 900

# 5 creative
shoot 16-tier-up-cinematic.html        1440 900
shoot 17-sources-sinks-popover.html    1440 900
shoot 18-system-overview-late-game.html 1440 900
shoot 19-weekly-recap.html             1440 900
shoot 20-map-heat-mode.html            1440 900

echo
echo "Done. PNGs in $ROOT"
