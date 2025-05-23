package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for the item model
 * Replaces separate BookRepository, PersonRepository, etc.
 */
@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByItemType(String itemType);
    List<Item> findByItemTypeOrderByName(String itemType);
    List<Item> findByItemTypeAndNameContainingIgnoreCase(String itemType, String name);
    Optional<Item> findByItemTypeAndExternalId(String itemType, String externalId);
    List<Item> findByCreator(String creator);
    List<Item> findByCreatorContainingIgnoreCase(String creator);
    List<Item> findByCreatedYear(String createdYear);
    List<Item> findBySource(String source);
    List<Item> findByItemTypeIn(List<String> itemTypes);

    // === JSONB ATTRIBUTE QUERIES ===

    @Query("SELECT i FROM Item i WHERE i.itemType = :itemType AND " +
            "JSON_EXTRACT(i.attributes, '$.rank') = :rank")
    List<Item> findByItemTypeAndRank(@Param("itemType") String itemType,
                                     @Param("rank") Integer rank);

    @Query("SELECT i FROM Item i WHERE i.itemType = :itemType AND " +
            "JSON_EXTRACT(i.attributes, '$.isbn') = :isbn")
    Optional<Item> findByItemTypeAndIsbn(@Param("itemType") String itemType,
                                         @Param("isbn") String isbn);

    @Query("SELECT i FROM Item i WHERE i.itemType = :itemType AND " +
            "JSON_EXTRACT(i.attributes, '$.email') = :email")
    Optional<Item> findByItemTypeAndEmail(@Param("itemType") String itemType,
                                          @Param("email") String email);

    @Query("SELECT i FROM Item i WHERE i.itemType = :itemType AND " +
            "JSON_EXTRACT(i.attributes, '$.doi') = :doi")
    Optional<Item> findByItemTypeAndDoi(@Param("itemType") String itemType,
                                        @Param("doi") String doi);

    @Query("SELECT i FROM Item i WHERE i.itemType = :itemType AND " +
            "JSON_EXTRACT(i.attributes, '$.imdb_id') = :imdbId")
    Optional<Item> findByItemTypeAndImdbId(@Param("itemType") String itemType,
                                           @Param("imdbId") String imdbId);


    default List<Item> findAllBooks() {
        return findByItemType("book");
    }

    default List<Item> findAllRankedBooks() {
        return findByItemType("ranked_book");
    }

    default List<Item> findAllPeople() {
        return findByItemType("person");
    }

    default List<Item> findAllMovies() {
        return findByItemType("movie");
    }

    default List<Item> findAllPapers() {
        return findByItemType("academic_paper");
    }

    default List<Item> findBooksByAuthor(String author) {
        return findByItemTypeAndCreator("book", author);
    }

    default List<Item> findMoviesByDirector(String director) {
        return findByItemTypeAndCreator("movie", director);
    }

    // === ADVANCED QUERIES ===

    @Query("SELECT DISTINCT i.itemType FROM Item i ORDER BY i.itemType")
    List<String> findAllItemTypes();

    @Query("SELECT DISTINCT i.creator FROM Item i WHERE i.creator IS NOT NULL ORDER BY i.creator")
    List<String> findAllCreators();

    @Query("SELECT DISTINCT i.createdYear FROM Item i WHERE i.createdYear IS NOT NULL ORDER BY i.createdYear")
    List<String> findAllCreatedYears();

    @Query("SELECT COUNT(i) FROM Item i WHERE i.itemType = :itemType")
    Long countByItemType(@Param("itemType") String itemType);

    // === SEARCH METHODS ===

    @Query("SELECT i FROM Item i WHERE " +
            "(:itemType IS NULL OR i.itemType = :itemType) AND " +
            "(:searchTerm IS NULL OR " +
            " LOWER(i.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            " LOWER(i.creator) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            " LOWER(i.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Item> searchItems(@Param("itemType") String itemType,
                           @Param("searchTerm") String searchTerm);

    // === BULK OPERATIONS ===

    @Query("DELETE FROM Item i WHERE i.itemType = :itemType")
    void deleteAllByItemType(@Param("itemType") String itemType);

    // === HELPER METHOD IMPLEMENTATIONS ===

    default List<Item> findByItemTypeAndCreator(String itemType, String creator) {
        return findByItemType(itemType).stream()
                .filter(i -> creator.equals(i.getCreator()))
                .toList();
    }
}
