ALTER TABLE class_scores ADD COLUMN name_rule TEXT;
ALTER TABLE class_scores ADD COLUMN flagged_alias TEXT;
ALTER TABLE class_scores ADD COLUMN alias_key TEXT;

-- Previous class rows came from devices. They cannot become server-earned results.
UPDATE class_scores SET alias=NULL,scores='{}',revision=revision+1;
CREATE UNIQUE INDEX one_ranked_nickname ON class_scores(class,teacher,alias_key)
WHERE alias IS NOT NULL AND scores<>'{}';

CREATE TABLE stitch_rounds (
  student TEXT NOT NULL, class TEXT NOT NULL, teacher TEXT NOT NULL,
  id TEXT NOT NULL, deck TEXT NOT NULL, started INTEGER NOT NULL, updated INTEGER NOT NULL,
  turns INTEGER NOT NULL DEFAULT 0, matched INTEGER NOT NULL DEFAULT 0,
  first_tile INTEGER, second_tile INTEGER, finished INTEGER,
  PRIMARY KEY(student,class,teacher)
);
CREATE TABLE stitch_bests (
  student TEXT NOT NULL, class TEXT NOT NULL, teacher TEXT NOT NULL, day TEXT NOT NULL,
  moves INTEGER NOT NULL CHECK(moves BETWEEN 6 AND 120), seconds INTEGER NOT NULL CHECK(seconds BETWEEN 1 AND 86400),
  PRIMARY KEY(student,class,teacher,day)
);
CREATE TRIGGER score_finished_stitch AFTER UPDATE OF finished ON stitch_rounds
WHEN OLD.finished IS NULL AND NEW.finished IS NOT NULL BEGIN
  INSERT INTO stitch_bests(student,class,teacher,day,moves,seconds)
    VALUES(NEW.student,NEW.class,NEW.teacher,date(NEW.finished/1000,'unixepoch'),NEW.turns/2,max(1,(NEW.finished-NEW.started+999)/1000))
    ON CONFLICT(student,class,teacher,day) DO UPDATE SET moves=min(moves,excluded.moves),seconds=min(seconds,excluded.seconds);
  DELETE FROM stitch_bests WHERE student=NEW.student AND class=NEW.class AND teacher=NEW.teacher
    AND day<date(NEW.finished/1000,'unixepoch','-366 days');
END;
CREATE TRIGGER reset_ranked_on_move AFTER UPDATE OF class,approved ON memberships
WHEN OLD.class <> NEW.class OR OLD.approved <> NEW.approved BEGIN
  UPDATE class_scores SET name_rule=NULL,flagged_alias=NULL,alias_key=NULL WHERE student=OLD.student;
  DELETE FROM stitch_rounds WHERE student=OLD.student;
  DELETE FROM stitch_bests WHERE student=OLD.student;
END;
CREATE TRIGGER reset_ranked_on_leave AFTER DELETE ON memberships BEGIN
  UPDATE class_scores SET name_rule=NULL,flagged_alias=NULL,alias_key=NULL WHERE student=OLD.student;
  DELETE FROM stitch_rounds WHERE student=OLD.student;
  DELETE FROM stitch_bests WHERE student=OLD.student;
END;
CREATE TRIGGER reset_ranked_on_teacher_change AFTER UPDATE OF teacher ON classes
WHEN OLD.teacher <> NEW.teacher BEGIN
  UPDATE class_scores SET name_rule=NULL,flagged_alias=NULL,alias_key=NULL WHERE class=OLD.id;
  DELETE FROM stitch_rounds WHERE class=OLD.id;
  DELETE FROM stitch_bests WHERE class=OLD.id;
END;
