(function bootstrap(global) {
  function init() {
    const game = new global.WizardDuel.GameManager(document);
    game.start();

    global.addEventListener("keydown", (event) => game.handleKeyDown(event));
    document.getElementById("restartButton").addEventListener("click", () => game.restart());
    document.getElementById("overlayRestartButton").addEventListener("click", () => game.restart());
    document.getElementById("game").addEventListener("pointerdown", () => global.focus());

    global.WizardDuel.currentGame = game;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
