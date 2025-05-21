-- Initial test data for books table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM books WHERE name = 'To Kill a Mockingbird') THEN
        INSERT INTO books (name, author_name, publish_year, attributes, created_at, updated_at)
        VALUES ('To Kill a Mockingbird', 'Harper Lee', '1960',
                '{"genre": "Fiction", "tags": ["classic", "southern"], "rank": 1, "pages": 281}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM books WHERE name = '1984') THEN
        INSERT INTO books (name, author_name, publish_year, attributes, created_at, updated_at)
        VALUES ('1984', 'George Orwell', '1949',
                '{"genre": "Dystopian", "tags": ["political", "classic"], "rank": 2, "pages": 328}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM books WHERE name = 'The Great Gatsby') THEN
        INSERT INTO books (name, author_name, publish_year, attributes, created_at, updated_at)
        VALUES ('The Great Gatsby', 'F. Scott Fitzgerald', '1925',
                '{"genre": "Fiction", "tags": ["classic", "american"], "rank": 3, "pages": 180}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM books WHERE name = 'Pride and Prejudice') THEN
        INSERT INTO books (name, author_name, publish_year, attributes, created_at, updated_at)
        VALUES ('Pride and Prejudice', 'Jane Austen', '1813',
                '{"genre": "Romance", "tags": ["classic", "regency"], "rank": 4, "pages": 432}',
                NOW(), NOW());
END IF;
END
$$;

-- Initial test data for people table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM people WHERE name = 'Harper Lee') THEN
        INSERT INTO people (name, email, birth_date, occupation, attributes, created_at, updated_at)
        VALUES ('Harper Lee', 'harper.lee@example.com', '1926-04-28', 'Author',
                '{"nationality": "American", "awards": ["Pulitzer Prize"], "biography": "Nelle Harper Lee was an American novelist..."}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM people WHERE name = 'George Orwell') THEN
        INSERT INTO people (name, email, birth_date, occupation, attributes, created_at, updated_at)
        VALUES ('George Orwell', 'george.orwell@example.com', '1903-06-25', 'Author',
                '{"nationality": "British", "real_name": "Eric Arthur Blair", "biography": "English novelist and essayist..."}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM people WHERE name = 'F. Scott Fitzgerald') THEN
        INSERT INTO people (name, email, birth_date, occupation, attributes, created_at, updated_at)
        VALUES ('F. Scott Fitzgerald', 'scott.fitzgerald@example.com', '1896-09-24', 'Author',
                '{"nationality": "American", "biography": "American novelist, essayist, and short story writer..."}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM people WHERE name = 'Jane Austen') THEN
        INSERT INTO people (name, email, birth_date, occupation, attributes, created_at, updated_at)
        VALUES ('Jane Austen', 'jane.austen@example.com', '1775-12-16', 'Author',
                '{"nationality": "British", "biography": "English novelist known primarily for her six major novels..."}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM people WHERE name = 'John Smith') THEN
        INSERT INTO people (name, email, birth_date, occupation, attributes, created_at, updated_at)
        VALUES ('John Smith', 'john.smith@example.com', '1980-05-15', 'Literary Critic',
                '{"education": "PhD in Literature", "specialization": "20th Century Fiction"}',
                NOW(), NOW());
END IF;
END
$$;

-- Initial test data for summaries table
DO $$
DECLARE
book_id_mockingbird BIGINT;
    book_id_1984 BIGINT;
BEGIN
    -- Get IDs of existing books
SELECT id INTO book_id_mockingbird FROM books WHERE name = 'To Kill a Mockingbird';
SELECT id INTO book_id_1984 FROM books WHERE name = '1984';

IF book_id_mockingbird IS NOT NULL AND NOT EXISTS (SELECT 1 FROM summaries WHERE entity_type = 'book' AND entity_id = book_id_mockingbird) THEN
        INSERT INTO summaries (name, entity_type, entity_id, content, source, attributes, created_at, updated_at)
        VALUES ('Classic Summary of To Kill a Mockingbird', 'book', book_id_mockingbird,
                'Set in the 1930s Alabama, this novel follows Scout Finch and her father Atticus, a lawyer defending a Black man accused of raping a white woman. The story explores themes of racial injustice, moral growth, and the loss of innocence.',
                'ClassicLiteratureGuide',
                '{"quality_score": 4.8, "word_count": 42}',
                NOW(), NOW());
END IF;

    IF book_id_mockingbird IS NOT NULL AND NOT EXISTS (SELECT 1 FROM summaries WHERE entity_type = 'book' AND entity_id = book_id_mockingbird AND source = 'AI-Generated') THEN
        INSERT INTO summaries (name, entity_type, entity_id, content, source, attributes, created_at, updated_at)
        VALUES ('AI Summary of To Kill a Mockingbird', 'book', book_id_mockingbird,
                'Harper Lee''s powerful novel explores racial prejudice and moral complexity through the eyes of a young girl in Depression-era Alabama. The narrative centers around her father''s legal defense of a Black man falsely accused of a crime, revealing deep social divides and the importance of empathy and moral courage.',
                'AI-Generated',
                '{"quality_score": 4.2, "word_count": 51, "model": "GPT-4"}',
                NOW(), NOW());
END IF;

    IF book_id_1984 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM summaries WHERE entity_type = 'book' AND entity_id = book_id_1984) THEN
        INSERT INTO summaries (name, entity_type, entity_id, content, source, attributes, created_at, updated_at)
        VALUES ('Summary of 1984', 'book', book_id_1984,
                'Orwell''s dystopian masterpiece depicts a totalitarian future where Big Brother watches everyone and the Thought Police suppress individualism. The protagonist Winston Smith rebels against the Party by falling in love and keeping a diary, only to face the horrific consequences of challenging the system.',
                'LiteraryArchive',
                '{"quality_score": 4.9, "word_count": 47}',
                NOW(), NOW());
END IF;
END
$$;

-- Initial test data for relationships table
DO $$
DECLARE
book_id_mockingbird BIGINT;
    book_id_1984 BIGINT;
    book_id_gatsby BIGINT;
    book_id_pride BIGINT;
    person_id_lee BIGINT;
    person_id_orwell BIGINT;
    person_id_fitzgerald BIGINT;
    person_id_austen BIGINT;
    person_id_smith BIGINT;
BEGIN
    -- Get IDs of existing entities
SELECT id INTO book_id_mockingbird FROM books WHERE name = 'To Kill a Mockingbird';
SELECT id INTO book_id_1984 FROM books WHERE name = '1984';
SELECT id INTO book_id_gatsby FROM books WHERE name = 'The Great Gatsby';
SELECT id INTO book_id_pride FROM books WHERE name = 'Pride and Prejudice';

SELECT id INTO person_id_lee FROM people WHERE name = 'Harper Lee';
SELECT id INTO person_id_orwell FROM people WHERE name = 'George Orwell';
SELECT id INTO person_id_fitzgerald FROM people WHERE name = 'F. Scott Fitzgerald';
SELECT id INTO person_id_austen FROM people WHERE name = 'Jane Austen';
SELECT id INTO person_id_smith FROM people WHERE name = 'John Smith';

-- Author relationships
IF person_id_lee IS NOT NULL AND book_id_mockingbird IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'authored' AND source_type = 'person' AND source_id = person_id_lee AND target_type = 'book' AND target_id = book_id_mockingbird) THEN
        INSERT INTO relationships (name, relationship_type, source_type, source_id, target_type, target_id, attributes, created_at, updated_at)
        VALUES ('Harper Lee authored To Kill a Mockingbird', 'authored', 'person', person_id_lee, 'book', book_id_mockingbird,
                '{"year": 1960, "publisher": "J. B. Lippincott & Co."}',
                NOW(), NOW());
END IF;

    IF person_id_orwell IS NOT NULL AND book_id_1984 IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'authored' AND source_type = 'person' AND source_id = person_id_orwell AND target_type = 'book' AND target_id = book_id_1984) THEN
        INSERT INTO relationships (name, relationship_type, source_type, source_id, target_type, target_id, attributes, created_at, updated_at)
        VALUES ('George Orwell authored 1984', 'authored', 'person', person_id_orwell, 'book', book_id_1984,
                '{"year": 1949, "publisher": "Secker & Warburg"}',
                NOW(), NOW());
END IF;

    IF person_id_fitzgerald IS NOT NULL AND book_id_gatsby IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'authored' AND source_type = 'person' AND source_id = person_id_fitzgerald AND target_type = 'book' AND target_id = book_id_gatsby) THEN
        INSERT INTO relationships (name, relationship_type, source_type, source_id, target_type, target_id, attributes, created_at, updated_at)
        VALUES ('F. Scott Fitzgerald authored The Great Gatsby', 'authored', 'person', person_id_fitzgerald, 'book', book_id_gatsby,
                '{"year": 1925, "publisher": "Charles Scribner''s Sons"}',
                NOW(), NOW());
END IF;

    IF person_id_austen IS NOT NULL AND book_id_pride IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'authored' AND source_type = 'person' AND source_id = person_id_austen AND target_type = 'book' AND target_id = book_id_pride) THEN
        INSERT INTO relationships (name, relationship_type, source_type, source_id, target_type, target_id, attributes, created_at, updated_at)
        VALUES ('Jane Austen authored Pride and Prejudice', 'authored', 'person', person_id_austen, 'book', book_id_pride,
                '{"year": 1813, "publisher": "T. Egerton, Whitehall"}',
                NOW(), NOW());
END IF;

    -- Critic relationship
    IF person_id_smith IS NOT NULL AND book_id_mockingbird IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'reviewed' AND source_type = 'person' AND source_id = person_id_smith AND target_type = 'book' AND target_id = book_id_mockingbird) THEN
        INSERT INTO relationships (name, relationship_type, source_type, source_id, target_type, target_id, attributes, created_at, updated_at)
        VALUES ('John Smith reviewed To Kill a Mockingbird', 'reviewed', 'person', person_id_smith, 'book', book_id_mockingbird,
                '{"date": "2022-05-10", "rating": 5, "publication": "Literary Review Quarterly"}',
                NOW(), NOW());
END IF;

    -- Books similarity relationship
    IF book_id_1984 IS NOT NULL AND book_id_mockingbird IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'similar_themes' AND source_type = 'book' AND source_id = book_id_1984 AND target_type = 'book' AND target_id = book_id_mockingbird) THEN
        INSERT INTO relationships (name, relationship_type, source_type, source_id, target_type, target_id, attributes, created_at, updated_at)
        VALUES ('1984 and To Kill a Mockingbird share themes', 'similar_themes', 'book', book_id_1984, 'book', book_id_mockingbird,
                '{"themes": ["social justice", "moral courage"], "similarity_score": 0.72}',
                NOW(), NOW());
END IF;

    -- Books series/collection relationship (example of a meta-relationship)
    IF book_id_1984 IS NOT NULL AND book_id_gatsby IS NOT NULL AND book_id_mockingbird IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'collection' AND source_type = 'book' AND source_id = book_id_1984 AND target_type = 'collection' AND target_id = 1) THEN
        -- Create a virtual "collection" entity first in relationships
        IF NOT EXISTS (SELECT 1 FROM relationships WHERE name = 'Classic Fiction Collection' AND relationship_type = 'collection_definition') THEN
            INSERT INTO relationships (name, relationship_type, source_type, source_id, target_type, target_id, attributes, created_at, updated_at)
            VALUES ('Classic Fiction Collection', 'collection_definition', 'collection', 1, 'collection', 1,
                    '{"description": "Notable classic fiction works", "curator": "Literary Canon Committee"}',
                    NOW(), NOW());
END IF;

        -- Now add books to this collection
INSERT INTO relationships (name, relationship_type, source_type, source_id, target_type, target_id, attributes, created_at, updated_at)
VALUES ('1984 in Classic Fiction Collection', 'collection', 'book', book_id_1984, 'collection', 1,
        '{"added_date": "2023-01-15", "position": 1}',
        NOW(), NOW());

INSERT INTO relationships (name, relationship_type, source_type, source_id, target_type, target_id, attributes, created_at, updated_at)
VALUES ('The Great Gatsby in Classic Fiction Collection', 'collection', 'book', book_id_gatsby, 'collection', 1,
        '{"added_date": "2023-01-15", "position": 2}',
        NOW(), NOW());

INSERT INTO relationships (name, relationship_type, source_type, source_id, target_type, target_id, attributes, created_at, updated_at)
VALUES ('To Kill a Mockingbird in Classic Fiction Collection', 'collection', 'book', book_id_mockingbird, 'collection', 1,
        '{"added_date": "2023-01-15", "position": 3}',
        NOW(), NOW());
END IF;
END
$$;
