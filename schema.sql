CREATE TABLE uploads (
    id serial primary key,
    title text,
    body text,
    tstamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image text
);

CREATE TABLE "comments" (
    "id" serial,
    "body" varchar(150),
    "postid" int,
    "userid" int,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("postid") REFERENCES "uploads"("id"),
    FOREIGN KEY ("userid") REFERENCES "user"("id")
);



CREATE TABLE "user" (
    "id" serial,
    "firstName" text,
    "lastName" text,
    "email" text,
    "password" text,
    "profileimg" text,
    PRIMARY KEY ("id")
);

CREATE TABLE tag (
    id serial primary key,
    body text
);

-- alter table for tag
ALTER TABLE uploads
ADD tags text[] not null default '{}';

-- sample values
INSERT INTO "user"("firstName", "lastName", "email", "password", "profileimg") VALUES('joven', 'macaldo', 'test@email.com', 'secret', 'face.jpg') RETURNING "id", "firstName", "lastName", "email", "password", "profileimg";

INSERT INTO "comments"("body") VALUES('test') RETURNING "id", "body", "postid", "userid";




    
