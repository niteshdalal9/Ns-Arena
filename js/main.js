window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const game = new NSArena.Game(canvas);
    game.start();

    // Unlock audio on first interaction
    const unlock = () => { game.audio.unlock(); document.removeEventListener('click', unlock); document.removeEventListener('touchstart', unlock); };
    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);
});