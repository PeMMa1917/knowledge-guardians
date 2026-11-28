import type { GameController } from "../app/controller";
import {
  envelope,
  firstWatch,
  lampReadings,
  weirLampLine,
  type WeirLampCommand,
} from "../domain/weirLamp";
import { h } from "./dom";
type Move = WeirLampCommand extends infer C
  ? C extends WeirLampCommand
    ? Omit<C, "type">
    : never
  : never;
export function weirLampPanel(c: GameController, click: () => void) {
  const root = h(
    "section",
    {},
    h("h2", {}, "The red line on the flood sheet"),
    h(
      "p",
      {},
      "Harrowmere’s inquiry clerk has carried a red pencil so long that her fingers smell of cedar. She would like to know one thing before she writes the last page. “Would I have seen what I see now, standing there the night before?”",
    ),
    h("p", {}, firstWatch(c.state)),
  );
  const body = h("div", {}),
    live = h("p", { role: "status" });
  root.append(body, live);
  function button(id: string, label: string, m: Move) {
    return h(
      "button",
      {
        type: "button",
        "data-lamp": id,
        onclick: () => {
          const command: WeirLampCommand = { type: "UseWeirLamp", ...m };
          const err = c.dispatch(command).find((e) => e.kind === "error");
          if (err) {
            live.textContent = err.message;
            return;
          }
          draw();
          click();
          live.textContent = weirLampLine(c.state, command);
          body
            .querySelector<HTMLElement>('[data-lamp="' + id + '"]')
            ?.focus({ preventScroll: true });
        },
      },
      label,
    );
  }
  function draw() {
    body.replaceChildren(
      h(
        "div",
        { class: "row" },
        button("before", "Pin the dry-year folder", {
          action: "pin",
          slip: "before",
        }),
        button("after", "Pin the spring inquiry", {
          action: "pin",
          slip: "after",
        }),
      ),
    );
    for (const id of ["before", "after"] as const)
      if (c.state.flags["weir-lamp." + id])
        body.append(h("p", { class: "clue-view" }, lampReadings[id]));
    if (c.state.flags["weir-lamp.before"] && c.state.flags["weir-lamp.after"])
      body.append(
        button("overlay", "Hold the two dates against the light", {
          action: "overlay",
        }),
      );
    if (c.state.flags["weir-lamp.overlaid"])
      body.append(
        h(
          "div",
          { class: "row" },
          button("watch", "Return the blank margin to the watch", {
            action: "deliver",
            to: "watch",
          }),
          button("inquiry", "File both dated leaves at the inquiry", {
            action: "deliver",
            to: "inquiry",
          }),
        ),
      );
    if (envelope(c.state))
      body.append(h("p", {}, String(c.state.flags["weir-lamp.letter"])));
  }
  draw();
  return root;
}
