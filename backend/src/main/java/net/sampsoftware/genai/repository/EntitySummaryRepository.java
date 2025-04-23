package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.EntitySummary;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntitySummaryRepository extends JpaRepository<EntitySummary, Long> {}
