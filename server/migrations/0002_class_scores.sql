CREATE TABLE class_scores (
  student TEXT NOT NULL REFERENCES accounts(id),
  class TEXT NOT NULL REFERENCES classes(id),
  teacher TEXT NOT NULL REFERENCES accounts(id),
  revision INTEGER NOT NULL,
  alias TEXT,
  scores TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY(student,class,teacher)
);
CREATE INDEX class_score_list ON class_scores(class,teacher) WHERE alias IS NOT NULL;

CREATE TRIGGER withdraw_scores_on_move AFTER UPDATE OF class,approved ON memberships
WHEN OLD.class <> NEW.class OR OLD.approved <> NEW.approved BEGIN
  UPDATE class_scores SET alias=NULL, scores='{}', revision=revision+1 WHERE student=OLD.student;
END;

CREATE TRIGGER withdraw_scores_on_leave AFTER DELETE ON memberships BEGIN
  UPDATE class_scores SET alias=NULL, scores='{}', revision=revision+1 WHERE student=OLD.student;
END;

CREATE TRIGGER withdraw_scores_on_teacher_change AFTER UPDATE OF teacher ON classes
WHEN OLD.teacher <> NEW.teacher BEGIN
  UPDATE class_scores SET alias=NULL, scores='{}', revision=revision+1 WHERE class=OLD.id;
END;
