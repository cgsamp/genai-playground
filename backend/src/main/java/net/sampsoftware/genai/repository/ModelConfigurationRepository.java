package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.ModelConfiguration;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ModelConfigurationRepository extends JpaRepository<ModelConfiguration, Long> {

    @Query("SELECT c FROM ModelConfiguration c JOIN FETCH c.model WHERE c.id = :id")
    Optional<ModelConfiguration> findByIdWithModel(@Param("id") Long id);

    @Query("SELECT c FROM ModelConfiguration c JOIN FETCH c.model")
    List<ModelConfiguration> findAllWithModels();


}
