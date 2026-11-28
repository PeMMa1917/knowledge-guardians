import { vaultWindow } from "./vaultWindow";
import type { GameController } from "../app/controller";
import { vaultWork, waiting, type VaultStation } from "../content/vaultNight";
import { bossDone } from "../domain/undercroft";
import {
  firstPeg,
  flapCount,
  gateApart,
  gateMask,
  letterView,
  listeners,
  nextPeg,
  sawLinked,
  shelfView,
  vaultPhaseStation,
  vaultReady,
  vaultReceipts,
  vaultReport,
  veil,
  waxSeen,
  type VaultCommand,
} from "../domain/vaultWork";
import { h } from "./dom";

type Action = VaultCommand extends infer C
  ? C extends VaultCommand
    ? Omit<C, "type" | "station">
    : never
  : never;
export function vaultPanel(
  c: GameController,
  initial: VaultStation,
  close: () => void,
  sound: (finished: boolean) => void,
) {
  let station = initial;
  const root = h("section", { class: "vault-tools" }),
    title = h("h2", {}),
    voice = h("p", { class: "vault-voice" }),
    live = h("p", { role: "status", class: "vault-status" }),
    rack = h("div", { class: "vault-rack" }),
    choices = h("div", { class: "row" });
  root.append(title, voice, rack, live, choices);
  const state = () => c.state;
  function knob(
    text: string,
    id: string,
    a: Action,
    on?: boolean,
    disabled = false,
  ) {
    const b = h(
      "button",
      {
        type: "button",
        "data-vault": id,
        disabled,
        onclick: () => operate(a, id),
      },
      text,
    );
    if (on !== undefined) b.setAttribute("aria-pressed", String(on));
    return b;
  }
  function operate(a: Action, key: string) {
    const cmd: VaultCommand = { type: "WorkVault", station, ...a };
    const events = c.dispatch(cmd);
    const err = events.find((e) => e.kind === "error");
    if (err) {
      live.textContent = err.message;
      return;
    }
    const result = vaultReport(state(), cmd);
    sound(a.action === "leave");
    if (a.action === "leave") {
      rack.replaceChildren();
      choices.replaceChildren();
      live.textContent = result;
      const more = ["stamp", "margin"].includes(station);
      const onward = h(
        "button",
        {
          type: "button",
          class: "primary",
          "data-vault": "onward",
          onclick: () => {
            if (!more) {
              close();
              return;
            }
            station = vaultPhaseStation(state());
            draw();
            live.textContent = "";
            root
              .querySelector<HTMLButtonElement>("[data-vault]:not(:disabled)")
              ?.focus();
          },
        },
        more
          ? "Follow the next loose leaf"
          : bossDone(state().flags)
            ? "Take Elsbet’s brass lamp"
            : "Step through the grate",
      );
      choices.append(onward);
      onward.focus();
      return;
    }
    draw();
    live.textContent = result;
    (
      root.querySelector<HTMLElement>(
        '[data-vault="' + key + '"]:not(:disabled)',
      ) ?? rack.querySelector<HTMLElement>("button:not(:disabled)")
    )?.focus({ preventScroll: true });
  }
  function group(label: string, ...buttons: HTMLElement[]) {
    rack.append(
      h(
        "div",
        { class: "row", role: "group", "aria-label": label },
        ...buttons,
      ),
    );
  }
  function marks(label: string, labels: string[], mask: number) {
    const ticks = h("ol", { class: "vault-track", "aria-label": label });
    labels.forEach((text, i) =>
      ticks.append(
        h(
          "li",
          { "data-lit": Boolean(mask & (1 << i)) },
          h("span", { "aria-hidden": true }, mask & (1 << i) ? "◆" : "◇"),
          text,
        ),
      ),
    );
    rack.append(ticks);
  }
  function draw() {
    const job = vaultWork[station],
      s = state();
    title.textContent = job.title;
    voice.textContent = job.voice;
    rack.replaceChildren();
    const illustration = vaultWindow(s, station);
    if (illustration) rack.append(illustration);
    choices.replaceChildren();
    switch (station) {
      case "many": {
        const felt = s.flags["vault-work.many.felt"] === true;
        marks(
          "Calls reaching the gallery",
          ["Market stall", "Paper stall", "Red hat", "Service cord"],
          felt ? 8 : 15,
        );
        group(
          "Cord board",
          knob("Pull all four cords", "voices", {
            action: "ring",
            felt: false,
          }),
          knob("Wrap the market bell in felt and ring", "felt", {
            action: "ring",
            felt: true,
          }),
          knob("Try the short service latch", "latch", { action: "latch" }),
        );
        break;
      }
      case "twogates": {
        const mask = gateMask(s);
        marks("Raised shutters", [...waiting], mask);
        group(
          "Linked handle",
          knob("Raise the chain", "all", { action: "link", open: true }),
          knob("Lower the chain", "none", { action: "link", open: false }),
          knob(
            "Lift the middle link",
            "unhook",
            { action: "unhook" },
            undefined,
            !sawLinked(s),
          ),
        );
        if (gateApart(s)) {
          group(
            "Separate shutters",
            ...waiting.map((w, place) =>
              knob(
                (mask & (1 << place) ? "Lower" : "Raise") + " · " + w,
                "gate" + place,
                {
                  action: "shutter",
                  place,
                },
              ),
            ),
          );
        }
        break;
      }
      case "chosen": {
        const from = s.flags["vault-work.chosen.window"];
        group(
          "Index and drawer",
          knob("Fan the three green tabs", "tabs", {
            action: "shelf",
            start: "tabs",
          }),
        );
        const strip = h("div", {
          class: "vault-shelf",
          role: "group",
          "aria-label": "Slide the three-night frame",
        });
        for (const start of [0, 1, 2, 3] as const)
          strip.append(
            knob(
              "Nights " + (start + 1) + "–" + (start + 3),
              "nights" + start,
              { action: "shelf", start },
              start === from,
            ),
          );
        rack.append(strip);
        if (
          from === "tabs" ||
          (typeof from === "number" && from >= 0 && from <= 3)
        )
          rack.append(h("p", { class: "clue-view" }, shelfView(from)));
        break;
      }
      case "stamp": {
        marks(
          "Impressions examined",
          ["Gold seal", "Watch slip", "Date on reverse"],
          waxSeen(s),
        );
        group(
          "Roll the lamp",
          ...(
            [
              "Light the filing seal",
              "Ease out the watch slip",
              "Turn the slip over",
            ] as const
          ).map((label, i) =>
            knob(label, "wax" + i, {
              action: "wax",
              layer: ([0, 1, 2] as const)[i],
            }),
          ),
        );
        break;
      }
      case "margin": {
        const flaps = flapCount(s),
          before = firstPeg(s),
          after = nextPeg(s);
        marks("Two dated leaves", ["Fifth crossing", "Sixth crossing"], flaps);
        rack.append(
          h("p", {}, "The four crossings already open all stayed dry."),
          h(
            "p",
            {},
            "First peg · " +
              (before === -1 ? "unset" : before + " dry crossings out of two") +
              ". Next watch · " +
              (after === -1 ? "unset" : after + " dry crossings out of two") +
              ".",
          ),
        );
        group(
          "Dry crossings expected",
          ...([0, 1, 2] as const).map((n) =>
            knob(
              "Peg " + n + " dry",
              "peg" + n,
              { action: "peg", count: n },
              (flaps === 3 ? after : before) === n,
              flaps === 1 || flaps === 2,
            ),
          ),
        );
        group(
          "Open dated leaves",
          ...([0, 1] as const).map((leaf) =>
            knob(
              leaf ? "Open sixth crossing" : "Open fifth crossing",
              "leaf" + leaf,
              { action: "flap", leaf },
              Boolean(flaps & (1 << leaf)),
              before < 0,
            ),
          ),
        );
        break;
      }
      case "promise": {
        const edge = veil(s),
          ears = listeners(s);
        rack.append(
          h("blockquote", { class: "vault-letter" }, letterView(edge)),
        );
        group(
          "Paper shutters",
          knob(
            "Unfold the left edge",
            "left",
            { action: "letter", edge: "before" },
            Boolean(edge & 1),
          ),
          knob(
            "Unfold the right edge",
            "right",
            { action: "letter", edge: "after" },
            Boolean(edge & 2),
          ),
        );
        group(
          "Listening rail",
          ...(["Elsbet", "Archivist"] as const).map((who, i) =>
            knob(
              "Take " + (i ? "the keeper’s" : "Elsbet’s") + " chair",
              "ear" + i,
              { action: "ear", who },
              Boolean(ears & (1 << i)),
              edge !== 3,
            ),
          ),
        );
        break;
      }
    }
    if (vaultReady(s, station))
      choices.append(
        ...([0, 1] as const).map((n) =>
          knob(job.pair[n], "give" + n, { action: "leave", for: n }),
        ),
      );
    else
      choices.append(
        h(
          "details",
          {},
          h("summary", {}, "Look more closely"),
          h("p", {}, job.help),
        ),
      );
  }
  draw();
  return root;
}

export function vaultIndex(c: GameController) {
  return vaultReceipts(c.state).map(({ station, title, text }) => {
    const page = h("details", {}, h("summary", {}, title), h("p", {}, text));
    page.addEventListener("toggle", () => {
      if (page.open)
        c.dispatch({
          type: "ReadWorldSign",
          id: "vault-history." + station,
          title,
          text,
        });
    });
    return page;
  });
}
