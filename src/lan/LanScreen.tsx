// Playing with friends over Wi‑Fi: set up a table (you host it: the code, the
// QR code, seats for friends and bots) or join one (found on the network, by
// code or by QR), then the same table screen as against the computer. The
// trainer is off at a Wi‑Fi table.
import * as Network from "expo-network";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PERSONAS, personaById, type PersonaId } from "../ai/personas";
import type { Rules } from "../engine/rules";
import type { Pace } from "../game/pace";
import type { GameSnapshot, TableGame } from "../game/TableGame";
import { summaryLine } from "../newgame/rulesText";
import type { LookChoice } from "../premium/looks";
import { LookOverride } from "../premium/LooksProvider";
import type { KV } from "../storage/kv";
import { addLanRound, loadLanStats, saveLanStats, type LanStats } from "../storage/lan";
import { TableScreen } from "../table/TableScreen";
import { Button3D } from "../ui/Button3D";
import { Label, Segmented } from "../ui/controls";
import { useConfirm } from "../ui/Dialog";
import { DISPLAY } from "../ui/fonts";
import { Header } from "../ui/Header";
import { P } from "../ui/palette";
import { plural } from "../ui/plural";
import { Portrait } from "../ui/Portrait";
import { joinLink, parseJoinLink, parseTableCode, tableCode } from "./code";
import { advertise, useTables, type FoundTable } from "./discovery";
import { LanGuest } from "./guest";
import { LanHost } from "./host";
import { cleanName, FREE_LAN_SEATS, MAX_LAN_SEATS, REACTION_TEXTS, type LanInfo, type LobbySlot, type TableInfo } from "./protocol";
import { QrView } from "./QrView";
import { tcpDial, tcpServer } from "./tcp";
import type { Dialer, Server } from "./transport";

type Step = { name: "menu" } | { name: "host"; host: LanHost } | { name: "join" } | { name: "guest"; guest: LanGuest };

export interface LanDeps {
  server?: () => Server;
  dial?: Dialer;
  getIp?: () => Promise<string | null>;
  /** Mock bots' decisions / pauses (tests). */
  hostDeps?: ConstructorParameters<typeof LanHost>[0]["deps"];
}

const defaultIp = () => Network.getIpAddressAsync().catch(() => null);

export function LanScreen({
  kv,
  rules,
  pace,
  pro,
  looks,
  onExit,
  deps = {},
}: {
  kv: KV;
  rules: Rules;
  pace: Pace;
  pro: boolean;
  /** An Oczko Pro host's looks, shown to the whole table. */
  looks?: LookChoice;
  onExit: () => void;
  deps?: LanDeps;
}) {
  const [step, setStep] = useState<Step>({ name: "menu" });
  const [stats, setStats] = useState<LanStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();

  useEffect(() => {
    let alive = true;
    loadLanStats(kv).then((s) => alive && setStats(s));
    return () => {
      alive = false;
    };
  }, [kv]);

  const name = cleanName(stats?.name, "");
  const setName = (n: string) => setStats((s) => (s ? { ...s, name: n.slice(0, 16) } : s));
  const saveName = () => stats && void saveLanStats(kv, stats);
  const recordRound = (snap: GameSnapshot) => {
    const won = (snap.result?.points[snap.me] ?? 0) > 0;
    const over = snap.phase === "matchEnd";
    setStats((s) => {
      if (!s) return s;
      const next = addLanRound(s, won, over, snap.winner === snap.me);
      void saveLanStats(kv, next);
      return next;
    });
  };

  const leave = async () => {
    if (step.name === "host") {
      if (step.host.state.phase === "playing" && !(await confirm({ title: "Zamknąć stół?", message: "Gra skończy się dla wszystkich przy stole.", confirmText: "Zamknij", destructive: true })))
        return;
      step.host.close();
    }
    if (step.name === "guest") step.guest.leave();
    setStep({ name: "menu" });
  };

  // Leaving the screen closes the table / leaves it (no link stays open).
  const current = useRef<Step>(step);
  useEffect(() => {
    current.current = step;
  }, [step]);
  // One table being opened / joined at a time; the screen may be gone after it.
  const busy = useRef(false);
  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
      const st = current.current;
      if (st.name === "host") st.host.close();
      if (st.name === "guest") st.guest.leave();
    },
    []
  );

  // Android back: step by step.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (step.name === "menu") onExit();
      else void leave();
      return true;
    });
    return () => sub.remove();
  });

  const startHost = async () => {
    if (busy.current) return;
    busy.current = true;
    saveName();
    setError(null);
    const table: TableInfo = { name: `Stół: ${name || "Gospodarz"}`, rules, mode: "match", ...(pro && looks ? { looks } : {}) };
    const host = new LanHost({
      name: name || "Gospodarz",
      table,
      server: (deps.server ?? tcpServer)(),
      deps: deps.hostDeps ?? { pace, onRoundEnd: () => queueMicrotask(() => host.controller && recordRound(host.controller.getSnapshot())) },
      maxSeats: pro ? MAX_LAN_SEATS : FREE_LAN_SEATS,
    });
    try {
      await host.open();
      if (!alive.current || current.current.name !== "menu") host.close();
      else setStep({ name: "host", host });
    } catch {
      try {
        host.close();
      } catch {
        // never listened
      }
      if (alive.current) setError("Nie udało się otworzyć stołu. Sprawdź połączenie z Wi‑Fi.");
    } finally {
      busy.current = false;
    }
  };

  const join = async (target: { host: string; port: number }) => {
    if (busy.current) return; // a double tap, the scanner's next frames
    busy.current = true;
    saveName();
    setError(null);
    const guest = new LanGuest({ dial: deps.dial ?? tcpDial, host: target.host, port: target.port, name: name || "Gość", onRoundEnd: recordRound });
    try {
      await guest.connect();
      if (!alive.current || current.current.name !== "join") guest.leave();
      else setStep({ name: "guest", guest });
    } catch {
      guest.leave();
      if (alive.current) setError("Nie udało się połączyć ze stołem.");
    } finally {
      busy.current = false;
    }
  };

  if (!stats) return <View style={s.screen} />;

  if (step.name === "host") return <HostFlow host={step.host} kv={kv} onLeave={() => void leave()} getIp={deps.getIp ?? defaultIp} />;
  if (step.name === "guest") return <GuestFlow guest={step.guest} kv={kv} onLeave={() => void leave()} />;
  if (step.name === "join") return <JoinScreen onBack={() => setStep({ name: "menu" })} onJoin={(t) => void join(t)} getIp={deps.getIp ?? defaultIp} error={error} />;

  return (
    <View style={s.screen}>
      <Header title="Ze znajomymi" subtitle="Każdy na swoim telefonie, w tej samej sieci Wi‑Fi" onBack={onExit} />
      <ScrollView contentContainerStyle={s.content}>
        <Label>Twoje imię przy stole</Label>
        <TextInput
          value={stats.name}
          onChangeText={setName}
          onBlur={saveName}
          placeholder="np. Ola"
          placeholderTextColor={P.muted}
          style={s.input}
          maxLength={16}
          accessibilityLabel="Twoje imię przy stole"
        />
        <View style={{ height: 14 }} />
        <Button3D label="Załóż stół" big onPress={() => void startHost()} testID="lan-host" />
        <Button3D label="Dołącz do stołu" tone="dark" height={52} onPress={() => setStep({ name: "join" })} style={{ marginTop: 10 }} testID="lan-join" />
        {error && <Text style={s.error}>{error}</Text>}
        <Text style={s.note}>
          {`Bez internetu: telefony łączą się w lokalnej sieci. ${pro ? "Do 8 osób przy stole (Oczko Pro)." : `Do ${FREE_LAN_SEATS} osób przy stole (8 z Oczko Pro gospodarza).`}`}
        </Text>
        {stats.matches + stats.rounds > 0 && (
          <Text style={s.note}>{`Przez Wi‑Fi: ${stats.matchesWon} z ${stats.matches} ${plural(stats.matches, "partii", "partii", "partii")} wygranych · ${stats.roundsWon}/${stats.rounds} rund z punktem`}</Text>
        )}
      </ScrollView>
    </View>
  );
}

// ---- host ---------------------------------------------------------------------

function HostFlow({ host, kv, onLeave, getIp }: { host: LanHost; kv: KV; onLeave: () => void; getIp: () => Promise<string | null> }) {
  const view = useSyncExternalStore(
    (fn) => host.subscribe(fn),
    () => host.state
  );
  const [ip, setIp] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void getIp().then((x) => alive && setIp(x));
    return () => {
      alive = false;
    };
  }, [getIp]);
  // Advertise on the network while the table is open.
  const open = view.slots.filter((x) => x.kind === "open").length;
  useEffect(() => {
    if (view.port < 0) return;
    const ad = advertise(host.table.name, view.port, { open, seats: view.slots.length, playing: view.phase === "playing", mode: host.table.rules.mode, target: host.table.rules.target });
    return () => ad.stop();
  }, [host, view.port, open, view.slots.length, view.phase]);

  if (view.phase === "playing" && host.controller)
    return (
      <LanTable
        game={host.controller}
        kv={kv}
        lan={() => host.lan}
        subscribeLan={(fn) => host.subscribe(fn)}
        onExit={onLeave}
        onReact={(t) => host.react(t)}
        away={view.away}
        onBotNow={(seat) => host.botNow(seat)}
        onWaitLonger={(seat) => host.waitLonger(seat)}
      />
    );

  const code = ip && view.port > 0 ? tableCode(ip, view.port) : null;
  const t = host.table;
  return (
    <View style={s.screen}>
      <Header title={t.name} subtitle="Twój stół — znajomi dołączają" onBack={onLeave} />
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.codeCard}>
          {code ? (
            <>
              <Text style={s.small}>Kod stołu</Text>
              <Text style={s.code} accessibilityLabel={`Kod stołu: ${code.split("").join(" ")}`}>
                {code}
              </Text>
              {ip && <QrView text={joinLink(ip, view.port)} size={150} label="Kod QR stołu — zeskanuj w aplikacji Oczko" />}
            </>
          ) : (
            <Text style={s.small}>Połącz telefon z Wi‑Fi, żeby pokazać kod stołu.</Text>
          )}
        </View>
        <Label>{`Przy stole · ${view.slots.length} z ${view.maxSeats}`}</Label>
        <View style={s.panel}>
          {view.slots.map((slot, i) => (
            <SlotRow key={i} slot={slot} index={i} host={host} />
          ))}
        </View>
        {view.slots.length < view.maxSeats && (
          <Button3D label="Dodaj miejsce" tone="dark" height={44} onPress={() => host.addSeat()} style={{ marginTop: 10 }} />
        )}
        <Label>Tryb</Label>
        <Segmented
          label="Tryb gry"
          value={t.rules.mode}
          onChange={(mode) => host.setTable({ ...t, rules: { ...t.rules, mode } })}
          options={[
            { value: "family", label: "Rodzinne" },
            { value: "bank", label: "Z bankierem" },
          ]}
        />
        <Label>Do ilu punktów</Label>
        <Segmented
          label="Długość partii"
          value={t.mode === "single" ? 1 : t.rules.target}
          onChange={(v) => host.setTable({ ...t, mode: v === 1 ? "single" : "match", rules: { ...t.rules, target: v === 1 ? 1 : v } })}
          options={[
            { value: 5, label: "5" },
            { value: 10, label: "10" },
            { value: 15, label: "15" },
            { value: 1, label: "1 runda" },
          ]}
        />
        <Text style={s.note}>{summaryLine(t.rules)}</Text>
      </ScrollView>
      <View style={s.footer}>
        <Button3D label="Rozdaj karty" big disabled={!host.canStart} onPress={() => host.start()} testID="lan-start" />
      </View>
    </View>
  );
}

function SlotRow({ slot, index, host }: { slot: LobbySlot; index: number; host: LanHost }) {
  const nextBot = (cur?: PersonaId): PersonaId => {
    const i = cur ? PERSONAS.findIndex((p) => p.id === cur) : -1;
    return PERSONAS[(i + 1) % PERSONAS.length].id;
  };
  switch (slot.kind) {
    case "host":
      return (
        <View style={s.slot}>
          <Portrait name={slot.name} size={32} color={P.accent} />
          <Text style={s.slotName}>{`${slot.name} (Ty)`}</Text>
        </View>
      );
    case "guest":
      return (
        <View style={s.slot}>
          <Portrait name={slot.name} size={32} color="#8FD3FF" />
          <Text style={s.slotName}>{slot.name}</Text>
          <Text style={[s.small, { color: slot.online ? P.ok : P.muted }]}>{slot.online ? "połączony" : "rozłączony"}</Text>
          <SmallBtn label="Usuń" onPress={() => host.remove(index)} a11y={`Usuń: ${slot.name}`} />
        </View>
      );
    case "bot": {
      const p = personaById(slot.persona)!;
      return (
        <View style={s.slot}>
          <Portrait name={slot.name} size={32} color={p.color} />
          <Pressable style={{ flex: 1 }} onPress={() => host.setBot(index, nextBot(slot.persona))} accessibilityRole="button" accessibilityLabel={`Bot: ${slot.name}, ${p.label}. Zmień postać`}>
            <Text style={s.slotName}>{slot.name}</Text>
            <Text style={s.small}>{`${p.label} · stuknij, by zmienić`}</Text>
          </Pressable>
          <SmallBtn label="Wolne" onPress={() => host.setOpen(index)} a11y={`Zwolnij miejsce: ${slot.name}`} />
        </View>
      );
    }
    case "open":
      return (
        <View style={s.slot}>
          <View style={s.emptySeat} />
          <Text style={[s.slotName, { color: P.muted }]}>Czeka na gościa…</Text>
          <SmallBtn label="Bot" onPress={() => host.setBot(index, "ola")} a11y="Posadź bota" />
          <SmallBtn label="×" onPress={() => host.removeSeat(index)} a11y="Usuń miejsce" />
        </View>
      );
  }
}

function SmallBtn({ label, onPress, a11y }: { label: string; onPress: () => void; a11y: string }) {
  return (
    <Pressable style={s.smallBtn} onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y}>
      <Text style={s.smallBtnText}>{label}</Text>
    </Pressable>
  );
}

// ---- joining --------------------------------------------------------------------

function JoinScreen({ onBack, onJoin, getIp, error }: { onBack: () => void; onJoin: (t: { host: string; port: number }) => void; getIp: () => Promise<string | null>; error: string | null }) {
  const { tables } = useTables(true);
  const [code, setCode] = useState("");
  const [bad, setBad] = useState(false);
  const [scan, setScan] = useState(false);
  const [perm, requestPerm] = useCameraPermissions();
  const byCode = async () => {
    const t = parseTableCode(code, await getIp());
    if (t) onJoin(t);
    else setBad(true);
  };
  if (scan)
    return (
      <View style={s.screen}>
        <Header title="Skanuj kod QR" onBack={() => setScan(false)} />
        {perm?.granted ? (
          <CameraView
            style={{ flex: 1 }}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={({ data }) => {
              const t = parseJoinLink(data);
              if (t) {
                setScan(false);
                onJoin(t);
              }
            }}
          />
        ) : (
          <View style={s.content}>
            <Text style={s.note}>Aparat jest potrzebny tylko do zeskanowania kodu stołu.</Text>
            <Button3D label="Zezwól na aparat" tone="dark" height={48} onPress={() => void requestPerm()} />
          </View>
        )}
      </View>
    );
  return (
    <View style={s.screen}>
      <Header title="Dołącz do stołu" onBack={onBack} />
      <ScrollView contentContainerStyle={s.content}>
        <Label>Stoły w tej sieci</Label>
        {tables.length === 0 ? (
          <Text style={s.note}>Szukam… Jeśli stołu nie widać, wpisz kod albo zeskanuj QR z telefonu gospodarza.</Text>
        ) : (
          tables.map((t: FoundTable) => (
            <Pressable
              key={t.key}
              style={[s.panel, s.found]}
              disabled={!t.ad}
              onPress={() => onJoin(t)}
              accessibilityRole="button"
              accessibilityLabel={`${t.name}${t.ad ? `, wolne miejsca: ${t.ad.open}` : ", inna wersja aplikacji"}`}
            >
              <Text style={s.slotName}>{t.name}</Text>
              <Text style={s.small}>{t.ad ? `${t.ad.mode === "bank" ? "Z bankierem" : "Rodzinne"} · wolne: ${t.ad.open}${t.ad.playing ? " · gra trwa" : ""}` : "Inna wersja aplikacji"}</Text>
            </Pressable>
          ))
        )}
        <Label>Kod stołu</Label>
        <TextInput
          value={code}
          onChangeText={(c) => {
            setCode(c.toUpperCase().slice(0, 5));
            setBad(false);
          }}
          placeholder="np. K7 4Q"
          placeholderTextColor={P.muted}
          autoCapitalize="characters"
          style={[s.input, s.codeInput]}
          accessibilityLabel="Kod stołu"
        />
        {bad && <Text style={s.error}>Nie znam takiego kodu w tej sieci.</Text>}
        {error && <Text style={s.error}>{error}</Text>}
        <Button3D label="Dołącz" big disabled={code.replace(/\s/g, "").length < 4} onPress={() => void byCode()} style={{ marginTop: 10 }} />
        <Button3D label="Skanuj kod QR" tone="dark" height={48} onPress={() => setScan(true)} style={{ marginTop: 10 }} />
      </ScrollView>
    </View>
  );
}

// ---- guest ------------------------------------------------------------------------

function GuestFlow({ guest, kv, onLeave }: { guest: LanGuest; kv: KV; onLeave: () => void }) {
  const view = useSyncExternalStore(guest.subscribe, () => guest.state);
  if (view.phase === "playing" && guest.snapshot)
    return (
      <LookOverride choice={view.table?.looks ?? null}>
        <LanTable game={guest.game} kv={kv} lan={() => guest.state.lan} subscribeLan={guest.subscribe} onExit={onLeave} onReact={(t) => guest.react(t)} guest offline={view.offline} />
      </LookOverride>
    );
  const title = view.table?.name ?? "Stół";
  let line = "Łączę…";
  if (view.phase === "lobby") line = "Czekamy, aż gospodarz rozda karty.";
  if (view.phase === "refused")
    line = view.refused === "full" ? "Przy stole nie ma wolnych miejsc." : view.refused === "version" ? "Inna wersja aplikacji — zaktualizujcie Oczko." : "Gra przy tym stole już trwa.";
  if (view.phase === "closed") line = view.closed === "removed" ? "Gospodarz usunął Cię ze stołu." : "Gospodarz zamknął stół.";
  return (
    <View style={s.screen}>
      <Header title={title} onBack={onLeave} />
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.big} accessibilityLiveRegion="polite">
          {line}
        </Text>
        {view.offline && <Text style={s.error}>Brak połączenia — łączę ponownie…</Text>}
        {view.phase === "lobby" && (
          <View style={s.panel}>
            {view.slots.map((slot, i) => (
              <View key={i} style={s.slot}>
                {slot.kind === "open" ? <View style={s.emptySeat} /> : <Portrait name={slot.name} size={30} color={slot.kind === "bot" ? personaById(slot.persona)?.color ?? P.muted : P.accent} />}
                <Text style={[s.slotName, slot.kind === "open" && { color: P.muted }]}>
                  {slot.kind === "open" ? "Wolne miejsce" : `${slot.name}${i === view.you ? " (Ty)" : ""}`}
                </Text>
              </View>
            ))}
          </View>
        )}
        {view.table && <Text style={s.note}>{summaryLine(view.table.rules)}</Text>}
      </ScrollView>
    </View>
  );
}

// ---- the table ----------------------------------------------------------------------

function LanTable({
  game,
  kv,
  lan,
  subscribeLan,
  onExit,
  onReact,
  guest,
  offline,
  away = [],
  onBotNow,
  onWaitLonger,
}: {
  game: TableGame;
  kv: KV;
  lan: () => LanInfo | null;
  subscribeLan: (fn: () => void) => () => void;
  onExit: () => void;
  onReact: (t: (typeof REACTION_TEXTS)[number]) => void;
  guest?: boolean;
  offline?: boolean;
  away?: { seat: number; name: string; deadline: number }[];
  onBotNow?: (seat: number) => void;
  onWaitLonger?: (seat: number) => void;
}) {
  const info = useSyncExternalStore(subscribeLan, lan);
  const snap = useSyncExternalStore(game.subscribe, game.getSnapshot);
  const insets = useSafeAreaInsets();
  const reaction = info?.reaction;
  const [shownReaction, setShownReaction] = useState(0);
  useEffect(() => {
    if (!reaction) return;
    const t = setTimeout(() => setShownReaction(reaction.seq), 2500);
    return () => clearTimeout(t);
  }, [reaction]);
  const banners = useMemo(() => {
    const out: { key: string; text: string; seat?: number }[] = [];
    if (offline) out.push({ key: "off", text: "Brak połączenia ze stołem — łączę ponownie…" });
    for (const a of away) out.push({ key: `away${a.seat}`, text: `${a.name} — rozłączenie. Za chwilę zagra bot.`, seat: a.seat });
    if (info?.moveDeadline !== null && info?.moveDeadline !== undefined && snap.view.turn !== null && snap.phase !== "myTurn")
      out.push({ key: "time", text: `${snap.seats[snap.view.turn].name}: ${info.moveDeadline} s na ruch` });
    if (info?.moveDeadline !== null && info?.moveDeadline !== undefined && snap.phase === "myTurn") out.push({ key: "mine", text: `Twój ruch: ${info.moveDeadline} s, potem „Starczy”` });
    if (reaction && reaction.seq !== shownReaction) out.push({ key: `r${reaction.seq}`, text: `${snap.seats[reaction.seat]?.name ?? ""}: ${reaction.text}` });
    return out;
  }, [offline, away, info, snap, reaction, shownReaction]);
  const banner = banners.length ? (
    <View style={{ gap: 6 }}>
      {banners.map((b) => (
        <View key={b.key} style={s.banner} accessibilityLiveRegion="polite">
          <Text style={s.bannerText}>{b.text}</Text>
          {b.seat !== undefined && onBotNow && (
            <View style={{ flexDirection: "row", gap: 6 }}>
              <SmallBtn label="Bot teraz" onPress={() => onBotNow(b.seat!)} a11y="Niech bot zagra teraz" />
              <SmallBtn label="Czekaj" onPress={() => onWaitLonger?.(b.seat!)} a11y="Poczekaj dłużej" />
            </View>
          )}
        </View>
      ))}
    </View>
  ) : null;
  const menuExtra = (
    <View style={[s.reactions, { paddingBottom: insets.bottom ? 0 : 4 }]}>
      <Text style={s.small}>Szybka reakcja</Text>
      <View style={s.reactionRow}>
        {REACTION_TEXTS.map((t) => (
          <SmallBtn key={t} label={t} onPress={() => onReact(t)} a11y={`Reakcja: ${t}`} />
        ))}
      </View>
    </View>
  );
  return <TableScreen game={game} kv={kv} onExit={onExit} onNewGame={onExit} onRules={() => {}} guest={guest} banner={banner} menuExtra={menuExtra} />;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 6 },
  input: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: P.line, backgroundColor: P.surface2, color: P.text, paddingHorizontal: 14, fontSize: 16 },
  codeInput: { fontFamily: DISPLAY, fontSize: 22, letterSpacing: 4, textAlign: "center" },
  note: { color: P.muted, fontSize: 13, lineHeight: 19, marginTop: 10 },
  error: { color: P.danger, fontSize: 13, marginTop: 8 },
  big: { color: P.text, fontFamily: DISPLAY, fontSize: 20, marginVertical: 14 },
  small: { color: P.muted, fontSize: 12 },
  codeCard: { alignItems: "center", gap: 6, backgroundColor: P.surface, borderColor: P.line, borderWidth: 1, borderRadius: 18, padding: 16 },
  code: { color: P.accent, fontFamily: DISPLAY, fontSize: 40, letterSpacing: 6 },
  panel: { backgroundColor: P.surface, borderColor: P.line, borderWidth: 1, borderRadius: 18, paddingHorizontal: 12 },
  found: { paddingVertical: 12, marginBottom: 8, minHeight: 56, justifyContent: "center" },
  slot: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 56, borderBottomWidth: 1, borderBottomColor: P.line },
  slotName: { flex: 1, color: P.text, fontSize: 14.5, fontWeight: "700" },
  emptySeat: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderStyle: "dashed", borderColor: P.line },
  smallBtn: { minHeight: 44, minWidth: 44, paddingHorizontal: 10, borderRadius: 12, backgroundColor: P.surface2, borderWidth: 1, borderColor: P.line, alignItems: "center", justifyContent: "center" },
  smallBtnText: { color: P.text, fontSize: 13, fontWeight: "700" },
  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 18, borderTopWidth: 1, borderTopColor: P.surface2 },
  banner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(15,23,32,0.9)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  bannerText: { flex: 1, color: P.text, fontSize: 12.5, fontWeight: "600" },
  reactions: { paddingVertical: 10, gap: 6, borderBottomWidth: 1, borderBottomColor: P.line },
  reactionRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
});
