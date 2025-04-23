package net.sampsoftware.genai.controller;

import net.sampsoftware.genai.model.RankedBook;
import net.sampsoftware.genai.repository.RankedBookRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class RankedBookController {
    private final RankedBookRepository repo;
    public RankedBookController(RankedBookRepository repo) { this.repo = repo; }

    @GetMapping public List<RankedBook> all() { return repo.findAll(); }
    @GetMapping("/list/{sourceId}") public List<RankedBook> byList(@PathVariable Long sourceId) {
        return repo.findBySourceIdOrderByRankAsc(sourceId);
    }
    @PostMapping public RankedBook create(@RequestBody RankedBook b) { return repo.save(b); }
    @PutMapping("/{id}") public RankedBook update(@PathVariable Long id, @RequestBody RankedBook b) {
        b.setId(id); return repo.save(b);
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
