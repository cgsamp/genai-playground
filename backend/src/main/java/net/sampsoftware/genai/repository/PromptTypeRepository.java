package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.PromptType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromptTypeRepository extends JpaRepository<PromptType, Integer> {
    
    Optional<PromptType> findByPromptType(String promptType);
    
    boolean existsByPromptType(String promptType);
}