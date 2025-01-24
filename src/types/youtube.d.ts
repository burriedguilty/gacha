declare namespace YT {
  interface Player {
    setVolume(volume: number): void;
    mute(): void;
    unMute(): void;
  }

  interface PlayerEvent {
    target: Player;
  }
}
