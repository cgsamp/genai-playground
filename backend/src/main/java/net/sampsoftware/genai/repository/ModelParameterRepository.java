package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.ModelParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModelParameterRepository extends JpaRepository<ModelParameter, Long> {
    
    /**
     * Find parameters for a specific model, ordered by display order
     */
    List<ModelParameter> findByModelIdOrderByDisplayOrder(Long modelId);
}