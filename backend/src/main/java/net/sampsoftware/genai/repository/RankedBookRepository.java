package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.RankedBook;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RankedBookRepository extends JpaRepository<RankedBook, Long> {
    List<RankedBook> findBySourceIdOrderByRankAsc(Long sourceId);
}
