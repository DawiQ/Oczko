// In-app confirmation dialogs in the app's own look (the system Alert is a
// white Android/iOS box that clashes with the dark design).
//
//   const confirm = useConfirm();
//   if (await confirm({ title, message, confirmText, destructive: true })) ...
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { DISPLAY } from "./fonts";
import { P } from "./palette";

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText: string;
  cancelText?: string;
  /** The action destroys something (red confirm button). */
  destructive?: boolean;
}

type Confirm = (o: ConfirmOptions) => Promise<boolean>;

const DialogContext = createContext<Confirm | null>(null);

export function useConfirm(): Confirm {
  const confirm = useContext(DialogContext);
  if (!confirm) throw new Error("useConfirm must be used inside <DialogProvider>");
  return confirm;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<ConfirmOptions | null>(null);
  const { width } = useWindowDimensions();
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback<Confirm>(
    (o) =>
      new Promise<boolean>((resolve) => {
        resolver.current?.(false); // a newer dialog replaces an open one
        resolver.current = resolve;
        setOpen(o);
      }),
    []
  );

  const close = (ok: boolean) => {
    const r = resolver.current;
    resolver.current = null;
    setOpen(null);
    r?.(ok);
  };

  return (
    <DialogContext.Provider value={confirm}>
      {children}
      <Modal
        visible={open !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => close(false)}
      >
        {open && (
          <View style={s.backdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => close(false)} accessibilityLabel="Zamknij" />
            <View
              style={[s.panel, { width: Math.min(380, width - 2 * PADDING) }]}
              accessibilityViewIsModal
              accessibilityRole="alert"
            >
              <Text style={s.title}>{open.title}</Text>
              {open.message ? <Text style={s.message}>{open.message}</Text> : null}
              <View style={s.actions}>
                <Pressable style={[s.btn, s.cancel]} onPress={() => close(false)} accessibilityRole="button">
                  <Text style={s.cancelText}>{open.cancelText ?? "Anuluj"}</Text>
                </Pressable>
                <Pressable
                  style={[s.btn, open.destructive ? s.danger : s.primary]}
                  onPress={() => close(true)}
                  accessibilityRole="button"
                >
                  <Text style={open.destructive ? s.dangerText : s.primaryText}>{open.confirmText}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </DialogContext.Provider>
  );
}

// Explicit panel width (not "100%"): never wider than the screen minus margins.
const PADDING = 24;

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(5,10,16,0.72)", alignItems: "center", justifyContent: "center", padding: PADDING },
  panel: { backgroundColor: P.surface, borderColor: P.line, borderWidth: 1, borderRadius: 22, padding: 20, gap: 10 },
  title: { color: P.text, fontSize: 22, fontFamily: DISPLAY },
  message: { color: P.textSoft, fontSize: 15, lineHeight: 21 },
  actions: { flexDirection: "row", gap: 10, marginTop: 10 },
  btn: { flex: 1, minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  cancel: { borderWidth: 1, borderColor: P.line },
  cancelText: { color: P.text, fontSize: 15, fontWeight: "600" },
  primary: { backgroundColor: P.accent },
  primaryText: { color: P.onAccent, fontSize: 15, fontWeight: "700" },
  danger: { backgroundColor: P.dangerBg, borderWidth: 1, borderColor: P.danger },
  dangerText: { color: P.danger, fontSize: 15, fontWeight: "700" },
});
