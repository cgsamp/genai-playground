package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.ModelConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModelConfigurationRepository extends JpaRepository<ModelConfiguration, Long> {}
