package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.Prompt;
import net.sampsoftware.genai.model.PromptType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromptRepository extends JpaRepository<Prompt, Integer> {
    
    /**
     * Find all active (non-deleted) prompts
     */
    @Query("SELECT p FROM Prompt p WHERE p.deletedDate IS NULL ORDER BY p.createdAt DESC")
    List<Prompt> findAllActive();
    
    /**
     * Find all active prompts by type
     */
    @Query("SELECT p FROM Prompt p WHERE p.deletedDate IS NULL AND p.type = :type ORDER BY p.createdAt DESC")
    List<Prompt> findAllActiveByType(PromptType type);
    
    /**
     * Find active prompts by name (partial match)
     */
    @Query("SELECT p FROM Prompt p WHERE p.deletedDate IS NULL AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) ORDER BY p.createdAt DESC")
    List<Prompt> findActiveByNameContaining(String name);
    
    /**
     * Find by ID (includes deleted records - used for get by ID endpoint)
     */
    @Override
    Optional<Prompt> findById(Integer id);
    
    /**
     * Find active prompt by exact name
     */
    @Query("SELECT p FROM Prompt p WHERE p.deletedDate IS NULL AND p.name = :name ORDER BY p.createdAt DESC")
    Optional<Prompt> findActiveByName(String name);
    
    /**
     * Count active prompts
     */
    @Query("SELECT COUNT(p) FROM Prompt p WHERE p.deletedDate IS NULL")
    long countActive();
    
    /**
     * Count active prompts by type
     */
    @Query("SELECT COUNT(p) FROM Prompt p WHERE p.deletedDate IS NULL AND p.type = :type")
    long countActiveByType(PromptType type);
}