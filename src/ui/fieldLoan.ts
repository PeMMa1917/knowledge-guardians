import type { GameController } from "../app/controller";
import { loanStops, type LoanStop } from "../content/loanCrews";
import {
  equippedLoan,
  loanReading,
  loanMark,
  readerAnswer,
  readerLetters,
  returnedLoan,
  selectedLoan,
  setupLabels,
  testedLoan,
  type Setting,
} from "../domain/fieldLoan";
import { artURL } from "./illustrations";
import { h } from "./dom";

const sounds = {
  press: "sfx.metal",
  stage: "sfx.coin",
  dispatch: "sfx.page",
  fern: "sfx.book",
} as const;
export function fieldLoanPanel(
  c: GameController,
  stop: LoanStop,
  sound: (key: string) => void,
) {
  const desk = loanStops[stop],
    root = h(
      "section",
      { class: "loan-work", "data-stop": stop },
      h("h2", {}, desk.title),
    ),
    fitted = equippedLoan(c.pack, c.state, stop);
  if (!fitted) {
    root.append(
      h("p", {}, desk.hook),
      h(
        "p",
        {},
        "Bring a collected object that names " +
          desk.place +
          " in its satchel description.",
      ),
    );
    return root;
  }
  const loan = fitted;
  const { record, card, job, peer, incoming } = loan;
  const [title, limit] = [record.name, card.limits],
    source = c.pack.sources.find((s) => s.id === record.specimen.source);
  root.append(
    h("p", {}, job.need),
    h(
      "details",
      {},
      h("summary", {}, title),
      h("p", {}, card.text),
      h("p", {}, limit),
      h("p", {}, job.boundary),
      source?.url
        ? h(
            "a",
            { href: source.url, target: "_blank", rel: "noopener noreferrer" },
            record.specimen.institution + " · " + record.specimen.accession,
          )
        : null,
    ),
  );
  const other = loanStops[peer];
  root.append(
    h(
      "p",
      { class: "fine" },
      incoming === "first"
        ? "A second bench for this object is at " + other.place + "."
        : incoming === "carry"
          ? "The fast slip from " + other.place + " arrives with the object."
          : "The desk at " +
            other.place +
            " kept the full account. Its return mark comes with the object.",
    ),
  );
  const controls = h("div", {
    class: "loan-controls",
    role: "group",
    "aria-label": desk.action,
  });
  const trial = h("div", {
    class: "loan-sample",
    role: "group",
    "aria-label": "Practice readings",
    "data-setting": "untried",
  });
  const live = h("p", {
    role: "status",
    "aria-live": "polite",
    class: "loan-feedback",
  });
  const output = h("div", {
    class: "loan-controls",
    role: "group",
    "aria-label": "Give a reader an edition",
  });
  const route = h("p", { class: "fine" });
  const rack = h("div", {
    class: "loan-controls",
    role: "group",
    "aria-label": {
      press: "Move the type carriage",
      stage: "Step through the performance",
      dispatch: "Tie a line to the strap",
      fern: "Wrap the practice roll",
    }[stop],
  });
  const indicator = h("p", { class: "fine" });
  function adjust(pos: Setting) {
    const events = c.dispatch({
      type: "WorkFieldLoan",
      key: loan.key,
      stop,
      mode: "adjust",
      position: pos,
    });
    if (events.some((e) => e.kind === "error")) return;
    loan.position = pos;
    const result = paint();
    live.textContent = result?.observation ?? "Ready for another reading.";
    sound("sfx.click");
  }
  if (stop === "press") {
    const slider = h("input", {
      type: "range",
      min: "0",
      max: "2",
      step: "1",
      value: String(loan.position),
      "aria-label": "Move the left stop along the type",
      "aria-valuetext": setupLabels.press[loan.position],
      onchange: (e: Event) =>
        adjust(Number((e.currentTarget as HTMLInputElement).value) as Setting),
    });
    rack.append(h("label", {}, "Left edge of the impression ", slider));
  } else if (stop === "stage") {
    for (const [step, label] of [
      [-1, "Rewind one beat"],
      [1, "Advance one beat"],
    ] as const)
      rack.append(
        h(
          "button",
          {
            type: "button",
            onclick: () => adjust(((loan.position + step + 3) % 3) as Setting),
          },
          label,
        ),
      );
  } else {
    for (const [i, label] of setupLabels[stop].entries())
      rack.append(
        h(
          "button",
          { type: "button", onclick: () => adjust(i as Setting) },
          label,
        ),
      );
  }
  const face = () =>
    [0, 1, 2].map((i) => testedLoan(c.state, stop, loan, i as Setting));
  const letters = h(
    "details",
    {},
    h("summary", {}, "A letter from the next reader"),
  );
  const post = h("div", {
    class: "loan-controls",
    role: "group",
    "aria-label": "Answer the reader",
  });
  letters.append(post);
  for (const [i, label] of readerLetters[stop].entries())
    post.append(
      h(
        "button",
        {
          type: "button",
          onclick: () => {
            const setting = selectedLoan(c.state, stop, loan);
            if (setting === undefined) return;
            const letter = i as Setting;
            const events = c.dispatch({
              type: "WorkFieldLoan",
              key: loan.key,
              stop,
              mode: "letter",
              letter,
            });
            if (events.some((e) => e.kind === "error")) return;
            paint();
            live.textContent = readerAnswer(loan, stop, letter, setting);
            sound("sfx.page");
          },
        },
        label,
      ),
    );
  function paint() {
    indicator.textContent = setupLabels[stop][loan.position];
    rack
      .querySelector("input")
      ?.setAttribute("aria-valuetext", indicator.textContent);
    if (stop === "dispatch" || stop === "fern")
      [...rack.querySelectorAll("button")].forEach((b, i) =>
        b.setAttribute("aria-pressed", String(i === loan.position)),
      );
    const active = selectedLoan(c.state, stop, loan),
      attempts = face();
    const named =
      c.state.flags[
        loanMark(stop, loan.key) +
          "." +
          incoming +
          "." +
          loan.position +
          ".identified"
      ] === true;
    [...post.querySelectorAll("button")].forEach(
      (b, i) => (b.disabled = active === undefined || (i !== 0 && !named)),
    );
    trial.dataset.setting = active === undefined ? "untried" : String(active);
    const sheet =
      active === undefined
        ? undefined
        : loanReading(record, card, stop, active, incoming, loan.position);
    trial.replaceChildren(
      h("img", { src: artURL(desk.art), alt: "", "aria-hidden": true }),
      ...(sheet
        ? sheet.strips.map((s) =>
            h(
              "div",
              { class: "loan-slip" },
              h("strong", {}, s.label),
              h("span", {}, s.text),
            ),
          )
        : [h("p", {}, desk.action + " to see who can read each part.")]),
    );
    [...controls.querySelectorAll("button")].forEach((b, i) => {
      b.setAttribute("aria-pressed", String(i === active));
      b.dataset.tried = String(attempts[i]);
    });
    for (const b of output.querySelectorAll("button"))
      b.disabled = !(attempts[0] && attempts[1]);
    const sent = returnedLoan(c.state, stop, loan.key);
    route.textContent = sent
      ? "Last edition for this object · " +
        desk.doors[sent === "carry" ? 0 : 1] +
        ". You can reset the work and issue the other edition."
      : attempts[0] && attempts[1]
        ? "Two readings are ready. You can try the third arrangement or open one of the two ways."
        : "Run the first two arrangements with this slip to open either way.";
    return sheet;
  }
  for (const [i, label] of desk.controls.entries())
    controls.append(
      h(
        "button",
        {
          type: "button",
          onclick: () => {
            const events = c.dispatch({
              type: "WorkFieldLoan",
              key: loan.key,
              stop,
              mode: "try",
              setting: i as Setting,
            });
            if (events.some((e) => e.kind === "error")) return;
            const sheet = paint();
            if (sheet) live.textContent = sheet.observation;
            if (stop !== "stage" || sheet?.bell) sound(sounds[stop]);
          },
        },
        label,
      ),
    );
  for (const [i, edition] of (["carry", "keep"] as const).entries())
    output.append(
      h(
        "button",
        {
          type: "button",
          onclick: () => {
            const events = c.dispatch({
              type: "WorkFieldLoan",
              key: loan.key,
              stop,
              mode: "issue",
              edition,
            });
            if (events.some((e) => e.kind === "error")) return;
            paint();
            live.textContent =
              desk.replies[i] +
              " Look for " +
              desk.doors[i] +
              " beside the bench.";
            sound("sfx.page");
          },
        },
        desk.choices[i],
      ),
    );
  root.append(rack, indicator, controls, trial, letters, live, output, route);
  const current = paint();
  if (current) live.textContent = current.observation;
  return root;
}
