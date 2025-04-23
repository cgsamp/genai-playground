package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {}
