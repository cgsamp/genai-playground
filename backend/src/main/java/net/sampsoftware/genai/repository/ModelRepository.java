package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.Model;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModelRepository extends JpaRepository<Model, Long> {}
