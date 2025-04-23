package net.sampsoftware.genai.controller;

import net.sampsoftware.genai.model.Model;
import net.sampsoftware.genai.repository.ModelRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/models")
public class ModelController {
    private final ModelRepository repo;
    public ModelController(ModelRepository repo) { this.repo = repo; }

    @GetMapping public List<Model> all() { return repo.findAll(); }
    @GetMapping("/{id}") public Model one(@PathVariable Long id) { return repo.findById(id).orElseThrow(); }
    @PostMapping public Model create(@RequestBody Model m) { return repo.save(m); }
    @PutMapping("/{id}") public Model update(@PathVariable Long id, @RequestBody Model m) {
        m.setId(id); return repo.save(m);
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
