"""Build the chapter review workbook from an offline checklist and its review ledger."""
import argparse
from collections import defaultdict
import json
from pathlib import Path
import re

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

DOCS = Path(__file__).resolve().parents[1] / "docs" / "audit"
LEVELS = ("remember", "understand", "apply", "analyse", "evaluate", "create")
CONTEXT = ("story:11, game:22", "concept:evidence", "framework:ethics", "theme:knower")
HEADINGS = (
    "Element or action ID", "Row type or family", "Element or observed action",
    "Narrative and game", "Key concepts", "Knowledge framework", "Areas and themes",
    "Additional members or ordered steps", "Knowledge questions",
    *(f"{level.title()} · DOK {dok}" for level in LEVELS for dok in range(1, 5)),
    "Evidence / source / perspectives", "Distinct action IDs",
)


def checklist_data(path):
    raw = path.read_text(encoding="utf-8")
    match = re.search(r'<script type="application/json" id="atlasData">(.*?)</script>', raw, re.S)
    if not match:
        raise ValueError("The selected document has no combination catalogue.")
    return json.loads(match.group(1))


def review_row(records, names):
    board = records[0]["board"]
    ids = board["ids"]

    def matching(*kinds):
        return ", ".join(i for i in ids if i.split(":", 1)[0] in kinds)

    anchor_kinds = {"story", "game", "concept", "framework", "area", "theme", "question"}
    extra = ", ".join(i for i in ids if i.split(":", 1)[0] not in anchor_kinds)
    if board.get("steps"):
        extra = " > ".join(", ".join(step) for step in board["steps"])
    answers = [None] * 24
    notes, actions, sample = [], [], ""
    for record in records:
        index = 4 * LEVELS.index(record["bloom"]) + record["dok"] - 1
        label = f'{record["bloom"].title()} · DOK {record["dok"]}'
        if answers[index] is not None:
            raise ValueError("The ledger repeats a cell on the same board.")
        answers[index] = "Reviewed" if record["checked"] else "Open"
        evidence = record.get("evidence", "")
        if evidence:
            sample = sample or evidence.splitlines()[0]
            notes.append(label + "\n" + evidence)
        if record.get("actions"):
            actions.append(label + "\n" + "\n".join(dict.fromkeys(record["actions"])))
    return [
        ids[0], "Recorded review", sample or names[ids[0]],
        matching("story", "game"), matching("concept"), matching("framework"),
        matching("area", "theme"), extra, matching("question"), *answers,
        "\n\n".join(notes), "\n\n".join(actions),
    ]


def put_review(book, sheet, values):
    row = sheet.max_row + 1
    for column, value in enumerate(values, 1):
        if value is None:
            continue
        cell = sheet.cell(row, column)
        if len(value.encode("utf-16-le")) > 65534:
            if "Long entries" not in book:
                long = book.create_sheet("Long entries")
                long.append(["Chapter", "Cell", "Part", "Text"])
                long.freeze_panes = "D2"
                long.column_dimensions["D"].width = 90
            long = book["Long entries"]
            first = long.max_row + 1
            for n, offset in enumerate(range(0, len(value), 15000), 1):
                long.append([sheet.title, cell.coordinate, n, value[offset:offset + 15000]])
                long.cell(long.max_row, 4).data_type = "s"
            value = f"Full value in Long entries, rows {first}–{long.max_row}."
        cell.value = value
        cell.data_type = "s"


def workbook(members, ledger, rubric=None):
    names = {m["id"]: m["name"] for m in members}
    groups = defaultdict(dict)
    if ledger.get("version") != 1 or not isinstance(ledger.get("records"), list):
        raise ValueError("Use an exported version 1 review ledger.")
    for record in ledger["records"]:
        board = record["board"]
        ids = set(board["ids"])
        if not ids or not ids.issubset(names) or board["chapter"] not in range(1, 16):
            raise ValueError("The ledger refers to a chapter or member outside this checklist.")
        if record["bloom"] not in LEVELS or record["dok"] not in range(1, 5):
            raise ValueError("Unknown cognitive cell in the review ledger.")
        if not isinstance(record["checked"], bool):
            raise ValueError("A review status must be either checked or open.")
        steps = tuple(tuple(sorted(set(step))) for step in board.get("steps", ()))
        if steps and (not all(steps) or {i for step in steps for i in step} != ids):
            raise ValueError("Every selected member must be included in the ordered steps.")
        key = (tuple(sorted(ids)), steps)
        groups[board["chapter"]].setdefault(key, []).append(record)
    book = Workbook()
    book.properties.title = "Knowledge Guardians · Chapter review grids"
    intro = book.active
    intro.title = "How to review"
    instructions = [
        "Knowledge Guardians · Bloom and DOK checklist",
        f'Each of the 15 chapters contains {len(members):,} individual element rows. Change or combine those rows to review any anchored selection.',
        "Recorded review rows come first. Only the exact chapter, combination, Bloom and DOK of the documented action has a recorded status. Evidence and action IDs are in columns AH and AI.",
        "The element rows start from a public decision about evidence and responsibility. The context fields may be edited. Duplicate a row before changing a combination you have already reviewed.",
        "Use one or more key concepts, framework parts, and areas or themes. Add story elements, game elements and the precise knowledge question. List the other members or ordered steps in column H.",
        "Each of columns J through AG is a separate review. Select Reviewed or Open. An empty cell awaits review. Identify the action, two viewpoints and what changed in column AH.",
        "For the ten-action target, enter distinct reproducible action IDs in column AI. Repeating an action leaves it as one opportunity. An implementation review establishes what was available to do.",
        "The offline HTML checklist can search by name, address a combination or order by number and store your decisions for future use. A board reference opens the same review. JSON carries the recorded checks and notes.",
    ]
    for line in instructions:
        intro.append([line])
    intro.column_dimensions["A"].width = 116
    intro["A1"].font = Font(size=18, bold=True, color="14574F")
    for i in range(2, len(instructions) + 1):
        intro.cell(i, 1).alignment = Alignment(wrap_text=True, vertical="center")
        intro.row_dimensions[i].height = 42
    for ch in range(1, 16):
        sheet = book.create_sheet(f"Chapter {ch:02d}")
        sheet.append(HEADINGS)
        for records in groups[ch].values():
            put_review(book, sheet, review_row(records, names))
        for m in members:
            sheet.append([m["id"], m["kind"], m["name"], *CONTEXT])
            # openpyxl otherwise interprets an equals sign at the start of a title as a formula.
            if m["name"].startswith("="):
                sheet.cell(sheet.max_row, 3).data_type = "s"
        sheet.freeze_panes = "J2"
        sheet.auto_filter.ref = f"A1:AI{sheet.max_row}"
        sheet.sheet_view.zoomScale = 75
        for i, width in enumerate([32, 20, 66, 32, 30, 31, 30, 60, 54] + [15] * 24 + [88, 49], 1):
            sheet.column_dimensions[get_column_letter(i)].width = width
        for cell in sheet[1]:
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = PatternFill("solid", fgColor="17675C")
            cell.alignment = Alignment(wrap_text=True)
        sheet.row_dimensions[1].height = 36
        check = DataValidation(type="list", formula1='"Reviewed,Open"', allow_blank=True)
        check.showErrorMessage = True
        check.error = "Choose Reviewed or Open."
        sheet.add_data_validation(check)
        check.add("J2:AG1048576")
    if rubric:
        guide = book.create_sheet("Bloom and DOK")
        guide.append(["Bloom", "DOK", "Review criterion", "Example or question for the reviewer"])
        for level in LEVELS:
            for dok, (criterion, example) in enumerate(rubric[level], 1):
                guide.append([level.title(), dok, criterion, example])
        for letter, width in [("A", 17), ("B", 9), ("C", 49), ("D", 96)]:
            guide.column_dimensions[letter].width = width
        for row in guide:
            for cell in row:
                cell.alignment = Alignment(wrap_text=True, vertical="center")
            guide.row_dimensions[row[0].row].height = 50 if row[0].row > 1 else 28
        for cell in guide[1]:
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = PatternFill("solid", fgColor="17675C")
        guide.freeze_panes = "C2"
        guide.auto_filter.ref = guide.dimensions
    return book


def verify_export(path, members, ledger, rubric=None):
    """Check the shipped workbook against every catalogue row and exact recorded cell."""
    names = {m["id"]: m["name"] for m in members}
    expected = defaultdict(dict)
    for record in ledger["records"]:
        board = record["board"]
        key = (tuple(sorted(board["ids"])), tuple(tuple(sorted(s)) for s in board.get("steps", ())))
        expected[board["chapter"]].setdefault(key, []).append(record)
    data = load_workbook(path, read_only=True, data_only=False)
    try:
        if rubric:
            expected_guide = [(level.title(), dok, *entry) for level in LEVELS
                              for dok, entry in enumerate(rubric[level], 1)]
            if list(data["Bloom and DOK"].values)[1:] != expected_guide:
                raise ValueError("The workbook differs from the current 24 review criteria.")
        for chapter in range(1, 16):
            sheet = data[f"Chapter {chapter:02d}"]
            rows = iter(sheet.values)
            if next(rows) != HEADINGS:
                raise ValueError(f"Chapter {chapter} is missing a cognitive column.")
            for records in expected[chapter].values():
                row = next(rows)
                for index, value in enumerate(review_row(records, names)):
                    if value is None or len(value.encode("utf-16-le")) <= 65534:
                        if row[index] != (value or None):
                            raise ValueError(f"Recorded review differs in {sheet.title} column {index + 1}.")
                    elif not row[index] or "Full value in Long entries" not in row[index]:
                        raise ValueError(f"Missing continuation in {sheet.title}.")
            for member in members:
                row = next(rows)
                if row[:7] != (member["id"], member["kind"], member["name"], *CONTEXT) or any(row[7:]):
                    raise ValueError(f'Incorrect starter row in {sheet.title} for {member["id"]}.')
            if next(rows, None) is not None:
                raise ValueError(f"Unexpected additional rows in {sheet.title}.")
    finally:
        data.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    parser.add_argument("--checklist", type=Path, default=DOCS / "COMBINATION_CHECKLIST.html")
    parser.add_argument("--ledger", type=Path, default=DOCS / "COMBINATION_REVIEWED.json")
    parser.add_argument("--check", action="store_true", help="Verify an existing workbook against the catalogue and ledger.")
    args = parser.parse_args()
    catalogue = checklist_data(args.checklist)
    members = catalogue["members"]
    rubric = catalogue.get("rubric")
    ledger = json.loads(args.ledger.read_text(encoding="utf-8"))
    if args.check:
        verify_export(args.output, members, ledger, rubric)
        print(f'Verified {len(members):,} rows across 15 chapters and {len(ledger["records"])} exact review records.')
    else:
        workbook(members, ledger, rubric).save(args.output)
