package net.sampsoftware.genai.controller;

import net.sampsoftware.genai.model.BookRankSource;
import net.sampsoftware.genai.repository.BookRankSourceRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sources")
public class BookRankSourceController {
    private final BookRankSourceRepository repo;
    public BookRankSourceController(BookRankSourceRepository repo) { this.repo = repo; }

    @GetMapping public List<BookRankSource> all() { return repo.findAll(); }
    @GetMapping("/{id}") public BookRankSource one(@PathVariable Long id) { return repo.findById(id).orElseThrow(); }
    @PostMapping public BookRankSource create(@RequestBody BookRankSource s) { return repo.save(s); }
    @PutMapping("/{id}") public BookRankSource update(@PathVariable Long id, @RequestBody BookRankSource s) {
        s.setId(id); return repo.save(s);
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
