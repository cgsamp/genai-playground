package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.dto.SummaryDto;
import net.sampsoftware.genai.model.EntitySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntitySummaryRepository extends JpaRepository<EntitySummary, Long> {

    @Query("""
        SELECT new net.sampsoftware.genai.dto.SummaryDto(
            es.id, es.entityId, es.summary,
            m.modelName, es.createdAt
        )
        FROM EntitySummary es
        JOIN es.modelConfiguration mc
        JOIN mc.model m
        WHERE es.entity = :entity
        AND es.entityId IN :entityIds
    """)
    List<SummaryDto> findSummariesByEntityAndIds(
        @Param("entity") String entity,
        @Param("entityIds") List<Long> entityIds
    );
}
