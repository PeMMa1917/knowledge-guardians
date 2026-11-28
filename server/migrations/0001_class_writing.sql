PRAGMA foreign_keys = ON;
CREATE TABLE accounts (
  id TEXT PRIMARY KEY, login TEXT NOT NULL UNIQUE COLLATE NOCASE, display TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('student','teacher')), salt TEXT NOT NULL, verifier TEXT NOT NULL
);
CREATE TABLE classes (id TEXT PRIMARY KEY, title TEXT NOT NULL, teacher TEXT NOT NULL REFERENCES accounts(id));
CREATE TABLE memberships (
  student TEXT PRIMARY KEY REFERENCES accounts(id), class TEXT NOT NULL REFERENCES classes(id),
  approved INTEGER NOT NULL DEFAULT 0 CHECK(approved IN (0,1))
);
CREATE TABLE sessions (digest TEXT PRIMARY KEY, account TEXT NOT NULL REFERENCES accounts(id), expires INTEGER NOT NULL);
CREATE INDEX session_expiry ON sessions(expires);
CREATE TABLE login_limits (bucket TEXT PRIMARY KEY, attempts INTEGER NOT NULL, until_time INTEGER NOT NULL);
CREATE TABLE versions (
  student TEXT NOT NULL REFERENCES accounts(id), class TEXT NOT NULL REFERENCES classes(id),
  teacher TEXT NOT NULL REFERENCES accounts(id), revision INTEGER NOT NULL,
  package TEXT NOT NULL, writing TEXT NOT NULL, updated TEXT NOT NULL,
  PRIMARY KEY(student,class,teacher,revision)
);
CREATE TRIGGER five_versions AFTER INSERT ON versions BEGIN
  DELETE FROM versions WHERE student=NEW.student AND class=NEW.class AND teacher=NEW.teacher AND revision <= NEW.revision-5;
END;
