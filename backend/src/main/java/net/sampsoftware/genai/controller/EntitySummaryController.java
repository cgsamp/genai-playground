package net.sampsoftware.genai.controller;

import net.sampsoftware.genai.model.EntitySummary;
import net.sampsoftware.genai.repository.EntitySummaryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/summaries")
public class EntitySummaryController {
    private final EntitySummaryRepository repo;
    public EntitySummaryController(EntitySummaryRepository repo) { this.repo = repo; }

    @GetMapping public List<EntitySummary> all() { return repo.findAll(); }
    @GetMapping("/{id}") public EntitySummary one(@PathVariable Long id) { return repo.findById(id).orElseThrow(); }
    @PostMapping public EntitySummary create(@RequestBody EntitySummary s) { return repo.save(s); }
    @PutMapping("/{id}") public EntitySummary update(@PathVariable Long id, @RequestBody EntitySummary s) {
        s.setId(id); return repo.save(s);
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
