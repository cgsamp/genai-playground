package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.Model;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ModelRepository extends JpaRepository<Model, Long> {
    Optional<Model> findByModelNameAndModelProvider(String modelName, String modelProvider);
    boolean existsByModelNameAndModelProvider(String modelName, String modelProvider);

}
