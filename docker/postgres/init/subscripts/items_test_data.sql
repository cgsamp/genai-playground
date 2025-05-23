-- docker/postgres/init/subscripts/items_test_data.sql
-- Unified test data for the items table

-- Insert books as items
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM items WHERE item_type = 'book' AND name = 'To Kill a Mockingbird') THEN
        INSERT INTO items (item_type, name, creator, created_year, attributes, created_at, updated_at)
        VALUES ('book', 'To Kill a Mockingbird', 'Harper Lee', '1960',
                '{"genre": "Fiction", "tags": ["classic", "southern"], "rank": 1, "pages": 281, "isbn": "978-0-06-112008-4"}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM items WHERE item_type = 'book' AND name = '1984') THEN
        INSERT INTO items (item_type, name, creator, created_year, attributes, created_at, updated_at)
        VALUES ('book', '1984', 'George Orwell', '1949',
                '{"genre": "Dystopian", "tags": ["political", "classic"], "rank": 2, "pages": 328, "isbn": "978-0-452-28423-4"}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM items WHERE item_type = 'book' AND name = 'The Great Gatsby') THEN
        INSERT INTO items (item_type, name, creator, created_year, attributes, created_at, updated_at)
        VALUES ('book', 'The Great Gatsby', 'F. Scott Fitzgerald', '1925',
                '{"genre": "Fiction", "tags": ["classic", "american"], "rank": 3, "pages": 180, "isbn": "978-0-7432-7356-5"}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM items WHERE item_type = 'book' AND name = 'Pride and Prejudice') THEN
        INSERT INTO items (item_type, name, creator, created_year, attributes, created_at, updated_at)
        VALUES ('book', 'Pride and Prejudice', 'Jane Austen', '1813',
                '{"genre": "Romance", "tags": ["classic", "regency"], "rank": 4, "pages": 432, "isbn": "978-0-14-143951-8"}',
                NOW(), NOW());
END IF;

    -- Add some ranked books from NY Times list
    IF NOT EXISTS (SELECT 1 FROM items WHERE item_type = 'ranked_book' AND name = 'My Brilliant Friend') THEN
        INSERT INTO items (item_type, name, creator, created_year, source, attributes, created_at, updated_at)
        VALUES ('ranked_book', 'My Brilliant Friend', 'Elena Ferrante', '2012', 'New York Times',
                '{"rank": 1, "list_date": "2024-07-08", "genre": "Fiction", "list_name": "Best of 21st Century"}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM items WHERE item_type = 'ranked_book' AND name = 'The Warmth of Other Suns') THEN
        INSERT INTO items (item_type, name, creator, created_year, source, attributes, created_at, updated_at)
        VALUES ('ranked_book', 'The Warmth of Other Suns', 'Isabel Wilkerson', '2010', 'New York Times',
                '{"rank": 2, "list_date": "2024-07-08", "genre": "Non-fiction", "list_name": "Best of 21st Century"}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM items WHERE item_type = 'ranked_book' AND name = 'Wolf Hall') THEN
        INSERT INTO items (item_type, name, creator, created_year, source, attributes, created_at, updated_at)
        VALUES ('ranked_book', 'Wolf Hall', 'Hilary Mantel', '2009', 'New York Times',
                '{"rank": 3, "list_date": "2024-07-08", "genre": "Historical Fiction", "list_name": "Best of 21st Century"}',
                NOW(), NOW());
END IF;
END
$$;

-- Insert people as items
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM items WHERE item_type = 'person' AND name = 'Harper Lee') THEN
        INSERT INTO items (item_type, name, attributes, created_at, updated_at)
        VALUES ('person', 'Harper Lee',
                '{"email": "harper.lee@example.com", "birth_date": "1926-04-28", "occupation": "Author", "nationality": "American", "awards": ["Pulitzer Prize"], "biography": "Nelle Harper Lee was an American novelist..."}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM items WHERE item_type = 'person' AND name = 'George Orwell') THEN
        INSERT INTO items (item_type, name, attributes, created_at, updated_at)
        VALUES ('person', 'George Orwell',
                '{"email": "george.orwell@example.com", "birth_date": "1903-06-25", "occupation": "Author", "nationality": "British", "real_name": "Eric Arthur Blair", "biography": "English novelist and essayist..."}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM items WHERE item_type = 'person' AND name = 'F. Scott Fitzgerald') THEN
        INSERT INTO items (item_type, name, attributes, created_at, updated_at)
        VALUES ('person', 'F. Scott Fitzgerald',
                '{"email": "scott.fitzgerald@example.com", "birth_date": "1896-09-24", "occupation": "Author", "nationality": "American", "biography": "American novelist, essayist, and short story writer..."}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM items WHERE item_type = 'person' AND name = 'Jane Austen') THEN
        INSERT INTO items (item_type, name, attributes, created_at, updated_at)
        VALUES ('person', 'Jane Austen',
                '{"email": "jane.austen@example.com", "birth_date": "1775-12-16", "occupation": "Author", "nationality": "British", "biography": "English novelist known primarily for her six major novels..."}',
                NOW(), NOW());
END IF;

    IF NOT EXISTS (SELECT 1 FROM items WHERE item_type = 'person' AND name = 'John Smith') THEN
        INSERT INTO items (item_type, name, attributes, created_at, updated_at)
        VALUES ('person', 'John Smith',
                '{"email": "john.smith@example.com", "birth_date": "1980-05-15", "occupation": "Literary Critic", "education": "PhD in Literature", "specialization": "20th Century Fiction"}',
                NOW(), NOW());
END IF;
END
$$;

-- Create summaries for the items
DO $$
DECLARE
book_id_mockingbird BIGINT;
    book_id_1984 BIGINT;
BEGIN
    -- Get IDs of existing books
SELECT id INTO book_id_mockingbird FROM items WHERE item_type = 'book' AND name = 'To Kill a Mockingbird';
SELECT id INTO book_id_1984 FROM items WHERE item_type = 'book' AND name = '1984';

IF book_id_mockingbird IS NOT NULL AND NOT EXISTS (SELECT 1 FROM summaries WHERE item_id = book_id_mockingbird) THEN
        INSERT INTO summaries (name, item_id, content, source, attributes, created_at, updated_at)
        VALUES ('Classic Summary of To Kill a Mockingbird', book_id_mockingbird,
                'Set in the 1930s Alabama, this novel follows Scout Finch and her father Atticus, a lawyer defending a Black man accused of raping a white woman. The story explores themes of racial injustice, moral growth, and the loss of innocence.',
                'ClassicLiteratureGuide',
                '{"quality_score": 4.8, "word_count": 42}',
                NOW(), NOW());
END IF;

    IF book_id_mockingbird IS NOT NULL AND NOT EXISTS (SELECT 1 FROM summaries WHERE item_id = book_id_mockingbird AND source = 'AI-Generated') THEN
        INSERT INTO summaries (name, item_id, content, source, attributes, created_at, updated_at)
        VALUES ('AI Summary of To Kill a Mockingbird', book_id_mockingbird,
                'Harper Lee''s powerful novel explores racial prejudice and moral complexity through the eyes of a young girl in Depression-era Alabama. The narrative centers around her father''s legal defense of a Black man falsely accused of a crime, revealing deep social divides and the importance of empathy and moral courage.',
                'AI-Generated',
                '{"quality_score": 4.2, "word_count": 51, "model": "GPT-4"}',
                NOW(), NOW());
END IF;

    IF book_id_1984 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM summaries WHERE item_id = book_id_1984) THEN
        INSERT INTO summaries (name, item_id, content, source, attributes, created_at, updated_at)
        VALUES ('Summary of 1984', book_id_1984,
                'Orwell''s dystopian masterpiece depicts a totalitarian future where Big Brother watches everyone and the Thought Police suppress individualism. The protagonist Winston Smith rebels against the Party by falling in love and keeping a diary, only to face the horrific consequences of challenging the system.',
                'LiteraryArchive',
                '{"quality_score": 4.9, "word_count": 47}',
                NOW(), NOW());
END IF;
END
$$;

-- Create relationships between items
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
    collection_id BIGINT;
BEGIN
    -- Get IDs of existing entities
SELECT id INTO book_id_mockingbird FROM items WHERE item_type = 'book' AND name = 'To Kill a Mockingbird';
SELECT id INTO book_id_1984 FROM items WHERE item_type = 'book' AND name = '1984';
SELECT id INTO book_id_gatsby FROM items WHERE item_type = 'book' AND name = 'The Great Gatsby';
SELECT id INTO book_id_pride FROM items WHERE item_type = 'book' AND name = 'Pride and Prejudice';

SELECT id INTO person_id_lee FROM items WHERE item_type = 'person' AND name = 'Harper Lee';
SELECT id INTO person_id_orwell FROM items WHERE item_type = 'person' AND name = 'George Orwell';
SELECT id INTO person_id_fitzgerald FROM items WHERE item_type = 'person' AND name = 'F. Scott Fitzgerald';
SELECT id INTO person_id_austen FROM items WHERE item_type = 'person' AND name = 'Jane Austen';
SELECT id INTO person_id_smith FROM items WHERE item_type = 'person' AND name = 'John Smith';

-- Create a collection as an item
IF NOT EXISTS (SELECT 1 FROM items WHERE item_type = 'collection' AND name = 'Classic Fiction Collection') THEN
        INSERT INTO items (item_type, name, description, attributes, created_at, updated_at)
        VALUES ('collection', 'Classic Fiction Collection', 'Notable classic fiction works',
                '{"curator": "Literary Canon Committee", "created_date": "2023-01-15"}',
                NOW(), NOW());
END IF;

SELECT id INTO collection_id FROM items WHERE item_type = 'collection' AND name = 'Classic Fiction Collection';

-- Author relationships
IF person_id_lee IS NOT NULL AND book_id_mockingbird IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'authored' AND source_item_id = person_id_lee AND target_item_id = book_id_mockingbird) THEN
        INSERT INTO relationships (name, relationship_type, source_item_id, target_item_id, attributes, created_at, updated_at)
        VALUES ('Harper Lee authored To Kill a Mockingbird', 'authored', person_id_lee, book_id_mockingbird,
                '{"year": 1960, "publisher": "J. B. Lippincott & Co."}',
                NOW(), NOW());
END IF;

    IF person_id_orwell IS NOT NULL AND book_id_1984 IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'authored' AND source_item_id = person_id_orwell AND target_item_id = book_id_1984) THEN
        INSERT INTO relationships (name, relationship_type, source_item_id, target_item_id, attributes, created_at, updated_at)
        VALUES ('George Orwell authored 1984', 'authored', person_id_orwell, book_id_1984,
                '{"year": 1949, "publisher": "Secker & Warburg"}',
                NOW(), NOW());
END IF;

    -- Collection relationships
    IF collection_id IS NOT NULL THEN
        -- Create collection definition relationship
        IF NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'collection_definition' AND target_item_id = collection_id) THEN
            INSERT INTO relationships (name, relationship_type, source_item_id, target_item_id, attributes, created_at, updated_at)
            VALUES ('Classic Fiction Collection Definition', 'collection_definition', collection_id, collection_id,
                    '{"description": "Notable classic fiction works", "curator": "Literary Canon Committee"}',
                    NOW(), NOW());
END IF;

        -- Add books to collection
        IF book_id_1984 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'collection' AND source_item_id = book_id_1984 AND target_item_id = collection_id) THEN
            INSERT INTO relationships (name, relationship_type, source_item_id, target_item_id, attributes, created_at, updated_at)
            VALUES ('1984 in Classic Fiction Collection', 'collection', book_id_1984, collection_id,
                    '{"added_date": "2023-01-15", "position": 1}',
                    NOW(), NOW());
END IF;

        IF book_id_gatsby IS NOT NULL AND NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'collection' AND source_item_id = book_id_gatsby AND target_item_id = collection_id) THEN
            INSERT INTO relationships (name, relationship_type, source_item_id, target_item_id, attributes, created_at, updated_at)
            VALUES ('The Great Gatsby in Classic Fiction Collection', 'collection', book_id_gatsby, collection_id,
                    '{"added_date": "2023-01-15", "position": 2}',
                    NOW(), NOW());
END IF;

        IF book_id_mockingbird IS NOT NULL AND NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'collection' AND source_item_id = book_id_mockingbird AND target_item_id = collection_id) THEN
            INSERT INTO relationships (name, relationship_type, source_item_id, target_item_id, attributes, created_at, updated_at)
            VALUES ('To Kill a Mockingbird in Classic Fiction Collection', 'collection', book_id_mockingbird, collection_id,
                    '{"added_date": "2023-01-15", "position": 3}',
                    NOW(), NOW());
END IF;
END IF;

    -- Thematic similarity relationship
    IF book_id_1984 IS NOT NULL AND book_id_mockingbird IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'similar_themes' AND source_item_id = book_id_1984 AND target_item_id = book_id_mockingbird) THEN
        INSERT INTO relationships (name, relationship_type, source_item_id, target_item_id, attributes, created_at, updated_at)
        VALUES ('1984 and To Kill a Mockingbird share themes', 'similar_themes', book_id_1984, book_id_mockingbird,
                '{"themes": ["social justice", "moral courage"], "similarity_score": 0.72}',
                NOW(), NOW());
END IF;

    -- Critic review relationship
    IF person_id_smith IS NOT NULL AND book_id_mockingbird IS NOT NULL AND
       NOT EXISTS (SELECT 1 FROM relationships WHERE relationship_type = 'reviewed' AND source_item_id = person_id_smith AND target_item_id = book_id_mockingbird) THEN
        INSERT INTO relationships (name, relationship_type, source_item_id, target_item_id, attributes, created_at, updated_at)
        VALUES ('John Smith reviewed To Kill a Mockingbird', 'reviewed', person_id_smith, book_id_mockingbird,
                '{"date": "2022-05-10", "rating": 5, "publication": "Literary Review Quarterly"}',
                NOW(), NOW());
END IF;
END
$$;
