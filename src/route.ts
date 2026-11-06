export type EnemyKind = "drone" | "dart" | "turret" | "lancer";
export type Formation = "line" | "vee" | "column" | "pincer";

export type Wave = {
  at: number;
  kind: EnemyKind;
  count: number;
  formation: Formation;
  x?: number;
  center?: number;
};

export type Sector = {
  name: string;
  subtitle: string;
  length: number;
  waves: Wave[];
};

export type Spawn = {
  kind: EnemyKind;
  x: number;
  y: number;
  direction: number;
  hp: number;
  speed: number;
  score: number;
  dropChance: number;
  special: boolean;
};

const line = (
  at: number,
  kind: EnemyKind,
  count: number,
  center = 240,
): Wave => ({ at, kind, count, formation: "line", center });

const vee = (
  at: number,
  kind: EnemyKind,
  count: number,
  center = 240,
): Wave => ({ at, kind, count, formation: "vee", center });

const column = (
  at: number,
  kind: EnemyKind,
  count: number,
  x: number,
): Wave => ({ at, kind, count, formation: "column", x });

const pincer = (
  at: number,
  count: number,
): Wave => ({ at, kind: "lancer", count, formation: "pincer" });

export const SECTORS: Sector[] = [
  {
    name: "Outer Drift",
    subtitle: "Scouts ahead",
    length: 1560,
    waves: [
      line(60, "drone", 4),
      vee(360, "drone", 5, 168),
      vee(660, "drone", 5, 312),
      line(960, "drone", 6),
      column(1200, "drone", 4, 120),
      column(1260, "drone", 4, 360),
    ],
  },
  {
    name: "Shatter Belt",
    subtitle: "Divers incoming",
    length: 1800,
    waves: [
      vee(60, "drone", 6),
      line(300, "dart", 4),
      column(600, "dart", 5, 144),
      column(720, "dart", 5, 336),
      line(1020, "drone", 7),
      vee(1140, "dart", 5),
      line(1440, "dart", 6),
    ],
  },
  {
    name: "Gun Lanes",
    subtitle: "Turrets online",
    length: 1920,
    waves: [
      line(60, "turret", 1),
      vee(240, "drone", 6),
      line(540, "turret", 2),
      column(840, "dart", 6, 240),
      line(1080, "turret", 2),
      line(1140, "drone", 6),
      line(1500, "turret", 3),
    ],
  },
  {
    name: "Lancer Gate",
    subtitle: "Crossfire",
    length: 1920,
    waves: [
      pincer(60, 4),
      vee(360, "dart", 6),
      pincer(600, 6),
      line(780, "turret", 2),
      pincer(1140, 6),
      vee(1260, "drone", 8),
      line(1560, "dart", 8),
    ],
  },
  {
    name: "Last Approach",
    subtitle: "Everything they have",
    length: 2040,
    waves: [
      line(60, "turret", 3),
      pincer(180, 6),
      column(540, "dart", 6, 120),
      column(540, "dart", 6, 360),
      vee(900, "drone", 9),
      line(1020, "turret", 2),
      pincer(1320, 8),
      vee(1560, "dart", 8),
    ],
  },
  {
    name: "The Warden",
    subtitle: "The Warden approaches",
    length: 0,
    waves: [],
  },
];

export function spawnsAt(waves: readonly Wave[], t: number): Spawn[] {
  const spawns: Spawn[] = [];

  for (const wave of waves) {
    const middle = (wave.count - 1) / 2;

    for (let i = 0; i < wave.count; i++) {
      let spawnAt = wave.at;
      let x = wave.x ?? 240;
      let y = -30;

      if (wave.formation === "line") {
        x = (wave.center ?? 240) + (i - middle) * 64;
      } else if (wave.formation === "vee") {
        spawnAt += Math.abs(i - middle) * 10;
        x = (wave.center ?? 240) + (i - middle) * 44;
      } else if (wave.formation === "column") {
        spawnAt += i * 24;
      } else if (wave.formation === "pincer") {
        spawnAt += Math.floor(i / 2) * 30;
        x = i % 2 === 0 ? -30 : 510;
        y = 70 + Math.floor(i / 2) * 50;
      }

      if (t !== spawnAt) continue;

      const stats = {
        drone: {
          hp: 2,
          speed: 100,
          score: 13,
          dropChance: 0.015,
          special: true,
        },
        dart: {
          hp: 1,
          speed: 150,
          score: 12,
          dropChance: 0.015,
          special: false,
        },
        turret: {
          hp: 12,
          speed: 400,
          score: 19,
          dropChance: 0.3,
          special: true,
        },
        lancer: {
          hp: 4,
          speed: 250,
          score: 15,
          dropChance: 0.06,
          special: true,
        },
      }[wave.kind];

      spawns.push({
        kind: wave.kind,
        x,
        y,
        direction: i % 2 === 0 ? 1 : -1,
        ...stats,
      });
    }
  }

  return spawns;
}
