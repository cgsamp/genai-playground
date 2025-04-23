package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.BookRankSource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRankSourceRepository extends JpaRepository<BookRankSource, Long> {}
