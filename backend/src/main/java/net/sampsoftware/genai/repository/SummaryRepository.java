package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.Summary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SummaryRepository extends JpaRepository<Summary, Long> {

    // Find one with all details
    @Query("SELECT s FROM Summary s JOIN FETCH s.modelConfiguration mc JOIN FETCH mc.model WHERE s.id = :id")
    Optional<Summary> findByIdWithDetails(@Param("id") Long id);

    // Find all for a specific entity type
    List<Summary> findByEntityType(String entityType);

    // Find all for specific entity type and multiple entity ids
    List<Summary> findByEntityTypeAndEntityIdIn(String entityType, List<Long> entityIds);

    // Find all with model details
    @Query("SELECT s FROM Summary s JOIN FETCH s.modelConfiguration mc JOIN FETCH mc.model")
    List<Summary> findAllWithDetails();

    // Find all by entity type with model details
    @Query("SELECT s FROM Summary s JOIN FETCH s.modelConfiguration mc JOIN FETCH mc.model WHERE s.entityType = :entityType")
    List<Summary> findByEntityTypeWithDetails(@Param("entityType") String entityType);

    // Get all unique entity types
    @Query("SELECT DISTINCT s.entityType FROM Summary s")
    List<String> findAllDistinctEntityTypes();
}
